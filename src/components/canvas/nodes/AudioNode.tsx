import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface AudioNodeDataType {
  label: string;
  audioUrl: string | null;
  duration: number;
  status?: string;
  prompt?: string;
}

export function AudioNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as AudioNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[180px]',
        selected ? 'border-[var(--node-audio)] node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': 'var(--node-audio)' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-audio)] !border-2 !border-[var(--card)]" />

      {/* Color bar */}
      <div className="h-1 w-full bg-[var(--node-audio)]" />

      <div className="flex items-center gap-3 px-3 py-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
          <Music className="h-5 w-5 text-[var(--node-audio)]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--card-foreground)] truncate">
            {nodeData.label}
          </p>
          {nodeData.audioUrl && (
            <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
              {Math.floor(nodeData.duration / 60)}:{(nodeData.duration % 60).toString().padStart(2, '0')}
            </p>
          )}
        </div>
      </div>

      {/* Prompt Editor */}
      <NodePromptEditor
        nodeId={id}
        prompt={nodeData.prompt || ''}
        onChange={(prompt) => updateNode(id, { prompt })}
      />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-audio)] !border-2 !border-[var(--card)]" />
    </div>
  );
}
