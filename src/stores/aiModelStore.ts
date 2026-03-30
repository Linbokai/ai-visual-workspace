import { create } from 'zustand';
import type {
  AIProvider,
  AIModelDefinition,
  ProviderConfig,
  APIKeyEntry,
  ModelCapability,
} from '@/types/ai-models';
import { BUILTIN_MODELS, DEFAULT_PROVIDERS } from '@/types/ai-models';

// ---------------------------------------------------------------------------
// localStorage persistence helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ai_workspace_model_config';

interface PersistedState {
  providers: ProviderConfig[];
  selectedChatModelId: string;
  selectedImageModelId: string;
  selectedVideoModelId: string;
}

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<PersistedState>;
  } catch {
    return {};
  }
}

function persistState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface AIModelState {
  /** All registered model definitions (built-in + custom) */
  models: AIModelDefinition[];
  /** Provider configurations with API keys */
  providers: ProviderConfig[];
  /** Currently selected model IDs by purpose */
  selectedChatModelId: string;
  selectedImageModelId: string;
  selectedVideoModelId: string;

  // -- Provider management --
  getProvider: (provider: AIProvider) => ProviderConfig | undefined;
  updateProvider: (provider: AIProvider, updates: Partial<ProviderConfig>) => void;
  setProviderBaseUrl: (provider: AIProvider, url: string) => void;
  setProviderEnabled: (provider: AIProvider, enabled: boolean) => void;

  // -- API Key management --
  addApiKey: (provider: AIProvider, key: string, label: string) => void;
  removeApiKey: (provider: AIProvider, keyId: string) => void;
  rotateApiKey: (provider: AIProvider) => void;
  markKeyFailed: (provider: AIProvider, keyId: string) => void;
  blacklistApiKey: (provider: AIProvider, keyId: string, errorCode?: number) => void;
  getActiveKey: (provider: AIProvider) => string | null;
  getActiveApiKey: (provider: AIProvider) => string | null;

  // -- Model selection --
  setSelectedChatModel: (modelId: string) => void;
  setSelectedImageModel: (modelId: string) => void;
  setSelectedVideoModel: (modelId: string) => void;

  // -- Queries --
  getModel: (modelId: string) => AIModelDefinition | undefined;
  getModelsByCapability: (capability: ModelCapability) => AIModelDefinition[];
  getModelsByProvider: (provider: AIProvider) => AIModelDefinition[];
  getAvailableModels: () => AIModelDefinition[];
  getSelectedChatModel: () => AIModelDefinition | undefined;
  getSelectedImageModel: () => AIModelDefinition | undefined;

  // -- Persistence --
  _persist: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const persisted = loadPersistedState();

export const useAIModelStore = create<AIModelState>((set, get) => ({
  models: BUILTIN_MODELS,
  providers: persisted.providers ?? DEFAULT_PROVIDERS.map((p) => ({ ...p })),
  selectedChatModelId: persisted.selectedChatModelId ?? 'gpt-4o',
  selectedImageModelId: persisted.selectedImageModelId ?? 'dall-e-3',
  selectedVideoModelId: persisted.selectedVideoModelId ?? '',

  // -- Provider management --

  getProvider: (provider) => get().providers.find((p) => p.provider === provider),

  updateProvider: (provider, updates) => {
    set((state) => ({
      providers: state.providers.map((p) =>
        p.provider === provider ? { ...p, ...updates } : p,
      ),
    }));
    get()._persist();
  },

  setProviderBaseUrl: (provider, url) => {
    get().updateProvider(provider, { baseUrl: url });
  },

  setProviderEnabled: (provider, enabled) => {
    get().updateProvider(provider, { enabled });
  },

  // -- API Key management --

  addApiKey: (provider, key, label) => {
    const entry: APIKeyEntry = {
      id: crypto.randomUUID(),
      key,
      label: label || `Key ${Date.now()}`,
      addedAt: new Date().toISOString(),
      lastUsedAt: null,
      failCount: 0,
      disabled: false,
    };
    set((state) => ({
      providers: state.providers.map((p) =>
        p.provider === provider
          ? { ...p, apiKeys: [...p.apiKeys, entry] }
          : p,
      ),
    }));
    get()._persist();
  },

  removeApiKey: (provider, keyId) => {
    set((state) => ({
      providers: state.providers.map((p) => {
        if (p.provider !== provider) return p;
        const filtered = p.apiKeys.filter((k) => k.id !== keyId);
        const activeIdx = Math.min(p.activeKeyIndex, Math.max(0, filtered.length - 1));
        return { ...p, apiKeys: filtered, activeKeyIndex: activeIdx };
      }),
    }));
    get()._persist();
  },

  rotateApiKey: (provider) => {
    set((state) => ({
      providers: state.providers.map((p) => {
        if (p.provider !== provider || p.apiKeys.length <= 1) return p;
        // Find next non-disabled key
        let nextIdx = (p.activeKeyIndex + 1) % p.apiKeys.length;
        let attempts = 0;
        while (p.apiKeys[nextIdx].disabled && attempts < p.apiKeys.length) {
          nextIdx = (nextIdx + 1) % p.apiKeys.length;
          attempts++;
        }
        return { ...p, activeKeyIndex: nextIdx };
      }),
    }));
    get()._persist();
  },

  markKeyFailed: (provider, keyId) => {
    const state = get();
    set({
      providers: state.providers.map((p) => {
        if (p.provider !== provider) return p;
        const updatedKeys = p.apiKeys.map((k) =>
          k.id === keyId ? { ...k, failCount: k.failCount + 1, disabled: k.failCount + 1 >= 3 } : k,
        );
        return { ...p, apiKeys: updatedKeys };
      }),
    });
    // Auto-rotate after marking failed
    get().rotateApiKey(provider);
  },

  blacklistApiKey: (provider, keyId, errorCode) => {
    // Only blacklist on specific error codes that indicate the key is invalid/exhausted
    const blacklistCodes = [1006, 401, 402, 403];
    if (errorCode !== undefined && !blacklistCodes.includes(errorCode)) {
      // For non-blacklist error codes, just mark as failed (increment failCount)
      get().markKeyFailed(provider, keyId);
      return;
    }

    // Immediately disable the key
    set((state) => ({
      providers: state.providers.map((p) => {
        if (p.provider !== provider) return p;
        const updatedKeys = p.apiKeys.map((k) =>
          k.id === keyId ? { ...k, disabled: true, failCount: k.failCount + 1 } : k,
        );
        return { ...p, apiKeys: updatedKeys };
      }),
    }));
    get()._persist();
    // Auto-rotate to the next available key
    get().rotateApiKey(provider);
  },

  getActiveKey: (provider) => {
    const cfg = get().providers.find((p) => p.provider === provider);
    if (!cfg || cfg.apiKeys.length === 0) return null;
    const key = cfg.apiKeys[cfg.activeKeyIndex];
    if (!key || key.disabled) {
      // Try to find any non-disabled key
      const valid = cfg.apiKeys.find((k) => !k.disabled);
      return valid?.key ?? null;
    }
    return key.key;
  },

  getActiveApiKey: (provider) => {
    // Alias for getActiveKey - returns the current active key string for a provider
    return get().getActiveKey(provider);
  },

  // -- Model selection --

  setSelectedChatModel: (modelId) => {
    set({ selectedChatModelId: modelId });
    get()._persist();
  },

  setSelectedImageModel: (modelId) => {
    set({ selectedImageModelId: modelId });
    get()._persist();
  },

  setSelectedVideoModel: (modelId) => {
    set({ selectedVideoModelId: modelId });
    get()._persist();
  },

  // -- Queries --

  getModel: (modelId) => get().models.find((m) => m.id === modelId),

  getModelsByCapability: (capability) =>
    get().models.filter((m) => m.capabilities.includes(capability) && m.enabled),

  getModelsByProvider: (provider) =>
    get().models.filter((m) => m.provider === provider),

  getAvailableModels: () => {
    const state = get();
    const enabledProviders = new Set(
      state.providers.filter((p) => p.enabled && p.apiKeys.length > 0).map((p) => p.provider),
    );
    // Local provider doesn't need API keys
    const localProvider = state.providers.find((p) => p.provider === 'local');
    if (localProvider?.enabled) enabledProviders.add('local');

    return state.models.filter(
      (m) => m.enabled && enabledProviders.has(m.provider),
    );
  },

  getSelectedChatModel: () => {
    const state = get();
    return state.models.find((m) => m.id === state.selectedChatModelId);
  },

  getSelectedImageModel: () => {
    const state = get();
    return state.models.find((m) => m.id === state.selectedImageModelId);
  },

  // -- Persistence --

  _persist: () => {
    const state = get();
    persistState({
      providers: state.providers,
      selectedChatModelId: state.selectedChatModelId,
      selectedImageModelId: state.selectedImageModelId,
      selectedVideoModelId: state.selectedVideoModelId,
    });
  },
}));
