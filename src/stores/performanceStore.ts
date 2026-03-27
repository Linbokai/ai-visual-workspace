import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type PerformanceMode = 'fast' | 'normal' | 'quality';

interface PerformanceSettings {
  /** Disable box shadows */
  disableShadows: boolean;
  /** Disable backdrop blur */
  disableBlur: boolean;
  /** Disable CSS transitions/animations */
  disableTransitions: boolean;
  /** Use thumbnails instead of full images */
  useThumbnails: boolean;
  /** Disable node processing glow animation */
  disableGlowAnimation: boolean;
  /** Disable minimap */
  disableMinimap: boolean;
  /** Throttle interval for viewport changes (ms) */
  viewportThrottleMs: number;
  /** Maximum nodes to render (0 = unlimited) */
  maxVisibleNodes: number;
  /** Enable GPU acceleration hints */
  gpuAcceleration: boolean;
}

const PERFORMANCE_PRESETS: Record<PerformanceMode, PerformanceSettings> = {
  fast: {
    disableShadows: true,
    disableBlur: true,
    disableTransitions: true,
    useThumbnails: true,
    disableGlowAnimation: true,
    disableMinimap: true,
    viewportThrottleMs: 32, // ~30fps
    maxVisibleNodes: 0,
    gpuAcceleration: true,
  },
  normal: {
    disableShadows: false,
    disableBlur: false,
    disableTransitions: false,
    useThumbnails: false,
    disableGlowAnimation: false,
    disableMinimap: false,
    viewportThrottleMs: 16, // ~60fps
    maxVisibleNodes: 0,
    gpuAcceleration: true,
  },
  quality: {
    disableShadows: false,
    disableBlur: false,
    disableTransitions: false,
    useThumbnails: false,
    disableGlowAnimation: false,
    disableMinimap: false,
    viewportThrottleMs: 0, // No throttling
    maxVisibleNodes: 0,
    gpuAcceleration: false, // Use CPU rendering for highest quality
  },
};

interface PerformanceState {
  mode: PerformanceMode;
  settings: PerformanceSettings;
  autoDetect: boolean;
  /** Current FPS estimate */
  fps: number;
  /** Total node count for auto-detection */
  nodeCount: number;
  /** Save status indicator */
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';

  setMode: (mode: PerformanceMode) => void;
  setAutoDetect: (enabled: boolean) => void;
  updateNodeCount: (count: number) => void;
  updateFps: (fps: number) => void;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  /** Auto-detect best mode based on node count and device capability */
  detectOptimalMode: () => PerformanceMode;
}

/** Detect device capability score (0-1) */
function getDeviceCapability(): number {
  let score = 0.5;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency ?? 4;
  if (cores >= 8) score += 0.2;
  else if (cores >= 4) score += 0.1;
  else score -= 0.1;

  // Check device memory (Chrome only)
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (deviceMemory !== undefined) {
    if (deviceMemory >= 8) score += 0.2;
    else if (deviceMemory >= 4) score += 0.1;
    else score -= 0.2;
  }

  // Check if mobile
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) score -= 0.3;

  return Math.max(0, Math.min(1, score));
}

const STORAGE_KEY = 'perf-mode';

function loadPersistedMode(): PerformanceMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fast' || stored === 'normal' || stored === 'quality') {
      return stored;
    }
  } catch {
    // Ignore
  }
  return 'normal';
}

export const usePerformanceStore = create<PerformanceState>()(
  subscribeWithSelector((set, get) => {
    const initialMode = loadPersistedMode();
    return {
      mode: initialMode,
      settings: PERFORMANCE_PRESETS[initialMode],
      autoDetect: true,
      fps: 60,
      nodeCount: 0,
      saveStatus: 'idle',

      setMode: (mode) => {
        try {
          localStorage.setItem(STORAGE_KEY, mode);
        } catch {
          // Ignore
        }
        set({ mode, settings: PERFORMANCE_PRESETS[mode] });
        applyPerformanceCSS(PERFORMANCE_PRESETS[mode]);
      },

      setAutoDetect: (enabled) => set({ autoDetect: enabled }),

      updateNodeCount: (count) => {
        set({ nodeCount: count });
        const { autoDetect } = get();
        if (autoDetect) {
          const optimal = get().detectOptimalMode();
          const current = get().mode;
          if (optimal !== current) {
            get().setMode(optimal);
          }
        }
      },

      updateFps: (fps) => set({ fps }),

      setSaveStatus: (status) => set({ saveStatus: status }),

      detectOptimalMode: () => {
        const { nodeCount } = get();
        const capability = getDeviceCapability();

        // High node counts need fast mode
        if (nodeCount > 100 || capability < 0.3) return 'fast';
        if (nodeCount > 50 || capability < 0.5) return 'normal';
        return 'quality';
      },
    };
  }),
);

// Apply performance CSS class to document
function applyPerformanceCSS(settings: PerformanceSettings): void {
  const root = document.documentElement;

  root.classList.toggle('perf-no-shadows', settings.disableShadows);
  root.classList.toggle('perf-no-blur', settings.disableBlur);
  root.classList.toggle('perf-no-transitions', settings.disableTransitions);
  root.classList.toggle('perf-no-glow', settings.disableGlowAnimation);
  root.classList.toggle('perf-gpu-accel', settings.gpuAcceleration);
}

// Apply initial settings
applyPerformanceCSS(PERFORMANCE_PRESETS[loadPersistedMode()]);

// Mode labels for UI
export const PERFORMANCE_MODE_LABELS: Record<PerformanceMode, { label: string; description: string }> = {
  fast: {
    label: '极速',
    description: 'Disable shadows, blur, transitions. Use thumbnails.',
  },
  normal: {
    label: '普通',
    description: 'Balanced performance with all effects.',
  },
  quality: {
    label: '原图',
    description: 'Full resolution, all effects enabled.',
  },
};
