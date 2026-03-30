import { Handle, Position, type NodeProps } from '@xyflow/react';
import { LayoutGrid, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface Shot {
  id: string;
  shotNumber: number;
  description: string;
  imageUrl: string | null;
  prompt: string;
  cameraAngle: string;
  duration: number;
}

interface StoryboardNodeDataType {
  label: string;
  shots?: Shot[];
  prompt?: string;
}

export function StoryboardNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as StoryboardNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const shots = nodeData.shots || [];

  const addShot = () => {
    const newShot: Shot = {
      id: crypto.randomUUID(),
      shotNumber: shots.length + 1,
      description: '',
      imageUrl: null,
      prompt: '',
      cameraAngle: 'medium',
      duration: 3,
    };
    updateNode(id, { shots: [...shots, newShot] });
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[320px] max-w-[400px]',
        selected ? 'border-orange-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#f97316' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-orange-500" />

      <div className="max-h-[300px] overflow-y-auto nodrag">
        {shots.length > 0 ? (
          <div className="divide-y divide-[var(--border)]">
            {shots.map((shot) => (
              <div key={shot.id} className="px-2 py-1.5 flex gap-2">
                <div className="w-16 h-12 rounded bg-[var(--muted)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {shot.imageUrl ? (
                    <img src={shot.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-[var(--muted-foreground)]">#{shot.shotNumber}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-mono text-orange-400">S{shot.shotNumber}</span>
                    <span className="text-[9px] px-1 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">{shot.cameraAngle}</span>
                    <span className="text-[9px] text-[var(--muted-foreground)]">{shot.duration}s</span>
                  </div>
                  <p className="text-[10px] text-[var(--foreground)] truncate mt-0.5">{shot.description || 'No description'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-3 py-6 flex flex-col items-center gap-1">
            <LayoutGrid className="h-6 w-6 text-[var(--muted-foreground)]" />
            <p className="text-[10px] text-[var(--muted-foreground)]">No shots yet</p>
          </div>
        )}
      </div>

      <div className="px-2 py-1.5 border-t border-[var(--border)] nodrag">
        <button
          onClick={addShot}
          className="w-full flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed border-[var(--border)] text-[10px] text-[var(--muted-foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent"
        >
          <Plus className="h-3 w-3" /> Add Shot
        </button>
      </div>

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LayoutGrid className="h-3.5 w-3.5 text-orange-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <div className="flex items-center gap-1">
            {shots.length > 0 && (
              <span className="text-[9px] px-1 py-px rounded bg-orange-500/20 text-orange-400">{shots.length} shots</span>
            )}
            <NodeStatusBadge status={status as NodeStatus} />
          </div>
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-orange-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
