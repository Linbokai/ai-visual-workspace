import { Loader2, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import type { NodeStatus } from '@/types';

const statusConfig: Record<NodeStatus, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  idle: { icon: Circle, color: 'text-[var(--muted-foreground)]', label: 'Idle' },
  processing: { icon: Loader2, color: 'text-[var(--warning)]', label: 'Processing' },
  completed: { icon: CheckCircle2, color: 'text-[var(--success)]', label: 'Completed' },
  error: { icon: AlertCircle, color: 'text-[var(--error)]', label: 'Error' },
};

interface NodeStatusBadgeProps {
  status: NodeStatus;
}

export function NodeStatusBadge({ status }: NodeStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 ${config.color}`} title={config.label}>
      <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      <span className="text-[10px]">{config.label}</span>
    </div>
  );
}
