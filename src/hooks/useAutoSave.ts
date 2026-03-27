import { useEffect, useRef, useCallback } from 'react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePerformanceStore } from '@/stores/performanceStore';
import { cacheManager } from '@/lib/cache-manager';
import type { CanvasNode, CanvasEdge } from '@/types';

const SAVE_DELAY = 2000; // 2 seconds debounce
const SAVE_STATUS_RESET_DELAY = 3000; // Reset "saved" indicator after 3s

interface CanvasSaveData {
  viewport: { x: number; y: number; zoom: number };
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  savedAt: number;
  version: number;
}

/**
 * Compute a hash of nodes/edges to detect actual changes.
 * Uses a lightweight approach: stringify a sorted key summary.
 */
function computeStateHash(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  const nodeKeys = nodes.map((n) => `${n.id}:${JSON.stringify(n.position)}:${JSON.stringify(n.data)}`).join('|');
  const edgeKeys = edges.map((e) => `${e.id}:${e.source}:${e.target}`).join('|');
  return `${nodeKeys}::${edgeKeys}`;
}


export function useAutoSave() {
  const projectId = useCanvasStore((s) => s.projectId);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setSaveStatus = usePerformanceStore((s) => s.setSaveStatus);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHashRef = useRef<string>('');
  const lastNodesRef = useRef<CanvasNode[]>([]);

  const performSave = useCallback(async (
    pid: string,
    currentNodes: CanvasNode[],
    currentEdges: CanvasEdge[],
  ) => {
    // Check if state actually changed
    const currentHash = computeStateHash(currentNodes, currentEdges);
    if (currentHash === lastHashRef.current) return;

    setSaveStatus('saving');

    const saveData: CanvasSaveData = {
      viewport: { x: 0, y: 0, zoom: 1 },
      nodes: currentNodes,
      edges: currentEdges,
      savedAt: Date.now(),
      version: 1,
    };

    try {
      // Primary: IndexedDB (no size limit)
      await cacheManager.projects.save(pid, saveData);

      // Secondary: localStorage fallback (for quick load)
      // Only save if data is small enough
      const serialized = JSON.stringify(saveData);
      if (serialized.length < 4 * 1024 * 1024) {
        try {
          localStorage.setItem(`canvas_${pid}`, serialized);
        } catch {
          // localStorage full - that's ok, we have IndexedDB
        }
      }

      lastHashRef.current = currentHash;
      lastNodesRef.current = currentNodes;

      setSaveStatus('saved');

      // Reset status indicator
      if (statusResetRef.current) clearTimeout(statusResetRef.current);
      statusResetRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, SAVE_STATUS_RESET_DELAY);

      console.log(
        '[AutoSave] Saved project:',
        pid,
        `(${currentNodes.length} nodes, ${currentEdges.length} edges)`,
      );
    } catch (err) {
      console.error('[AutoSave] Failed to save:', err);
      setSaveStatus('error');

      // Reset error status after a delay
      if (statusResetRef.current) clearTimeout(statusResetRef.current);
      statusResetRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, SAVE_STATUS_RESET_DELAY * 2);
    }
  }, [setSaveStatus]);

  // Debounced save on changes
  useEffect(() => {
    if (!projectId) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      performSave(projectId, nodes, edges);
    }, SAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [projectId, nodes, edges, performSave]);

  // Force save on page unload
  useEffect(() => {
    if (!projectId) return;

    const handleBeforeUnload = () => {
      const state = useCanvasStore.getState();
      const saveData: CanvasSaveData = {
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: state.nodes,
        edges: state.edges,
        savedAt: Date.now(),
        version: 1,
      };
      try {
        localStorage.setItem(
          `canvas_${projectId}`,
          JSON.stringify(saveData),
        );
      } catch {
        // Best effort
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [projectId]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (statusResetRef.current) clearTimeout(statusResetRef.current);
    };
  }, []);
}

/**
 * Load saved canvas data, trying IndexedDB first, then localStorage.
 * Includes corruption recovery.
 */
export async function loadCanvasFromStorage(projectId: string): Promise<CanvasSaveData | null> {
  // Try IndexedDB first (primary storage)
  try {
    const idbData = await cacheManager.projects.load(projectId);
    if (idbData && isValidSaveData(idbData)) {
      return idbData as CanvasSaveData;
    }
  } catch {
    console.warn('[AutoSave] Failed to load from IndexedDB, trying localStorage');
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(`canvas_${projectId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidSaveData(parsed)) {
        return parsed;
      }
      // Corrupted data - remove it
      console.warn('[AutoSave] Corrupted save data detected, removing');
      localStorage.removeItem(`canvas_${projectId}`);
    }
  } catch {
    // Parse error - remove corrupted data
    localStorage.removeItem(`canvas_${projectId}`);
  }

  return null;
}

/**
 * Validate save data structure to recover from corruption.
 */
function isValidSaveData(data: unknown): data is CanvasSaveData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.nodes)) return false;
  if (!Array.isArray(d.edges)) return false;
  // Basic node validation
  for (const node of d.nodes as unknown[]) {
    if (!node || typeof node !== 'object') return false;
    const n = node as Record<string, unknown>;
    if (typeof n.id !== 'string') return false;
    if (!n.position || typeof n.position !== 'object') return false;
  }
  return true;
}

/**
 * Legacy sync loader for backward compatibility with the existing CanvasPage.
 * Tries localStorage first (synchronous), then schedules an async IDB load.
 */
export function loadCanvasFromStorageSync(projectId: string): CanvasSaveData | null {
  try {
    const raw = localStorage.getItem(`canvas_${projectId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidSaveData(parsed)) {
        return parsed;
      }
      localStorage.removeItem(`canvas_${projectId}`);
    }
  } catch {
    localStorage.removeItem(`canvas_${projectId}`);
  }
  return null;
}
