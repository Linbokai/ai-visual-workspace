import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodePromptEditor } from './NodePromptEditor';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface TextNodeDataType {
  label: string;
  content: string;
  status?: string;
  prompt?: string;
}

export function TextNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as TextNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[180px] max-w-[280px]',
        selected ? 'border-[var(--node-text)] node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': 'var(--node-text)' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-text)] !border-2 !border-[var(--card)]" />

      {/* Color bar */}
      <div className="h-1 w-full bg-[var(--node-text)]" />

      <div className="px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5 text-[var(--node-text)] flex-shrink-0" />
          <p className="text-xs font-medium text-[var(--card-foreground)]">
            {nodeData.label}
          </p>
        </div>
      </div>

      <div className="px-3 py-2 min-h-[60px]">
        <p className="text-xs text-[var(--muted-foreground)] whitespace-pre-wrap">
          {nodeData.content || 'Empty text node'}
        </p>
      </div>

      {/* Prompt Editor */}
      <NodePromptEditor
        nodeId={id}
        prompt={nodeData.prompt || ''}
        onChange={(prompt) => updateNode(id, { prompt })}
      />

      {/* Generate Button */}
      <NodeGenerateButton nodeId={id} status={status} mode="text" />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-text)] !border-2 !border-[var(--card)]" />
    </div>
  );
}
