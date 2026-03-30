import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface GenerateImageNodeDataType {
  label: string;
  imageUrl?: string | null;
  prompt?: string;
  model?: string;
  progress?: number;
  character?: any;
  scene?: any;
}

const MODELS = [
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'dall-e-3', label: 'DALL-E 3' },
  { value: 'jimeng-4.5', label: '即梦 4.5' },
  { value: 'flux', label: 'Flux' },
  { value: 'sdxl', label: 'SDXL' },
  { value: 'nanobananapro', label: 'Nano Banana' },
  { value: 'gemini-image', label: 'Gemini' },
  { value: 'gpt-4o-image', label: 'GPT-4o' },
];

export function GenerateImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as GenerateImageNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const progress = nodeData.progress ?? 0;

  return (
    <div className={cn('rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[240px]', selected ? 'border-rose-500 node-selected-glow' : 'border-[var(--border)]', status === 'processing' && 'node-processing')} style={{ '--glow-color': '#f43f5e' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-rose-500" />

      <div className="px-2 py-1.5 border-b border-[var(--border)] nodrag">
        <select className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none cursor-pointer" value={nodeData.model || 'midjourney'} onChange={(e) => updateNode(id, { model: e.target.value })}>
          {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>

      <div className="w-[240px] h-[180px] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.imageUrl ? (
          <img src={nodeData.imageUrl} alt={nodeData.label} className="w-full h-full object-cover" />
        ) : status === 'processing' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
            {progress > 0 && <p className="text-[9px] text-[var(--muted-foreground)]">{progress}%</p>}
          </div>
        ) : (
          <Sparkles className="h-8 w-8 text-[var(--muted-foreground)]" />
        )}
      </div>

      {status === 'processing' && progress > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)]"><div className="h-full bg-rose-500 transition-all" style={{ width: `${progress}%` }} /></div>
      )}

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-rose-500" /><p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p></div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
