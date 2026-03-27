import { useCallback, useEffect, useRef, useMemo } from 'react';
import { usePerformanceStore } from '@/stores/performanceStore';
import type { CanvasNode } from '@/types';

// ============================================================
// Viewport Culling - Only render visible nodes
// ============================================================

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

const NODE_DEFAULT_WIDTH = 250;
const NODE_DEFAULT_HEIGHT = 250;
const VIEWPORT_PADDING = 100; // Extra pixels beyond viewport for pre-loading

function getViewportBounds(
  viewport: Viewport,
  containerWidth: number,
  containerHeight: number,
): ViewportBounds {
  const { x, y, zoom } = viewport;
  return {
    minX: -x / zoom - VIEWPORT_PADDING,
    minY: -y / zoom - VIEWPORT_PADDING,
    maxX: (-x + containerWidth) / zoom + VIEWPORT_PADDING,
    maxY: (-y + containerHeight) / zoom + VIEWPORT_PADDING,
  };
}

function isNodeInViewport(
  node: CanvasNode,
  bounds: ViewportBounds,
): boolean {
  const nodeWidth = (node.measured?.width ?? NODE_DEFAULT_WIDTH);
  const nodeHeight = (node.measured?.height ?? NODE_DEFAULT_HEIGHT);
  const { x, y } = node.position;

  return !(
    x + nodeWidth < bounds.minX ||
    x > bounds.maxX ||
    y + nodeHeight < bounds.minY ||
    y > bounds.maxY
  );
}

/**
 * Hook to filter nodes to only those visible in the current viewport.
 * Significantly improves performance with 100+ nodes.
 */
export function useViewportCulling(
  nodes: CanvasNode[],
  viewport: Viewport,
  containerWidth: number,
  containerHeight: number,
  enabled = true,
): CanvasNode[] {
  return useMemo(() => {
    if (!enabled || nodes.length < 30) return nodes;

    const bounds = getViewportBounds(viewport, containerWidth, containerHeight);
    return nodes.filter((node) => isNodeInViewport(node, bounds));
  }, [nodes, viewport, containerWidth, containerHeight, enabled]);
}

// ============================================================
// RAF-Throttled Callbacks
// ============================================================

/**
 * Returns a callback that is throttled to fire at most once per animation frame.
 * Useful for drag/zoom event handlers.
 */
export function useRAFThrottle<T extends (...args: any[]) => void>(
  callback: T,
): T {
  const rafRef = useRef<number | null>(null);
  const latestArgs = useRef<any[]>([]);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const throttled = useCallback((...args: any[]) => {
    latestArgs.current = args;
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        callbackRef.current(...latestArgs.current);
      });
    }
  }, []) as T;

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return throttled;
}

/**
 * Returns a throttled callback with a configurable interval.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  intervalMs: number,
): T {
  const lastCall = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const throttled = useCallback((...args: unknown[]) => {
    const now = Date.now();
    const elapsed = now - lastCall.current;

    if (elapsed >= intervalMs) {
      lastCall.current = now;
      callbackRef.current(...args);
    } else {
      // Schedule trailing call
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callbackRef.current(...args);
      }, intervalMs - elapsed);
    }
  }, [intervalMs]) as T;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return throttled;
}

// ============================================================
// FPS Monitor
// ============================================================

/**
 * Monitors FPS and reports to performance store for auto-detection.
 */
export function useFPSMonitor(enabled = true): number {
  const fpsRef = useRef(60);
  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const updateFps = usePerformanceStore((s) => s.updateFps);

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;

    const tick = () => {
      framesRef.current++;
      const now = performance.now();
      const elapsed = now - lastTimeRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((framesRef.current * 1000) / elapsed);
        fpsRef.current = fps;
        updateFps(fps);
        framesRef.current = 0;
        lastTimeRef.current = now;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, updateFps]);

  return fpsRef.current;
}

// ============================================================
// Node Memoization Helpers
// ============================================================

/**
 * Shallow comparison function for React.memo on node components.
 * Only re-renders when meaningful props change.
 */
export function areNodePropsEqual(
  prevProps: { id: string; data: Record<string, unknown>; selected?: boolean },
  nextProps: { id: string; data: Record<string, unknown>; selected?: boolean },
): boolean {
  if (prevProps.id !== nextProps.id) return false;
  if (prevProps.selected !== nextProps.selected) return false;

  // Shallow compare data object
  const prevData = prevProps.data;
  const nextData = nextProps.data;

  if (prevData === nextData) return true;

  const prevKeys = Object.keys(prevData);
  const nextKeys = Object.keys(nextData);
  if (prevKeys.length !== nextKeys.length) return false;

  for (const key of prevKeys) {
    if (prevData[key] !== nextData[key]) return false;
  }

  return true;
}

// ============================================================
// GPU Acceleration Styles
// ============================================================

/**
 * CSS properties for GPU-accelerated canvas elements.
 */
export const GPU_ACCELERATED_STYLE: React.CSSProperties = {
  willChange: 'transform',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
};

/**
 * Returns GPU acceleration style based on current performance settings.
 */
export function useGPUAcceleration(): React.CSSProperties {
  const gpuEnabled = usePerformanceStore((s) => s.settings.gpuAcceleration);
  return useMemo(() => (gpuEnabled ? GPU_ACCELERATED_STYLE : {}), [gpuEnabled]);
}

// ============================================================
// Debounced Value
// ============================================================

/**
 * Returns a debounced version of a value. Useful for expensive computations
 * that depend on rapidly-changing inputs.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const ref = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Force update mechanism
  const forceUpdate = useRef<(() => void) | undefined>(undefined);

  // Use state for re-render trigger
  const stateRef = useRef(value);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      ref.current = value;
      stateRef.current = value;
      forceUpdate.current?.();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, delayMs]);

  return ref.current;
}

// ============================================================
// Combined Performance Hook
// ============================================================

/**
 * All-in-one hook that applies performance optimizations to the canvas.
 * Returns the FPS and GPU acceleration styles.
 */
export function useCanvasPerformance(nodeCount: number) {
  const updateNodeCount = usePerformanceStore((s) => s.updateNodeCount);
  const settings = usePerformanceStore((s) => s.settings);
  const gpuStyle = useGPUAcceleration();

  // Update node count for auto-detection
  useEffect(() => {
    updateNodeCount(nodeCount);
  }, [nodeCount, updateNodeCount]);

  // Monitor FPS
  const fps = useFPSMonitor(settings.gpuAcceleration);

  return {
    fps,
    gpuStyle,
    settings,
  };
}
