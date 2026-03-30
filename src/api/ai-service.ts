import { useAIModelStore } from '@/stores/aiModelStore';
import { generateId } from '@/lib/utils';
import type {
  AIProvider,
  AIModelDefinition,
  ChatCompletionRequest,
  ImageGenerationRequest,
  ImageGenerationResult,
  ConnectionTestResult,
  StreamEvent,
} from '@/types/ai-models';

// ---------------------------------------------------------------------------
// Request queue with concurrency control
// ---------------------------------------------------------------------------

interface QueueItem {
  id: string;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

class RequestQueue {
  private queue: QueueItem[] = [];
  private running = 0;
  private maxConcurrency: number;

  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
  }

  enqueue<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        id: generateId(),
        execute: fn as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.process();
    });
  }

  private async process() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) return;

    const item = this.queue.shift()!;
    this.running++;

    try {
      const result = await item.execute();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    } finally {
      this.running--;
      this.process();
    }
  }
}

const requestQueue = new RequestQueue(3);

// ---------------------------------------------------------------------------
// Retry logic
// ---------------------------------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  baseDelayMs = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        // Check if error is retryable
        if (err instanceof AIServiceError && !err.retryable) throw err;
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------

export class AIServiceError extends Error {
  public statusCode?: number;
  public provider?: AIProvider;
  public retryable: boolean;

  constructor(
    message: string,
    statusCode?: number,
    provider?: AIProvider,
    retryable = false,
  ) {
    super(message);
    this.name = 'AIServiceError';
    this.statusCode = statusCode;
    this.provider = provider;
    this.retryable = retryable;
  }
}

// ---------------------------------------------------------------------------
// Helpers: resolve provider config and API key
// ---------------------------------------------------------------------------

function getProviderConfigAndKey(provider: AIProvider) {
  const store = useAIModelStore.getState();
  const cfg = store.getProvider(provider);
  if (!cfg) throw new AIServiceError(`Provider ${provider} not configured`, undefined, provider);
  if (!cfg.enabled) throw new AIServiceError(`Provider ${provider} is disabled`, undefined, provider);

  const apiKey = store.getActiveKey(provider);
  // Local provider may not need a key
  if (!apiKey && provider !== 'local') {
    throw new AIServiceError(`No API key configured for ${provider}`, undefined, provider);
  }

  return { cfg, apiKey };
}

function buildHeaders(provider: AIProvider, apiKey: string | null, extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };

  if (apiKey) {
    switch (provider) {
      case 'openai':
      case 'custom':
      case 'replicate':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        headers['anthropic-dangerous-direct-browser-access'] = 'true';
        break;
      case 'stability':
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['Accept'] = 'application/json';
        break;
    }
  }

  return headers;
}

function markKeyUsed(provider: AIProvider) {
  const store = useAIModelStore.getState();
  const cfg = store.getProvider(provider);
  if (!cfg || cfg.apiKeys.length === 0) return;
  const activeKey = cfg.apiKeys[cfg.activeKeyIndex];
  if (activeKey) {
    store.updateProvider(provider, {
      apiKeys: cfg.apiKeys.map((k) =>
        k.id === activeKey.id ? { ...k, lastUsedAt: new Date().toISOString() } : k,
      ),
    });
  }
}

// ---------------------------------------------------------------------------
// SSE / Streaming parser
// ---------------------------------------------------------------------------

export interface StreamCallbacks {
  onContent: (text: string) => void;
  onAction?: (action: StreamEvent['action']) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
}

/**
 * Parse an SSE stream from a ReadableStream<Uint8Array>.
 * Handles OpenAI-style `data: {...}` lines and Anthropic-style `event:` lines.
 */
async function parseSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  provider: AIProvider,
  callbacks: StreamCallbacks,
): Promise<string> {
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    // Keep the last incomplete line in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(':')) continue;

      if (trimmed === 'data: [DONE]') {
        callbacks.onDone?.();
        return fullContent;
      }

      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const data = JSON.parse(jsonStr);
          const text = extractContentFromSSE(data, provider);
          if (text) {
            fullContent += text;
            callbacks.onContent(text);
          }

          // Check for action events embedded in the response
          if (data.action) {
            callbacks.onAction?.(data.action);
          }
        } catch {
          // Incomplete JSON or non-JSON data line -- skip
        }
      }

      // Anthropic event-based format
      if (trimmed.startsWith('event: ')) {
        const eventType = trimmed.slice(7);
        if (eventType === 'message_stop') {
          callbacks.onDone?.();
          return fullContent;
        }
        if (eventType === 'error') {
          callbacks.onError?.('Stream error from provider');
        }
      }
    }
  }

  callbacks.onDone?.();
  return fullContent;
}

function extractContentFromSSE(data: Record<string, unknown>, provider: AIProvider): string {
  switch (provider) {
    case 'openai':
    case 'custom': {
      // OpenAI: choices[0].delta.content
      const choices = data.choices as Array<{ delta?: { content?: string }; finish_reason?: string }> | undefined;
      return choices?.[0]?.delta?.content || '';
    }
    case 'anthropic': {
      // Anthropic: type=content_block_delta, delta.text
      if (data.type === 'content_block_delta') {
        const delta = data.delta as { text?: string } | undefined;
        return delta?.text || '';
      }
      return '';
    }
    case 'local': {
      // Ollama: message.content
      const message = data.message as { content?: string } | undefined;
      return message?.content || '';
    }
    default:
      return '';
  }
}

// ---------------------------------------------------------------------------
// Chat Completion (streaming)
// ---------------------------------------------------------------------------

export async function streamChatCompletion(
  request: ChatCompletionRequest,
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
): Promise<string> {
  const store = useAIModelStore.getState();
  const model = store.getModel(request.model);
  if (!model) throw new AIServiceError(`Model ${request.model} not found`);

  const { cfg, apiKey } = getProviderConfigAndKey(model.provider);
  const url = `${cfg.baseUrl}${model.endpointPath || '/chat/completions'}`;

  const body = buildChatRequestBody(model, request, cfg);
  const headers = buildHeaders(model.provider, apiKey, cfg.customHeaders);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    // If 401/403, mark key as failed and try rotation
    if (response.status === 401 || response.status === 403) {
      const activeKeyEntry = cfg.apiKeys[cfg.activeKeyIndex];
      if (activeKeyEntry) {
        store.markKeyFailed(model.provider, activeKeyEntry.id);
      }
    }
    throw new AIServiceError(
      `${cfg.displayName} API error (${response.status}): ${errorText}`,
      response.status,
      model.provider,
      response.status === 429 || response.status >= 500,
    );
  }

  markKeyUsed(model.provider);

  if (!response.body) {
    throw new AIServiceError('No response body received', undefined, model.provider);
  }

  const reader = response.body.getReader();
  return parseSSEStream(reader, model.provider, callbacks);
}

function buildChatRequestBody(
  model: AIModelDefinition,
  request: ChatCompletionRequest,
  cfg: { provider: AIProvider },
) {
  switch (cfg.provider) {
    case 'anthropic': {
      // Build Anthropic Messages API format
      const messages = request.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const systemPrompt = request.systemPrompt ||
        request.messages.find((m) => m.role === 'system')?.content;

      return {
        model: model.apiModelId,
        messages,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.7,
        stream: true,
      };
    }

    case 'local': {
      // Ollama format
      return {
        model: model.apiModelId,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
        options: {
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 2048,
        },
      };
    }

    case 'openai':
    case 'custom':
    default: {
      // OpenAI-compatible format
      const messages: Array<{ role: string; content: string }> = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      for (const m of request.messages) {
        messages.push({ role: m.role, content: m.content });
      }
      return {
        model: model.apiModelId,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Chat Completion (non-streaming, queued with retry)
// ---------------------------------------------------------------------------

export async function chatCompletion(
  request: ChatCompletionRequest,
): Promise<string> {
  return requestQueue.enqueue(() =>
    withRetry(async () => {
      const store = useAIModelStore.getState();
      const model = store.getModel(request.model);
      if (!model) throw new AIServiceError(`Model ${request.model} not found`);

      const { cfg, apiKey } = getProviderConfigAndKey(model.provider);
      const url = `${cfg.baseUrl}${model.endpointPath || '/chat/completions'}`;

      const body = buildChatRequestBody(model, { ...request, stream: false }, cfg);
      // Override stream to false
      (body as Record<string, unknown>).stream = false;

      const headers = buildHeaders(model.provider, apiKey, cfg.customHeaders);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        if (response.status === 401 || response.status === 403) {
          const activeKeyEntry = cfg.apiKeys[cfg.activeKeyIndex];
          if (activeKeyEntry) {
            store.markKeyFailed(model.provider, activeKeyEntry.id);
          }
        }
        throw new AIServiceError(
          `${cfg.displayName} API error (${response.status}): ${errorText}`,
          response.status,
          model.provider,
          response.status === 429 || response.status >= 500,
        );
      }

      markKeyUsed(model.provider);
      const data = await response.json();
      return extractNonStreamingContent(data, model.provider);
    }),
  ) as Promise<string>;
}

function extractNonStreamingContent(data: Record<string, unknown>, provider: AIProvider): string {
  switch (provider) {
    case 'anthropic': {
      const content = data.content as Array<{ text?: string }> | undefined;
      return content?.[0]?.text || '';
    }
    case 'local': {
      const message = data.message as { content?: string } | undefined;
      return message?.content || '';
    }
    case 'openai':
    case 'custom':
    default: {
      const choices = data.choices as Array<{ message?: { content?: string } }> | undefined;
      return choices?.[0]?.message?.content || '';
    }
  }
}

// ---------------------------------------------------------------------------
// Image generation (queued with retry)
// ---------------------------------------------------------------------------

export async function generateImage(
  request: ImageGenerationRequest,
): Promise<ImageGenerationResult> {
  return requestQueue.enqueue(() =>
    withRetry(async () => {
      const store = useAIModelStore.getState();
      const model = store.getModel(request.model);
      if (!model) throw new AIServiceError(`Model ${request.model} not found`);

      const { cfg, apiKey } = getProviderConfigAndKey(model.provider);

      switch (model.provider) {
        case 'openai':
          return generateImageOpenAI(cfg.baseUrl, apiKey!, model, request);
        case 'stability':
          return generateImageStability(cfg.baseUrl, apiKey!, model, request);
        default:
          throw new AIServiceError(`Image generation not supported for provider ${model.provider}`);
      }
    }),
  ) as Promise<ImageGenerationResult>;
}

async function generateImageOpenAI(
  baseUrl: string,
  apiKey: string,
  model: AIModelDefinition,
  request: ImageGenerationRequest,
): Promise<ImageGenerationResult> {
  const sizeStr = request.width && request.height
    ? `${request.width}x${request.height}`
    : '1024x1024';

  const body = {
    model: model.apiModelId,
    prompt: request.prompt,
    size: sizeStr,
    n: request.samples ?? 1,
    response_format: 'url',
  };

  const response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: buildHeaders('openai', apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new AIServiceError(`OpenAI image error (${response.status}): ${err}`, response.status, 'openai', response.status >= 500);
  }

  markKeyUsed('openai');
  const data = await response.json();
  const result = (data.data as Array<{ url?: string; revised_prompt?: string }>)?.[0];

  return {
    imageUrl: result?.url || '',
    revisedPrompt: result?.revised_prompt,
  };
}

async function generateImageStability(
  baseUrl: string,
  apiKey: string,
  model: AIModelDefinition,
  request: ImageGenerationRequest,
): Promise<ImageGenerationResult> {
  const body = {
    text_prompts: [
      { text: request.prompt, weight: 1 },
      ...(request.negativePrompt ? [{ text: request.negativePrompt, weight: -1 }] : []),
    ],
    cfg_scale: request.cfgScale ?? 7,
    width: request.width ?? 1024,
    height: request.height ?? 1024,
    steps: request.steps ?? 30,
    samples: request.samples ?? 1,
    ...(request.seed != null && request.seed >= 0 ? { seed: request.seed } : {}),
  };

  const endpoint = model.endpointPath || `/generation/${model.apiModelId}/text-to-image`;

  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    headers: buildHeaders('stability', apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new AIServiceError(`Stability API error (${response.status}): ${err}`, response.status, 'stability', response.status >= 500);
  }

  markKeyUsed('stability');
  const data = await response.json();
  const artifacts = data.artifacts as Array<{ base64?: string; seed?: number }> | undefined;
  const artifact = artifacts?.[0];

  if (!artifact?.base64) {
    throw new AIServiceError('No image data returned from Stability API', undefined, 'stability');
  }

  return {
    imageUrl: `data:image/png;base64,${artifact.base64}`,
    seed: artifact.seed,
  };
}

// ---------------------------------------------------------------------------
// Connection test
// ---------------------------------------------------------------------------

export async function testConnection(provider: AIProvider): Promise<ConnectionTestResult> {
  const start = performance.now();

  try {
    const store = useAIModelStore.getState();
    const cfg = store.getProvider(provider);
    if (!cfg) return { success: false, latencyMs: 0, error: 'Provider not configured' };

    const apiKey = store.getActiveKey(provider);

    switch (provider) {
      case 'openai': {
        if (!apiKey) return { success: false, latencyMs: 0, error: 'No API key' };
        const res = await fetch(`${cfg.baseUrl}/models`, {
          headers: buildHeaders('openai', apiKey),
        });
        const latencyMs = Math.round(performance.now() - start);
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return { success: false, latencyMs, error: `HTTP ${res.status}: ${errText.slice(0, 200)}` };
        }
        const data = await res.json();
        const modelName = (data.data as Array<{ id: string }>)?.[0]?.id;
        return { success: true, latencyMs, modelName };
      }

      case 'anthropic': {
        if (!apiKey) return { success: false, latencyMs: 0, error: 'No API key' };
        // Send a minimal request to verify the key works
        const res = await fetch(`${cfg.baseUrl}/messages`, {
          method: 'POST',
          headers: buildHeaders('anthropic', apiKey),
          body: JSON.stringify({
            model: 'claude-haiku-4-20250414',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        });
        const latencyMs = Math.round(performance.now() - start);
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return { success: false, latencyMs, error: `HTTP ${res.status}: ${errText.slice(0, 200)}` };
        }
        return { success: true, latencyMs, modelName: 'claude-haiku-4' };
      }

      case 'stability': {
        if (!apiKey) return { success: false, latencyMs: 0, error: 'No API key' };
        const res = await fetch(`${cfg.baseUrl}/engines/list`, {
          headers: buildHeaders('stability', apiKey),
        });
        const latencyMs = Math.round(performance.now() - start);
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          return { success: false, latencyMs, error: `HTTP ${res.status}: ${errText.slice(0, 200)}` };
        }
        return { success: true, latencyMs, modelName: 'Stability AI' };
      }

      case 'local': {
        // Check Ollama health endpoint
        const res = await fetch(`${cfg.baseUrl}/api/tags`);
        const latencyMs = Math.round(performance.now() - start);
        if (!res.ok) {
          return { success: false, latencyMs, error: `Ollama not reachable (${res.status})` };
        }
        const data = await res.json();
        const models = (data.models as Array<{ name: string }>)?.map((m) => m.name);
        return { success: true, latencyMs, modelName: models?.[0] || 'Ollama' };
      }

      case 'custom': {
        if (!cfg.baseUrl) return { success: false, latencyMs: 0, error: 'No base URL configured' };
        // Try listing models (OpenAI-compatible)
        const res = await fetch(`${cfg.baseUrl}/models`, {
          headers: apiKey ? buildHeaders('custom', apiKey) : { 'Content-Type': 'application/json' },
        });
        const latencyMs = Math.round(performance.now() - start);
        if (!res.ok) {
          return { success: false, latencyMs, error: `HTTP ${res.status}` };
        }
        return { success: true, latencyMs, modelName: 'Custom endpoint' };
      }

      default:
        return { success: false, latencyMs: 0, error: 'Unknown provider' };
    }
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : 'Connection failed';
    return { success: false, latencyMs, error: message };
  }
}

// ---------------------------------------------------------------------------
// System prompt builder for context-aware chat
// ---------------------------------------------------------------------------

export function buildSystemPrompt(contextNodes: Array<{ id: string; type: string; data: Record<string, unknown> }>): string {
  let prompt = `You are an AI assistant for a visual creative workspace. You help users create and modify canvas nodes (images, videos, text, audio).

When the user asks you to create content, respond naturally and include structured action blocks in your response using the following JSON format on a separate line prefixed with "ACTION:":

ACTION:{"type":"create_node","nodeType":"image","data":{"label":"...","prompt":"...","width":512,"height":512}}
ACTION:{"type":"create_node","nodeType":"video","data":{"label":"...","prompt":"...","duration":5}}
ACTION:{"type":"create_node","nodeType":"text","data":{"label":"...","content":"...","prompt":"..."}}
ACTION:{"type":"create_node","nodeType":"audio","data":{"label":"...","prompt":"...","duration":30}}
ACTION:{"type":"generate_image","prompt":"...","width":1024,"height":1024}
ACTION:{"type":"generate_video","prompt":"...","duration":5}

When the user asks to modify existing nodes (referenced in context), use:
ACTION:{"type":"update_node","nodeId":"...","data":{"prompt":"...","label":"..."}}
ACTION:{"type":"modify_prompt","nodeId":"...","prompt":"..."}

Important rules:
- Always provide a natural language explanation before any ACTION lines
- You can include multiple ACTION lines in one response
- Only include actions that are directly requested by the user
- Use descriptive prompts suitable for AI generation models
- Keep labels concise (under 30 characters)`;

  if (contextNodes.length > 0) {
    prompt += '\n\nCurrently selected nodes on the canvas:\n';
    for (const node of contextNodes) {
      prompt += `- [${node.type}] id="${node.id}" label="${node.data.label || ''}" prompt="${node.data.prompt || ''}"`;
      if (node.data.imageUrl) prompt += ` (has image)`;
      if (node.data.videoUrl) prompt += ` (has video)`;
      prompt += '\n';
    }
  }

  return prompt;
}

// ---------------------------------------------------------------------------
// Parse AI response for action blocks
// ---------------------------------------------------------------------------

export interface ParsedAIResponse {
  message: string;
  actions: Array<Record<string, unknown>>;
}

export function parseAIResponseActions(text: string): ParsedAIResponse {
  const lines = text.split('\n');
  const messageLines: string[] = [];
  const actions: Array<Record<string, unknown>> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('ACTION:')) {
      try {
        const json = JSON.parse(trimmed.slice(7));
        actions.push(json);
      } catch {
        // Malformed action line, treat as regular text
        messageLines.push(line);
      }
    } else {
      messageLines.push(line);
    }
  }

  return {
    message: messageLines.join('\n').trim(),
    actions,
  };
}
