import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Film, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface VideoAnalyzeNodeDataType {
  label: string;
  videoUrl: string | null;
  scenes?: Array<{ timestamp: number; description: string; thumbnailUrl: string | null }>;
  keyframes?: Array<{ time: number; imageUrl: string | null }>;
  analysisStatus?: string;
  prompt?: string;
}

export function VideoAnalyzeNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as VideoAnalyzeNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const analysisStatus = nodeData.analysisStatus || 'idle';
  const keyframes = nodeData.keyframes || [];
  const scenes = nodeData.scenes || [];

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[260px]',
        selected ? 'border-cyan-500 node-selected-glow' : 'border-[var(--border)]',
        analysisStatus !== 'idle' && analysisStatus !== 'done' && 'node-processing'
      )}
      style={{ '--glow-color': '#06b6d4' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-cyan-500" />

      <div className="p-2 nodrag">
        {nodeData.videoUrl ? (
          <video src={nodeData.videoUrl} className="w-full h-32 rounded-lg object-cover bg-black" controls />
        ) : (
          <div className="w-full h-24 rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1">
            <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
            <p className="text-[10px] text-[var(--muted-foreground)]">Upload or connect video</p>
          </div>
        )}
      </div>

      {analysisStatus !== 'idle' && analysisStatus !== 'done' && (
        <div className="px-3 py-1.5 flex items-center gap-2 border-t border-[var(--border)]">
          <Loader2 className="h-3 w-3 text-cyan-500 animate-spin" />
          <p className="text-[10px] text-[var(--muted-foreground)] capitalize">{analysisStatus}...</p>
        </div>
      )}

      {keyframes.length > 0 && (
        <div className="px-2 py-1.5 border-t border-[var(--border)]">
          <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Keyframes ({keyframes.length})</p>
          <div className="grid grid-cols-4 gap-1">
            {keyframes.slice(0, 8).map((kf, i) => (
              <div key={i} className="aspect-video rounded bg-[var(--muted)] overflow-hidden">
                {kf.imageUrl ? <img src={kf.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-cyan-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <div className="flex items-center gap-1">
            {scenes.length > 0 && (
              <span className="text-[9px] px-1 py-px rounded bg-cyan-500/20 text-cyan-400">{scenes.length} scenes</span>
            )}
            <NodeStatusBadge status={status as NodeStatus} />
          </div>
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
