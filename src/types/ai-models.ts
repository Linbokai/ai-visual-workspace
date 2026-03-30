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
  | 'custom'
  | 'jimeng'
  | 'midjourney'
  | 'google'
  | 'grok';

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
  // -- GPT-4o Image --
  {
    id: 'gpt-4o-image',
    name: 'GPT-4o Image',
    provider: 'openai',
    capabilities: ['image-generation'],
    description: 'OpenAI GPT-4o native image generation',
    apiModelId: 'gpt-4o',
    endpointPath: '/images/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'size', label: 'Size', type: 'select', default: '1024x1024', options: [
        { value: '1024x1024', label: '1024x1024' },
        { value: '1792x1024', label: '1792x1024' },
        { value: '1024x1792', label: '1024x1792' },
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
  // -- Jimeng (即梦) Image Models --
  {
    id: 'jimeng-4.5',
    name: '即梦 4.5',
    provider: 'jimeng',
    capabilities: ['image-generation'],
    description: 'Latest Jimeng image generation model',
    apiModelId: 'jimeng-4.5',
    endpointPath: '/v1/images/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'width', label: 'Width', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'height', label: 'Height', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'quality', label: 'Quality', type: 'select', default: 'auto', options: [
        { value: 'auto', label: 'Auto' },
        { value: '1k', label: '1K' },
        { value: '2k', label: '2K' },
        { value: '4k', label: '4K' },
      ]},
    ],
    enabled: false,
  },
  {
    id: 'jimeng-3.0',
    name: '即梦 3.0',
    provider: 'jimeng',
    capabilities: ['image-generation'],
    description: 'Jimeng 3.0 image model',
    apiModelId: 'jimeng-3.0',
    endpointPath: '/v1/images/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'width', label: 'Width', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'height', label: 'Height', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
    ],
    enabled: false,
  },
  {
    id: 'nanobananapro',
    name: 'Nano Banana Pro',
    provider: 'jimeng',
    capabilities: ['image-generation'],
    description: 'Nano Banana Pro image generation',
    apiModelId: 'nanobananapro',
    endpointPath: '/v1/images/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'width', label: 'Width', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'height', label: 'Height', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
    ],
    enabled: false,
  },
  // -- Jimeng Video Models --
  {
    id: 'jimeng-video-3.5',
    name: '即梦视频 3.5 Pro',
    provider: 'jimeng',
    capabilities: ['video-generation'],
    description: 'Jimeng video generation 3.5',
    apiModelId: 'jimeng-video-3.5-pro',
    endpointPath: '/v1/videos/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'duration', label: 'Duration', type: 'select', default: '5', options: [
        { value: '5', label: '5s' },
        { value: '10', label: '10s' },
      ]},
    ],
    enabled: false,
  },
  // -- Midjourney --
  {
    id: 'midjourney-v6',
    name: 'Midjourney V6',
    provider: 'midjourney',
    capabilities: ['image-generation'],
    description: 'Midjourney V6 via API proxy',
    apiModelId: 'mj-v6',
    endpointPath: '/v1/imagine',
    supportsStreaming: false,
    parameters: [
      { key: 'aspect_ratio', label: 'Aspect Ratio', type: 'select', default: '1:1', options: [
        { value: '1:1', label: '1:1' },
        { value: '16:9', label: '16:9' },
        { value: '9:16', label: '9:16' },
        { value: '4:3', label: '4:3' },
        { value: '3:4', label: '3:4' },
      ]},
      { key: 'stylize', label: 'Stylize', type: 'number', default: 100, min: 0, max: 1000, step: 10, description: 'How artistic the output is' },
      { key: 'chaos', label: 'Chaos', type: 'number', default: 0, min: 0, max: 100, step: 1, description: 'Variation in results' },
      { key: 'oref', label: 'Character Ref (--oref)', type: 'number', default: 0, min: 0, max: 100, step: 10, description: 'Character consistency weight' },
      { key: 'sref', label: 'Style Ref (--sref)', type: 'number', default: 0, min: 0, max: 100, step: 10, description: 'Style consistency weight' },
    ],
    enabled: false,
  },
  // -- Google Gemini --
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro',
    provider: 'google',
    capabilities: ['text-generation', 'vision'],
    description: 'Google Gemini 3 Pro for text and vision',
    apiModelId: 'gemini-3-pro-preview',
    endpointPath: '/v1/models/gemini-3-pro-preview:generateContent',
    supportsStreaming: true,
    maxTokens: 8192,
    contextWindow: 1000000,
    parameters: [
      { key: 'temperature', label: 'Temperature', type: 'number', default: 0.7, min: 0, max: 2, step: 0.1 },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number', default: 4096, min: 1, max: 8192, step: 1 },
    ],
    enabled: false,
  },
  {
    id: 'gemini-image',
    name: 'Gemini 3 Pro Image',
    provider: 'google',
    capabilities: ['image-generation'],
    description: 'Gemini image generation via Yunwu proxy',
    apiModelId: 'gemini-3-pro-image-preview',
    endpointPath: '/v1/images/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'width', label: 'Width', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
      { key: 'height', label: 'Height', type: 'number', default: 1024, min: 512, max: 2048, step: 64 },
    ],
    enabled: false,
  },
  // -- Grok --
  {
    id: 'grok-video',
    name: 'Grok Video 3',
    provider: 'grok',
    capabilities: ['video-generation'],
    description: 'Grok video generation',
    apiModelId: 'grok-video-3',
    endpointPath: '/v1/videos/generations',
    supportsStreaming: false,
    parameters: [
      { key: 'duration', label: 'Duration', type: 'select', default: '8', options: [
        { value: '5', label: '5s' },
        { value: '8', label: '8s' },
      ]},
    ],
    enabled: false,
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
    provider: 'jimeng',
    displayName: '即梦 (Jimeng)',
    baseUrl: 'https://api.jimeng.ai',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: false,
    defaultModelId: 'jimeng-4.5',
  },
  {
    provider: 'midjourney',
    displayName: 'Midjourney',
    baseUrl: '',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: false,
    defaultModelId: 'midjourney-v6',
  },
  {
    provider: 'google',
    displayName: 'Google Cloud',
    baseUrl: 'https://generativelanguage.googleapis.com',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: false,
    defaultModelId: 'gemini-3-pro',
  },
  {
    provider: 'grok',
    displayName: 'Grok (xAI)',
    baseUrl: 'https://api.x.ai',
    apiKeys: [],
    activeKeyIndex: 0,
    enabled: false,
    defaultModelId: 'grok-video',
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
