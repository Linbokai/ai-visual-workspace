export type BatchMode = 'parallel' | 'sequential';
export type BatchStatus = 'idle' | 'running' | 'cooling' | 'completed' | 'error';

export interface BatchTask<T = unknown> {
  id: string;
  execute: () => Promise<T>;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: T;
  error?: unknown;
}

export interface BatchOptions {
  mode: BatchMode;
  concurrency: number;
  cooldownMs: number;
  maxRetries: number;
  onTaskComplete?: (taskId: string, result: unknown) => void;
  onTaskError?: (taskId: string, error: unknown) => void;
  onBatchComplete?: (results: Map<string, unknown>) => void;
  onStatusChange?: (status: BatchStatus) => void;
}

export class BatchQueue {
  private tasks: BatchTask[] = [];
  private results = new Map<string, unknown>();
  private status: BatchStatus = 'idle';
  private options: BatchOptions;
  private aborted = false;

  constructor(options: Partial<BatchOptions> = {}) {
    this.options = {
      mode: options.mode ?? 'parallel',
      concurrency: options.concurrency ?? 3,
      cooldownMs: options.cooldownMs ?? 1000,
      maxRetries: options.maxRetries ?? 2,
      onTaskComplete: options.onTaskComplete,
      onTaskError: options.onTaskError,
      onBatchComplete: options.onBatchComplete,
      onStatusChange: options.onStatusChange,
    };
  }

  addTask(id: string, execute: () => Promise<unknown>): void {
    this.tasks.push({
      id,
      execute,
      retryCount: 0,
      maxRetries: this.options.maxRetries,
      status: 'pending',
    });
  }

  async run(): Promise<Map<string, unknown>> {
    this.aborted = false;
    this.setStatus('running');

    if (this.options.mode === 'parallel') {
      await this.runParallel();
    } else {
      await this.runSequential();
    }

    this.setStatus('completed');
    this.options.onBatchComplete?.(this.results);
    return this.results;
  }

  abort(): void {
    this.aborted = true;
    this.setStatus('idle');
  }

  getStatus(): BatchStatus {
    return this.status;
  }

  getProgress(): { completed: number; total: number; failed: number } {
    return {
      completed: this.tasks.filter((t) => t.status === 'completed').length,
      total: this.tasks.length,
      failed: this.tasks.filter((t) => t.status === 'failed').length,
    };
  }

  private setStatus(status: BatchStatus) {
    this.status = status;
    this.options.onStatusChange?.(status);
  }

  private async runParallel(): Promise<void> {
    const pending = [...this.tasks.filter((t) => t.status === 'pending')];
    const executing = new Set<Promise<void>>();

    for (const task of pending) {
      if (this.aborted) break;

      const p = this.executeTask(task).then(() => {
        executing.delete(p);
      });
      executing.add(p);

      if (executing.size >= this.options.concurrency) {
        await Promise.race(executing);
      }
    }

    await Promise.all(executing);
  }

  private async runSequential(): Promise<void> {
    for (const task of this.tasks) {
      if (this.aborted) break;
      await this.executeTask(task);

      if (this.options.cooldownMs > 0 && task !== this.tasks[this.tasks.length - 1]) {
        this.setStatus('cooling');
        await new Promise((r) => setTimeout(r, this.options.cooldownMs));
        this.setStatus('running');
      }
    }
  }

  private async executeTask(task: BatchTask): Promise<void> {
    task.status = 'running';

    while (task.retryCount <= task.maxRetries) {
      try {
        const result = await task.execute();
        task.status = 'completed';
        task.result = result;
        this.results.set(task.id, result);
        this.options.onTaskComplete?.(task.id, result);
        return;
      } catch (error) {
        task.retryCount++;
        task.error = error;
        if (task.retryCount > task.maxRetries) {
          task.status = 'failed';
          this.options.onTaskError?.(task.id, error);
          return;
        }
        // Wait before retry with exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * task.retryCount));
      }
    }
  }
}
