import { create } from 'zustand';

export type BatchMode = 'parallel' | 'sequential';
export type BatchTaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'aborted';

export interface BatchTask {
  id: string;
  nodeId: string;
  label: string;
  status: BatchTaskStatus;
  progress: number;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

interface BatchState {
  tasks: BatchTask[];
  mode: BatchMode;
  concurrency: number;
  isRunning: boolean;

  // Actions
  addTask: (task: Omit<BatchTask, 'status' | 'progress' | 'createdAt'>) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  setMode: (mode: BatchMode) => void;
  setConcurrency: (n: number) => void;
  startBatch: () => void;
  abortBatch: () => void;
  updateTaskStatus: (id: string, status: BatchTaskStatus, progress?: number, error?: string) => void;
}

export const useBatchStore = create<BatchState>((set, get) => ({
  tasks: [],
  mode: 'parallel',
  concurrency: 3,
  isRunning: false,

  addTask: (task) =>
    set((s) => ({
      tasks: [
        ...s.tasks,
        {
          ...task,
          status: 'pending',
          progress: 0,
          createdAt: Date.now(),
        },
      ],
    })),

  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  clearCompleted: () =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.status !== 'completed' && t.status !== 'failed' && t.status !== 'aborted'),
    })),

  clearAll: () => set({ tasks: [], isRunning: false }),

  setMode: (mode) => set({ mode }),

  setConcurrency: (n) => set({ concurrency: Math.max(1, Math.min(10, n)) }),

  startBatch: () => {
    const { tasks, mode, concurrency } = get();
    const pending = tasks.filter((t) => t.status === 'pending');
    if (pending.length === 0) return;

    set({ isRunning: true });

    // Simulate batch execution
    const runNext = async (index: number) => {
      const task = pending[index];
      if (!task || !get().isRunning) return;

      get().updateTaskStatus(task.id, 'running');

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        if (!get().isRunning) {
          clearInterval(interval);
          get().updateTaskStatus(task.id, 'aborted');
          return;
        }
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          clearInterval(interval);
          get().updateTaskStatus(task.id, 'completed', 100);
          // In sequential mode, run next
          if (mode === 'sequential') {
            runNext(index + 1);
          }
        } else {
          get().updateTaskStatus(task.id, 'running', Math.min(progress, 99));
        }
      }, 500);
    };

    if (mode === 'parallel') {
      const limit = Math.min(concurrency, pending.length);
      for (let i = 0; i < limit; i++) {
        runNext(i);
      }
    } else {
      runNext(0);
    }
  },

  abortBatch: () => {
    set((s) => ({
      isRunning: false,
      tasks: s.tasks.map((t) =>
        t.status === 'running' || t.status === 'pending'
          ? { ...t, status: 'aborted' as BatchTaskStatus }
          : t
      ),
    }));
  },

  updateTaskStatus: (id, status, progress, error) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              progress: progress ?? t.progress,
              error: error ?? t.error,
              startedAt: status === 'running' && !t.startedAt ? Date.now() : t.startedAt,
              completedAt: status === 'completed' || status === 'failed' ? Date.now() : t.completedAt,
            }
          : t
      ),
      // Check if all done
      isRunning:
        status === 'completed' || status === 'failed' || status === 'aborted'
          ? s.tasks.some((t) => t.id !== id && (t.status === 'running' || t.status === 'pending'))
          : s.isRunning,
    })),
}));
