import { Handle, Position, type NodeProps } from '@xyflow/react';
import { HardDrive, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface LocalSaveNodeDataType {
  label: string;
  savePath?: string;
  format?: string;
  autoSave?: boolean;
  lastSavedAt?: string | null;
  prompt?: string;
}

export function LocalSaveNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as LocalSaveNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[220px]',
        selected ? 'border-slate-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#64748b' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-slate-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-slate-500" />

      <div className="p-3 space-y-2 nodrag">
        <div>
          <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('localSave.savePath')}</p>
          <input
            type="text"
            className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="./output/"
            value={nodeData.savePath || ''}
            onChange={(e) => updateNode(id, { savePath: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('localSave.format')}</p>
            <select
              className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none cursor-pointer"
              value={nodeData.format || 'png'}
              onChange={(e) => updateNode(id, { format: e.target.value })}
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div className="flex-1">
            <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('localSave.autoSave')}</p>
            <button
              onClick={() => updateNode(id, { autoSave: !nodeData.autoSave })}
              className={cn(
                'w-full text-[10px] rounded px-2 py-0.5 border transition-colors cursor-pointer',
                nodeData.autoSave
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                  : 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]'
              )}
            >
              {nodeData.autoSave ? t('localSave.on') : t('localSave.off')}
            </button>
          </div>
        </div>
        {nodeData.lastSavedAt && (
          <div className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-400" />
            <p className="text-[9px] text-[var(--muted-foreground)]">{t('localSave.lastSaved', { time: nodeData.lastSavedAt })}</p>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-slate-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
