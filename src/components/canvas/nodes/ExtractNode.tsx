import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Users, MapPin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface ExtractNodeDataType {
  label: string;
  sourceText?: string;
  characters?: Array<{ name: string; identity: string; appearance: string; age: string; gender: string; imageUrl: string | null }>;
  scenes?: Array<{ name: string; environment: string; description: string; mood: string; imageUrl: string | null }>;
  prompt?: string;
}

export function ExtractNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ExtractNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { t } = useTranslation();
  const characters = nodeData.characters || [];
  const scenes = nodeData.scenes || [];
  const hasSource = !!(nodeData.sourceText && nodeData.sourceText.trim());

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[260px]',
        selected ? 'border-purple-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#a855f7' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-purple-500" />

      {/* Text input area */}
      <div className="px-2 py-2 nodrag">
        <textarea
          className="w-full h-20 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded-lg p-2 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          placeholder={t('properties.novelPlaceholder')}
          value={nodeData.sourceText || ''}
          onChange={(e) => updateNode(id, { sourceText: e.target.value })}
        />
        <p className="text-[9px] text-[var(--muted-foreground)] mt-0.5 text-right">
          {(nodeData.sourceText || '').length} {t('common.characters', { count: (nodeData.sourceText || '').length })}
        </p>
      </div>

      {/* Extracted characters */}
      {characters.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1 mb-1">
            <Users className="h-3 w-3 text-purple-400" />
            <p className="text-[10px] font-medium text-[var(--foreground)]">{t('storyboard.characters')} ({characters.length})</p>
          </div>
          <div className="space-y-1">
            {characters.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] text-purple-400">{c.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-medium text-[var(--foreground)] truncate">{c.name}</p>
                  <p className="text-[9px] text-[var(--muted-foreground)] truncate">{c.identity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted scenes */}
      {scenes.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-1 mb-1">
            <MapPin className="h-3 w-3 text-purple-400" />
            <p className="text-[10px] font-medium text-[var(--foreground)]">{t('storyboard.scenes')} ({scenes.length})</p>
          </div>
          <div className="space-y-1">
            {scenes.slice(0, 4).map((s, i) => (
              <div key={i} className="text-[10px]">
                <p className="font-medium text-[var(--foreground)] truncate">{s.name}</p>
                <p className="text-[9px] text-[var(--muted-foreground)] truncate">{s.environment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state - only when no text and no results */}
      {!hasSource && characters.length === 0 && scenes.length === 0 && (
        <div className="px-3 py-3 flex flex-col items-center gap-1">
          <Sparkles className="h-5 w-5 text-[var(--muted-foreground)]" />
          <p className="text-[10px] text-[var(--muted-foreground)]">{t('nodes.extractCharactersScenesDesc')}</p>
        </div>
      )}

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-purple-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <NodeGenerateButton nodeId={id} status={status} mode="extract" />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
