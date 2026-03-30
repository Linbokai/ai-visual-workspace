import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface NovelInputNodeDataType {
  label: string;
  content: string;
  prompt?: string;
  wordCount?: number;
}

export function NovelInputNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as NovelInputNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);

  const wordCount = (nodeData.content || '').length;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[280px] max-w-[360px]',
        selected ? 'border-amber-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#f59e0b' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-amber-500" />
      <div className="p-3 nodrag">
        <textarea
          className="w-full h-40 bg-[var(--muted)] text-[var(--foreground)] text-xs rounded-lg p-2 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-amber-500 resize-y"
          placeholder="Paste your novel chapter, screenplay, or story text here..."
          value={nodeData.content || ''}
          maxLength={10000}
          onChange={(e) => updateNode(id, { content: e.target.value, wordCount: e.target.value.length })}
        />
        <p className="text-[10px] text-[var(--muted-foreground)] mt-1 text-right">{wordCount} / 10,000</p>
      </div>
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
