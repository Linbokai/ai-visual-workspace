import { useTranslation } from 'react-i18next';
import { useBatchStore, type BatchTaskStatus } from '@/stores/batchStore';
import {
  Play, Square, Trash2, Loader2, CheckCircle2, XCircle, Clock,
  AlertTriangle, ToggleLeft, ToggleRight, Minus, Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<BatchTaskStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-[var(--muted-foreground)]', label: 'Pending' },
  running: { icon: Loader2, color: 'text-blue-400', label: 'Running' },
  completed: { icon: CheckCircle2, color: 'text-green-400', label: 'Done' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
  aborted: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Aborted' },
};

export function BatchPanel() {
  const { t } = useTranslation();
  const tasks = useBatchStore((s) => s.tasks);
  const mode = useBatchStore((s) => s.mode);
  const concurrency = useBatchStore((s) => s.concurrency);
  const isRunning = useBatchStore((s) => s.isRunning);
  const setMode = useBatchStore((s) => s.setMode);
  const setConcurrency = useBatchStore((s) => s.setConcurrency);
  const startBatch = useBatchStore((s) => s.startBatch);
  const abortBatch = useBatchStore((s) => s.abortBatch);
  const clearCompleted = useBatchStore((s) => s.clearCompleted);
  const removeTask = useBatchStore((s) => s.removeTask);

  const completed = tasks.filter((t) => t.status === 'completed').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const running = tasks.filter((t) => t.status === 'running').length;

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          {t('sidebar.batch', 'Batch Queue')}
        </h3>
        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
          {tasks.length} {t('common.items', { count: tasks.length })} &middot;
          {completed} done &middot; {running} running
        </p>
      </div>

      {/* Controls */}
      <div className="px-4 py-2 border-b border-[var(--border)] space-y-2">
        {/* Mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[var(--muted-foreground)]">Mode</span>
          <button
            onClick={() => setMode(mode === 'parallel' ? 'sequential' : 'parallel')}
            className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded bg-[var(--muted)] border border-[var(--border)] cursor-pointer text-[var(--foreground)]"
          >
            {mode === 'parallel' ? <ToggleRight className="h-3 w-3 text-blue-400" /> : <ToggleLeft className="h-3 w-3" />}
            {mode === 'parallel' ? 'Parallel' : 'Sequential'}
          </button>
        </div>

        {/* Concurrency (only for parallel) */}
        {mode === 'parallel' && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--muted-foreground)]">Concurrency</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConcurrency(concurrency - 1)}
                className="w-5 h-5 flex items-center justify-center rounded bg-[var(--muted)] border border-[var(--border)] cursor-pointer text-[var(--foreground)]"
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <span className="text-xs w-5 text-center text-[var(--foreground)]">{concurrency}</span>
              <button
                onClick={() => setConcurrency(concurrency + 1)}
                className="w-5 h-5 flex items-center justify-center rounded bg-[var(--muted)] border border-[var(--border)] cursor-pointer text-[var(--foreground)]"
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-1.5">
          {!isRunning ? (
            <button
              onClick={startBatch}
              disabled={pending === 0}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg border transition-colors',
                pending > 0
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 cursor-pointer'
                  : 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] cursor-not-allowed opacity-50'
              )}
            >
              <Play className="h-3 w-3" />
              Start ({pending})
            </button>
          ) : (
            <button
              onClick={abortBatch}
              className="flex-1 flex items-center justify-center gap-1 text-[10px] py-1.5 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer transition-colors"
            >
              <Square className="h-3 w-3" />
              Abort
            </button>
          )}
          <button
            onClick={clearCompleted}
            className="flex items-center justify-center gap-1 text-[10px] py-1.5 px-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] cursor-pointer bg-transparent transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Clock className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2 opacity-30" />
            <p className="text-xs text-[var(--muted-foreground)]">No batch tasks</p>
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
              Select generation nodes and add to batch
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const config = statusConfig[task.status];
            const StatusIcon = config.icon;
            return (
              <div
                key={task.id}
                className="px-4 py-2 border-b border-[var(--border)] hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <StatusIcon
                      className={cn('h-3 w-3', config.color, task.status === 'running' && 'animate-spin')}
                    />
                    <span className="text-[11px] text-[var(--foreground)] truncate max-w-[140px]">
                      {task.label}
                    </span>
                  </div>
                  {(task.status === 'completed' || task.status === 'failed' || task.status === 'aborted') && (
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-transparent border-none p-0.5"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
                {(task.status === 'running' || task.status === 'completed') && (
                  <div className="h-1 w-full rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {task.error && (
                  <p className="text-[9px] text-red-400 mt-0.5 truncate">{task.error}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
