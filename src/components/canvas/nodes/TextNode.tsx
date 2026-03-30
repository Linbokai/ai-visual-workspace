import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Type, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [isEditingContent, setIsEditingContent] = useState(false);

  return (
    <div className={cn('transition-colors', selected && 'z-10')}>
      {/* ── Node card ── */}
      <div
        className={cn(
          'rounded-xl overflow-hidden bg-[var(--card)] border transition-all w-[220px]',
          selected ? 'border-[var(--node-text)]/60' : 'border-[var(--border)]',
        )}
      >
        <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-text)] !border-2 !border-[var(--card)]" />

        {/* Title */}
        <div className="px-2.5 py-1.5 flex items-center gap-1.5">
          <Type className="h-3 w-3 text-[var(--muted-foreground)]" />
          <span className="text-[11px] text-[var(--muted-foreground)] truncate">{nodeData.label}</span>
        </div>

        {/* Content area */}
        <div className="px-3 py-2 min-h-[60px] nodrag">
          {isEditingContent && selected ? (
            <textarea
              value={nodeData.content || ''}
              onChange={(e) => updateNode(id, { content: e.target.value })}
              onBlur={() => setIsEditingContent(false)}
              className="w-full bg-transparent text-xs text-[var(--foreground)] resize-none outline-none border-none p-0 min-h-[60px]"
              autoFocus
            />
          ) : (
            <p
              className="text-xs text-[var(--foreground)] whitespace-pre-wrap cursor-text"
              onClick={() => { if (selected) setIsEditingContent(true); }}
            >
              {nodeData.content || <span className="text-[var(--muted-foreground)]/40 italic">{t('nodes.textDesc', '点击输入文本')}</span>}
            </p>
          )}
        </div>

        {status === 'processing' && (
          <div className="px-3 py-1 flex items-center gap-1.5 border-t border-[var(--border)]">
            <Loader2 className="h-3 w-3 text-[var(--node-text)] animate-spin" />
            <span className="text-[10px] text-[var(--muted-foreground)]">Generating...</span>
          </div>
        )}

        <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-text)] !border-2 !border-[var(--card)]" />
      </div>

      {/* ── Editing panel ── */}
      {selected && (
        <div className="mt-2 rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden w-[300px] -ml-[40px] shadow-xl">
          <div className="px-3 py-2 nodrag nowheel">
            <textarea
              value={nodeData.prompt || ''}
              onChange={(e) => updateNode(id, { prompt: e.target.value })}
              placeholder={t('properties.nodePromptPlaceholder', '描述你想生成的文本内容...')}
              className="w-full bg-transparent text-xs text-[var(--foreground)] resize-none outline-none min-h-[36px] max-h-[80px] border-none p-0 leading-relaxed placeholder:text-[var(--muted-foreground)]/40"
              rows={2}
              spellCheck={false}
            />
          </div>
          <div className="px-3 py-2 border-t border-[var(--border)] flex items-center justify-between nodrag">
            <span className="text-[11px] text-[var(--muted-foreground)]">AI 文本生成</span>
            <NodeGenerateButton nodeId={id} status={status} mode="text" />
          </div>
        </div>
      )}
    </div>
  );
}
