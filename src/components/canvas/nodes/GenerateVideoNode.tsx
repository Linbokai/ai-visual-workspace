import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Film, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface GenerateVideoNodeDataType {
  label: string;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  prompt?: string;
  model?: string;
  duration?: number;
  progress?: number;
  character?: any;
  scene?: any;
}

const VIDEO_MODELS = [
  { value: 'sora-2', label: 'Sora 2' },
  { value: 'veo3', label: 'Veo 3' },
  { value: 'runway', label: 'Runway Gen-3' },
  { value: 'pika', label: 'Pika' },
  { value: 'kling', label: 'Kling' },
  { value: 'jimeng-video-3.5', label: '即梦 3.5' },
  { value: 'grok-video', label: 'Grok Video' },
];

const DURATIONS = [
  { value: 3, label: '3s' },
  { value: 5, label: '5s' },
  { value: 8, label: '8s' },
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
];

export function GenerateVideoNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as GenerateVideoNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const progress = nodeData.progress ?? 0;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[240px]',
        selected ? 'border-purple-500 node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': '#a855f7' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-purple-500" />

      {/* Model & Duration selectors */}
      <div className="px-2 py-1.5 border-b border-[var(--border)] nodrag flex gap-1.5">
        <select
          className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none cursor-pointer"
          value={nodeData.model || 'sora-2'}
          onChange={(e) => updateNode(id, { model: e.target.value })}
        >
          {VIDEO_MODELS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          className="w-16 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none cursor-pointer"
          value={nodeData.duration || 5}
          onChange={(e) => updateNode(id, { duration: Number(e.target.value) })}
        >
          {DURATIONS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>

      {/* Video preview area */}
      <div className="w-[240px] h-[135px] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.videoUrl ? (
          <video
            src={nodeData.videoUrl}
            poster={nodeData.thumbnailUrl || undefined}
            className="w-full h-full object-cover"
            controls
            muted
          />
        ) : nodeData.thumbnailUrl ? (
          <img src={nodeData.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : status === 'processing' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            {progress > 0 && <p className="text-[9px] text-[var(--muted-foreground)]">{progress}%</p>}
          </div>
        ) : (
          <Film className="h-8 w-8 text-[var(--muted-foreground)]" />
        )}
      </div>

      {/* Progress bar */}
      {status === 'processing' && progress > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)]">
          <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-purple-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <NodeGenerateButton nodeId={id} status={status} mode="video" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
