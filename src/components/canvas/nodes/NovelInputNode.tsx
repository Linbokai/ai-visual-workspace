import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpen, Sparkles, Users, MapPin, Eye, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
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
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);
  const { t } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);

  const wordCount = (nodeData.content || '').length;
  const hasContent = wordCount > 0;

  const handleAnalyze = () => {
    if (!hasContent) return;
    setAnalyzing(true);
    // Open storyboard panel for analysis
    togglePanel('storyboard');
    setTimeout(() => setAnalyzing(false), 1000);
  };

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
          placeholder={t('properties.novelPlaceholder')}
          value={nodeData.content || ''}
          maxLength={10000}
          onChange={(e) => updateNode(id, { content: e.target.value, wordCount: e.target.value.length })}
        />
        <p className="text-[10px] text-[var(--muted-foreground)] mt-1 text-right">{wordCount} / 10,000</p>

        {/* Analyze Story Button */}
        <button
          onClick={handleAnalyze}
          disabled={!hasContent || analyzing}
          className={cn(
            'w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border-none',
            hasContent && !analyzing
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
          )}
        >
          <Sparkles className={cn('h-3.5 w-3.5', analyzing && 'animate-spin')} />
          {analyzing ? t('storyboard.analyzing') : t('storyboard.analyzeStory')}
        </button>

        {/* AI Analysis Quick Actions */}
        <div className="mt-2">
          <p className="text-[9px] text-[var(--muted-foreground)] mb-1">{t('storyboard.aiAnalysis')}</p>
          <div className="grid grid-cols-2 gap-1">
            <button
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer bg-transparent border border-[var(--border)]"
              onClick={() => togglePanel('storyboard')}
            >
              <Users className="h-3 w-3" />
              {t('storyboard.characters')}
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer bg-transparent border border-[var(--border)]"
              onClick={() => togglePanel('storyboard')}
            >
              <MapPin className="h-3 w-3" />
              {t('storyboard.scenes')}
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer bg-transparent border border-[var(--border)]"
              onClick={() => togglePanel('storyboard')}
            >
              <Eye className="h-3 w-3" />
              {t('storyboard.visualPrompts')}
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer bg-transparent border border-[var(--border)]"
              onClick={() => togglePanel('storyboard')}
            >
              <Camera className="h-3 w-3" />
              {t('storyboard.cameraShots')}
            </button>
          </div>
        </div>
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
