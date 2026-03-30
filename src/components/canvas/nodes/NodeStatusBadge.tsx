import { Loader2, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NodeStatus } from '@/types';

const statusConfig: Record<NodeStatus, { icon: React.ComponentType<{ className?: string }>; color: string; labelKey: string }> = {
  idle: { icon: Circle, color: 'text-[var(--muted-foreground)]', labelKey: 'nodeStatus.idle' },
  processing: { icon: Loader2, color: 'text-[var(--warning)]', labelKey: 'nodeStatus.processing' },
  completed: { icon: CheckCircle2, color: 'text-[var(--success)]', labelKey: 'nodeStatus.completed' },
  error: { icon: AlertCircle, color: 'text-[var(--error)]', labelKey: 'nodeStatus.error' },
};

interface NodeStatusBadgeProps {
  status: NodeStatus;
}

export function NodeStatusBadge({ status }: NodeStatusBadgeProps) {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;
  const label = t(config.labelKey);

  return (
    <div className={`flex items-center gap-1 ${config.color}`} title={label}>
      <Icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
      <span className="text-[10px]">{label}</span>
    </div>
  );
}
