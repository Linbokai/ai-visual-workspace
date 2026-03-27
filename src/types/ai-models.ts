// ---------------------------------------------------------------------------
// AI Model type definitions for multi-provider support
// ---------------------------------------------------------------------------

/** Supported AI provider identifiers */
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'stability'
  | 'replicate'
  | 'local'
  | 'custom';

/** Capability categories a model can support */
export type ModelCapability =
  | 'text-generation'
  | 'image-generation'
  | 'image-editing'
  | 'video-generation'
  | 'audio-generation'
  | 'vision';

/** Parameter type for model configuration UI */
export type ParamType = 'number' | 'string' | 'select' | 'boolean';

/** A single parameter definition for a model */
export interface ModelParam {
  key: string;
  label: string;
  type: ParamType;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string | number }[];
  description?: string;
}

/** Resolution preset for image/video models */
export interface ResolutionPreset {
  label: string;
  width: number;
  height: number;
}

/** A registered AI model definition */
export interface AIModelDefinition {
  id: string;
  name: string;
  provider: AIProvider;
  capabilities: ModelCapability[];
  description: string;
  /** The actual model identifier sent to the API */
  apiModelId: string;
  maxTokens?: number;
  contextWindow?: number;
  supportsStreaming: boolean;
  parameters: ModelParam[];
  resolutions?: ResolutionPreset[];
  /** Endpoint path override (appended to provider base URL) */
  endpointPath?: string;
  /** Whether this model is available (has valid API key configured) */
  available?: boolean;
  /** Whether the model is enabled for selection */
  enabled: boolean;
}

/** A configured API key entry (supports rotation with multiple keys) */
export interface APIKeyEntry {
  id: string;
  key: string;
  label: string;
  addedAt: string;
  lastUsedAt: string | null;
  failCount: number;
  disabled: boolean;
}

/** Provider configuration stored per-provider */
export interface ProviderConfig {
  provider: AIProvider;
  displayName: string;
  baseUrl: string;
  apiKeys: APIKeyEntry[];
  /** Index of the currently active key in the apiKeys array */
  activeKeyIndex: number;
  enabled: boolean;
  /** Default model id for this provider */
  defaultModelId: string | null;
  /** Custom headers to send with requests */
  customHeaders?: Record<string, string>;
}

/** Request queue item */
export interface QueuedRequest {
  id: string;
  provider: AIProvider;
  modelId: string;
  priority: number;
  createdAt: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  execute: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

/** SSE event from streaming responses */
export interface StreamEvent {
  type: 'content' | 'action' | 'error' | 'done';
  content?: string;
  action?: {
    type: string;
    [key: string]: unknown;
  };
  error?: string;
}

/** Parameters for a chat completion request */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[];
}

/** Parameters for an image generation request */
export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  samples?: number;
}

/** Result of an image generation */
export interface ImageGenerationResult {
  imageUrl: string;
  seed?: number;
  revisedPrompt?: string;
}

/** Parameters for a video generation request */
export interface VideoGenerationRequest {
  model: string;
  prompt: string;
  imageUrl?: string;
  duration?: number;
  fps?: number;
  width?: number;
  height?: number;
}

/** Connection test result */
export interface ConnectionTestResult {
  success: boolean;
  latencyMs: number;
  modelName?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Built-in model registry
// ---------------------------------------------------------------------------

export const BUILTIN_MODELS: AIModelDefinition[] = [
  // -- OpenAI text models --
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    capabilities: ['text-generation', 'vision'],
    description: 'Most capable OpenAI model',
    apiModelId: 'gpt-4o',
    endpointPath: '/chat/completions',
    supportsStreaming: true,
    maxTokens: 16384,
    contextWindow: 128000,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 2, step: 0.1, description: 'Randomness of output' },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 4096, min: 1, max: 16384, step: 1, description: 'Maximum response length' },
      { key: 'top_p', label: 'Top P', type: 'number', default: 1, min: 0, max: 1, step: 0.05, description: 'Nucleus sampling threshold' },
    ],
    enabled: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    capabilities: ['text-generation', 'vision'],
    description: 'Fast and affordable OpenAI model',
    apiModelId: 'gpt-4o-mini',
    endpointPath: '/chat/completions',
    supportsStreaming: true,
    maxTokens: 16384,
    contextWindow: 128000,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 2, step: 0.1 },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 4096, min: 1, max: 16384, step: 1 },
    ],
    enabled: true,
  },
  // -- OpenAI image models --
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    capabilities: ['image-generation'],
    description: 'OpenAI image generation',
    apiModelId: 'dall-e-3',
    endpointPath: '/images/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'size', label: 'Size', type: 'select', default: '1024x1024', options: [
        { value: '1024x1024', label: '1024x1024' },
        { value: '1792x1024', label: '1792x1024 (Landscape)' },
        { value: '1024x1792', label: '1024x1792 (Portrait)' },
      ]},
      { key: 'quality', label: 'Quality', type: 'select', default: 'standard', options: [
        { value: 'standard', label: 'Standard' },
        { value: 'hd', label: 'HD' },
      ]},
      { key: 'style', label: 'Style', type: 'select', default: 'vivid', options: [
        { value: 'vivid', label: 'Vivid' },
        { value: 'natural', label: 'Natural' },
      ]},
    ],
    enabled: true,
  },
  // -- Anthropic text models --
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    capabilities: ['text-generation', 'vision'],
    description: 'Balanced intelligence and speed',
    apiModelId: 'claude-sonnet-4-20250514',
    endpointPath: '/messages',
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 200000,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 1, step: 0.1 },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 4096, min: 1, max: 8192, step: 1 },
    ],
    enabled: true,
  },
  {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'anthropic',
    capabilities: ['text-generation', 'vision'],
    description: 'Fast and efficient',
    apiModelId: 'claude-haiku-4-20250414',
    endpointPath: '/messages',
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 200000,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 1, step: 0.1 },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 4096, min: 1, max: 8192, step: 1 },
    ],
    enabled: true,
  },
  // -- Stability AI image models --
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'stability',
    capabilities: ['image-generation'],
    description: 'High-quality open image generation',
    apiModelId: 'stable-diffusion-xl-1024-v1-0',
    endpointPath: '/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
    supportsStreaming: false,
    parameters: [
      { key: 'steps', label: 'Steps', type: 'number', default: 30, min: 10, max: 150, step: 1, description: 'Number of diffusion steps' },
      { key: 'cfg_scale', label: 'CFG Scale', type: 'number', default: 7, min: 0, max: 35, step: 0.5, description: 'How closely to follow the prompt' },
      { key: 'width', label: 'Width', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'height', label: 'Height', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'seed', label: 'Seed', type: 'number', default: -1, min: -1, max: 4294967295, step: 1, description: '-1 for random' },
      { key: 'samples', label: 'Samples', type: 'number', default: 1, min: 1, max: 4, step: 1 },
    ],
    resolutions: [
      { label: '1024x1024', width: 1024, height: 1024 },
      { label: '1152x896', width: 1152, height: 896 },
      { label: '896x1152', width: 896, height: 1152 },
      { label: '1344x768', width: 1344, height: 768 },
      { label: '768x1344', width: 768, height: 1344 },
    ],
    enabled: true,
  },
  {
    id: 'flux-1',
    name: 'Flux 1.0',
    provider: 'stability',
    capabilities: ['image-generation'],
    description: 'Next-gen image generation from Stability',
    apiModelId: 'flux-1',
    endpointPath: '/generation/flux-1/text-to-image',
    supportsStreaming: false,
    parameters: [
      { key: 'steps', label: 'Steps', type: 'number', default: 20, min: 1, max: 50, step: 1 },
      { key: 'guidance', label: 'Guidance', type: 'number', default: 3.5, min: 1, max: 10, step: 0.5 },
      { key: 'width', label: 'Width', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'height', label: 'Height', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'seed', label: 'Seed', type: 'number', default: -1, min: -1, max: 4294967295, step: 1 },
    ],
    enabled: true,
  },
  // -- Local / Custom --
  {
    id: 'local-llm',
    name: 'Local LLM (Ollama)',
    provider: 'local',
    capabilities: ['text-generation'],
    description: 'Run models locally via Ollama',
    apiModelId: 'llama3',
    endpointPath: '/api/chat',
    supportsStreaming: true,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 2, step: 0.1 },
      { key: 'num_predict', label: 'Max Tokens', type: 'number', default: 2048, min: 1, max: 8192, step: 1 },
    ],
    enabled: false,
  },
  // -- DeepSeek --
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'custom',
    capabilities: ['text-generation'],
    description: 'Advanced reasoning model',
    apiModelId: 'deepseek-r1',
    endpointPath: '/chat/completions',
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 64000,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 2, step: 0.1 },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 4096, min: 1, max: 8192, step: 1 },
    ],
    enabled: false,
  },
];

/** Default provider configurations */
export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    provider: 'openai',
    displayName: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: true,
    defaultModelId: 'gpt-4o',
  },
  {
    provider: 'anthropic',
    displayName: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: true,
    defaultModelId: 'claude-sonnet-4',
  },
  {
    provider: 'stability',
    displayName: 'Stability AI',
    baseUrl: 'https://api.stability.ai/v1',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: true,
    defaultModelId: 'stable-diffusion-xl',
  },
  {
    provider: 'local',
    displayName: 'Local (Ollama)',
    baseUrl: 'http://localhost:11434',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: false,
    defaultModelId: 'local-llm',
  },
  {
    provider: 'custom',
    displayName: 'Custom / Other',
    baseUrl: '',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: false,
    defaultModelId: null,
  },
];
