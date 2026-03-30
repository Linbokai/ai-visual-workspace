import { useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Film, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useTranslation } from 'react-i18next';
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
  aspectRatio?: string;
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

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
];

interface RefImage {
  nodeId: string;
  label: string;
  imageUrl: string;
  index: number;
}

export function GenerateVideoNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as GenerateVideoNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const { t } = useTranslation();
  const progress = nodeData.progress ?? 0;

  // Get connected reference images
  const refImages = useMemo((): RefImage[] => {
    const refs: RefImage[] = [];
    let index = 1;
    for (const edge of edges) {
      if (edge.target === id) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode) {
          const srcData = sourceNode.data as Record<string, any>;
          if (srcData.imageUrl) {
            refs.push({
              nodeId: sourceNode.id,
              label: srcData.label || `Image ${index}`,
              imageUrl: srcData.imageUrl,
              index,
            });
            index++;
          }
        }
      }
    }
    return refs;
  }, [id, nodes, edges]);

  const insertImageRef = (ref: RefImage) => {
    const tag = `@[${ref.nodeId}:${ref.label}]`;
    const currentPrompt = nodeData.prompt || '';
    if (!currentPrompt.includes(tag)) {
      updateNode(id, { prompt: currentPrompt ? `${currentPrompt} ${tag} ` : `${tag} ` });
    }
  };

  const model = nodeData.model || 'sora-2';
  const duration = nodeData.duration || 5;
  const aspectRatio = nodeData.aspectRatio || '16:9';

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors w-[320px]',
        selected ? 'border-purple-500 node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': '#a855f7' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[var(--card)]" />

      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Film className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-xs font-medium text-[var(--card-foreground)]">
            {t('nodes.videoGeneration', '视频生成')}
          </span>
        </div>
        <NodeStatusBadge status={status as NodeStatus} />
      </div>

      {/* Video preview area */}
      <div className="w-full aspect-video flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.videoUrl ? (
          <video
            src={nodeData.videoUrl}
            poster={nodeData.thumbnailUrl || undefined}
            className="w-full h-full object-contain"
            controls
            muted
          />
        ) : nodeData.thumbnailUrl ? (
          <img src={nodeData.thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : status === 'processing' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            {progress > 0 && (
              <div className="w-24">
                <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[9px] text-[var(--muted-foreground)] text-center mt-0.5">{progress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--muted-foreground)]">
            <Film className="h-8 w-8" />
            <span className="text-[10px]">{t('nodes.generateVideoHint', '输入提示词生成视频')}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {status === 'processing' && progress > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)]">
          <div className="h-full bg-purple-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Reference images */}
      {refImages.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 flex-wrap">
            {refImages.map((ref) => (
              <button
                key={ref.nodeId}
                onClick={() => insertImageRef(ref)}
                className="group/ref relative flex items-center gap-1 pl-0.5 pr-2 py-0.5 rounded-md bg-[var(--muted)] hover:bg-purple-500/10 border border-[var(--border)] hover:border-purple-500/30 transition-colors cursor-pointer"
              >
                <img src={ref.imageUrl} alt={ref.label} className="w-6 h-6 rounded object-cover" />
                <span className="text-[10px] text-[var(--muted-foreground)] group-hover/ref:text-purple-400">
                  Image {ref.index}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt editor */}
      <div className="px-3 py-2 border-t border-[var(--border)] nodrag nowheel">
        <textarea
          value={nodeData.prompt || ''}
          onChange={(e) => {
            updateNode(id, { prompt: e.target.value });
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          placeholder={t('properties.nodePromptPlaceholder', '描述你想生成的视频...')}
          className="w-full bg-transparent text-xs text-[var(--foreground)] resize-none outline-none placeholder:text-[var(--muted-foreground)]/50 min-h-[48px] max-h-[120px] border-none p-0 leading-relaxed"
          rows={3}
        />
      </div>

      {/* Bottom toolbar */}
      <div className="px-2 py-1.5 border-t border-[var(--border)] flex items-center gap-1.5 flex-wrap nodrag">
        {/* Model */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] cursor-pointer hover:border-[var(--foreground)]/20 transition-colors">
          <Film className="h-3 w-3 text-purple-500 flex-shrink-0" />
          <select
            className="bg-transparent text-[var(--foreground)] text-[10px] focus:outline-none cursor-pointer appearance-none pr-3"
            value={model}
            onChange={(e) => updateNode(id, { model: e.target.value })}
          >
            {VIDEO_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>

        {/* Duration */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] cursor-pointer hover:border-[var(--foreground)]/20 transition-colors">
          <Clock className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
          <select
            className="bg-transparent text-[var(--foreground)] text-[10px] focus:outline-none cursor-pointer appearance-none pr-3"
            value={duration}
            onChange={(e) => updateNode(id, { duration: Number(e.target.value) })}
          >
            {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        {/* Aspect ratio */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] cursor-pointer hover:border-[var(--foreground)]/20 transition-colors">
          <span className="text-[10px] text-[var(--muted-foreground)]">⬡</span>
          <select
            className="bg-transparent text-[var(--foreground)] text-[10px] focus:outline-none cursor-pointer appearance-none pr-3"
            value={aspectRatio}
            onChange={(e) => updateNode(id, { aspectRatio: e.target.value })}
          >
            {ASPECT_RATIOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {/* Generate button */}
      <NodeGenerateButton nodeId={id} status={status} mode="video" />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
