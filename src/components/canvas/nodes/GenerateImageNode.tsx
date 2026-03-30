import { useMemo, useState, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sparkles, Loader2, ImageIcon, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useTranslation } from 'react-i18next';
import type { NodeStatus } from '@/types';

interface GenerateImageNodeDataType {
  label: string;
  imageUrl?: string | null;
  prompt?: string;
  model?: string;
  progress?: number;
  character?: any;
  scene?: any;
  aspectRatio?: string;
  style?: string;
}

const MODELS = [
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'dall-e-3', label: 'DALL-E 3' },
  { value: 'jimeng-4.5', label: '即梦 4.5' },
  { value: 'flux', label: 'Flux' },
  { value: 'sdxl', label: 'SDXL' },
  { value: 'nanobananapro', label: 'Banana Pro' },
  { value: 'gemini-image', label: 'Gemini' },
  { value: 'gpt-4o-image', label: 'GPT-4o' },
];

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '21:9', label: '21:9' },
];

const STYLES = [
  { value: 'none', label: '无' },
  { value: 'anime', label: '动漫' },
  { value: 'realistic', label: '写实' },
  { value: 'oil-painting', label: '油画' },
  { value: '3d-render', label: '3D' },
  { value: 'watercolor', label: '水彩' },
  { value: 'pixel-art', label: '像素' },
];

/** Connected reference image info */
interface RefImage {
  nodeId: string;
  label: string;
  imageUrl: string;
  index: number;
}

export function GenerateImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as GenerateImageNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const { t } = useTranslation();
  const progress = nodeData.progress ?? 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  // Get connected reference images (from input edges)
  const refImages = useMemo((): RefImage[] => {
    const refs: RefImage[] = [];
    let index = 1;
    for (const edge of edges) {
      if (edge.target === id) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode) {
          const nodeDataSrc = sourceNode.data as Record<string, any>;
          const imageUrl = nodeDataSrc.imageUrl;
          if (imageUrl) {
            refs.push({
              nodeId: sourceNode.id,
              label: nodeDataSrc.label || `Image ${index}`,
              imageUrl,
              index,
            });
            index++;
          }
        }
      }
    }
    return refs;
  }, [id, nodes, edges]);

  // Insert image reference tag into prompt
  const insertImageRef = (ref: RefImage) => {
    const tag = `@[${ref.nodeId}:${ref.label}]`;
    const currentPrompt = nodeData.prompt || '';
    // Only insert if not already referenced
    if (!currentPrompt.includes(tag)) {
      const newPrompt = currentPrompt ? `${currentPrompt} ${tag} ` : `${tag} `;
      updateNode(id, { prompt: newPrompt });
    }
  };

  // Parse prompt to render inline image reference tags
  const renderPromptDisplay = () => {
    const prompt = nodeData.prompt || '';
    if (!prompt) return null;

    const regex = /@\[([^\]:]+):([^\]]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(prompt)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{prompt.slice(lastIndex, match.index)}</span>);
      }
      const refNodeId = match[1];
      const refLabel = match[2];
      const ref = refImages.find((r) => r.nodeId === refNodeId);
      parts.push(
        <span
          key={key++}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-medium align-middle"
        >
          <ImageIcon className="h-2.5 w-2.5" />
          {ref ? `Image ${ref.index}` : refLabel}
        </span>
      );
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < prompt.length) {
      parts.push(<span key={key++}>{prompt.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : prompt;
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(id, { prompt: e.target.value });
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const model = nodeData.model || 'jimeng-4.5';
  const aspectRatio = nodeData.aspectRatio || '1:1';
  const style = nodeData.style || 'none';

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors w-[320px]',
        selected ? 'border-rose-500 node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': '#f43f5e' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-[var(--card)]" />

      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-rose-500" />
          <span className="text-xs font-medium text-[var(--card-foreground)]">
            {t('nodes.imageGeneration', '图片生成')}
          </span>
        </div>
        <NodeStatusBadge status={status as NodeStatus} />
      </div>

      {/* Output image display */}
      <div className="w-full aspect-[4/3] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.imageUrl ? (
          <img src={nodeData.imageUrl} alt={nodeData.label} className="w-full h-full object-contain" />
        ) : status === 'processing' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
            {progress > 0 && (
              <div className="w-24">
                <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[9px] text-[var(--muted-foreground)] text-center mt-0.5">{progress}%</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--muted-foreground)]">
            <Sparkles className="h-8 w-8" />
            <span className="text-[10px]">{t('nodes.generateHint', '输入提示词生成图片')}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {status === 'processing' && progress > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)]">
          <div className="h-full bg-rose-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Reference images from connected nodes */}
      {refImages.length > 0 && (
        <div className="px-3 py-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 flex-wrap">
            {refImages.map((ref) => (
              <button
                key={ref.nodeId}
                onClick={() => insertImageRef(ref)}
                className="group/ref relative flex items-center gap-1 pl-0.5 pr-2 py-0.5 rounded-md bg-[var(--muted)] hover:bg-blue-500/10 border border-[var(--border)] hover:border-blue-500/30 transition-colors cursor-pointer"
                title={`${t('nodes.insertRef', '点击插入引用')} ${ref.label}`}
              >
                <img
                  src={ref.imageUrl}
                  alt={ref.label}
                  className="w-6 h-6 rounded object-cover"
                />
                <span className="text-[10px] text-[var(--muted-foreground)] group-hover/ref:text-blue-400">
                  Image {ref.index}
                </span>
              </button>
            ))}
            <button
              className="w-6 h-6 rounded-md border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors cursor-pointer bg-transparent"
              title={t('nodes.addRef', '连接更多图片')}
            >
              <span className="text-sm leading-none">+</span>
            </button>
          </div>
        </div>
      )}

      {/* Prompt editor area */}
      <div className="px-3 py-2 border-t border-[var(--border)] nodrag nowheel">
        {isEditingPrompt ? (
          <textarea
            ref={textareaRef}
            value={nodeData.prompt || ''}
            onChange={handlePromptChange}
            onBlur={() => setIsEditingPrompt(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsEditingPrompt(false);
              }
            }}
            placeholder={t('properties.nodePromptPlaceholder', '描述你想生成的图片...')}
            className="w-full bg-transparent text-xs text-[var(--foreground)] resize-none outline-none placeholder:text-[var(--muted-foreground)]/50 min-h-[48px] max-h-[120px] border-none p-0 leading-relaxed"
            rows={3}
            autoFocus
          />
        ) : (
          <div
            onClick={() => setIsEditingPrompt(true)}
            className="min-h-[48px] cursor-text"
          >
            {nodeData.prompt ? (
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap break-words">
                {renderPromptDisplay()}
              </p>
            ) : (
              <p className="text-[11px] text-[var(--muted-foreground)]/40 italic">
                {t('properties.nodePromptPlaceholder', '描述你想生成的图片...')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom toolbar - model, aspect ratio, style, controls */}
      <div className="px-2 py-1.5 border-t border-[var(--border)] flex items-center gap-1.5 flex-wrap nodrag">
        {/* Model selector */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] cursor-pointer hover:border-[var(--foreground)]/20 transition-colors">
          <Sparkles className="h-3 w-3 text-rose-500 flex-shrink-0" />
          <select
            className="bg-transparent text-[var(--foreground)] text-[10px] focus:outline-none cursor-pointer appearance-none pr-3"
            value={model}
            onChange={(e) => updateNode(id, { model: e.target.value })}
          >
            {MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
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

        {/* Style */}
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-[var(--muted)] border border-[var(--border)] cursor-pointer hover:border-[var(--foreground)]/20 transition-colors">
          <Palette className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
          <select
            className="bg-transparent text-[var(--foreground)] text-[10px] focus:outline-none cursor-pointer appearance-none pr-3"
            value={style}
            onChange={(e) => updateNode(id, { style: e.target.value })}
          >
            {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Generate button */}
      <NodeGenerateButton nodeId={id} status={status} mode="image" />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
