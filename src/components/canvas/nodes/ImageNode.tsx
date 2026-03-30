import { useRef, useMemo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Image, Upload, Sparkles, Loader2, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeGenerateButton } from './NodeGenerateButton';
import { RichPromptEditor } from './RichPromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface ImageNodeDataType {
  label: string;
  imageUrl: string | null;
  width: number;
  height: number;
  format: string;
  status?: string;
  prompt?: string;
  model?: string;
  progress?: number;
  aspectRatio?: string;
  style?: string;
}

const IMAGE_MODELS = [
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
  { value: '21:9', label: '21:9 · 2K' },
];

const STYLES = [
  { value: 'none', label: '风格' },
  { value: 'anime', label: '动漫' },
  { value: 'realistic', label: '写实' },
  { value: 'oil-painting', label: '油画' },
  { value: '3d-render', label: '3D' },
  { value: 'watercolor', label: '水彩' },
  { value: 'pixel-art', label: '像素' },
];

interface RefImage {
  nodeId: string;
  label: string;
  imageUrl: string;
  index: number;
}

export function ImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ImageNodeDataType;
  const status = (nodeData.status || 'idle') as string;
  const updateNode = useCanvasStore((s) => s.updateNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progress = nodeData.progress ?? 0;
  const model = nodeData.model || 'midjourney';
  const aspectRatio = nodeData.aspectRatio || '1:1';
  const style = nodeData.style || 'none';

  const refImages = useMemo((): RefImage[] => {
    const refs: RefImage[] = [];
    let index = 1;
    for (const edge of edges) {
      if (edge.target === id) {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (sourceNode) {
          const srcData = sourceNode.data as Record<string, any>;
          if (srcData.imageUrl) {
            refs.push({ nodeId: sourceNode.id, label: srcData.label || `Image ${index}`, imageUrl: srcData.imageUrl, index });
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      updateNode(id, { imageUrl: url, width: img.naturalWidth, height: img.naturalHeight, format: file.name.split('.').pop() || 'png', label: file.name });
    };
    img.src = url;
  };

  const triggerUpload = () => { fileInputRef.current?.click(); };

  return (
    <div className={cn('transition-colors', selected && 'z-10')}>
      {/* ── Node card (always visible) ── */}
      <div
        className={cn(
          'rounded-xl overflow-hidden bg-[var(--card)] border transition-all w-[240px]',
          selected ? 'border-[var(--node-image)]/60' : 'border-[var(--border)]',
        )}
      >
        <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-image)] !border-2 !border-[var(--card)]" />

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        {/* Title bar */}
        <div className="px-2.5 py-1.5 flex items-center gap-1.5">
          <Image className="h-3 w-3 text-[var(--muted-foreground)]" />
          <span className="text-[11px] text-[var(--muted-foreground)] truncate">{nodeData.label}</span>
          {/* Upload button (top-right) */}
          {!nodeData.imageUrl && (
            <button
              onClick={triggerUpload}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border)] text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors cursor-pointer bg-transparent"
            >
              <Upload className="h-3 w-3" />
              {t('nodes.upload', '上传')}
            </button>
          )}
        </div>

        {/* Image display */}
        <div className="w-full aspect-[4/3] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
          {nodeData.imageUrl ? (
            <div className="relative group w-full h-full">
              <img src={nodeData.imageUrl} alt={nodeData.label} className="w-full h-full object-contain" />
              <button
                onClick={triggerUpload}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md border border-white/20 bg-black/50 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm hover:bg-black/70"
              >
                <Upload className="h-3 w-3" />
                {t('nodes.upload', '上传')}
              </button>
            </div>
          ) : status === 'processing' ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-[var(--muted-foreground)] animate-spin" />
              {progress > 0 && (
                <div className="w-20">
                  <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--node-image)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Image className="h-8 w-8 text-[var(--muted-foreground)]/30" />
          )}
        </div>

        {/* Progress bar */}
        {status === 'processing' && progress > 0 && (
          <div className="h-0.5 w-full bg-[var(--border)]">
            <div className="h-full bg-[var(--node-image)] transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-image)] !border-2 !border-[var(--card)]" />
      </div>

      {/* ── Editing panel (only when selected) ── */}
      {selected && (
        <div className="mt-2 rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden w-[360px] -ml-[60px] shadow-xl">
          <RichPromptEditor
            nodeId={id}
            prompt={nodeData.prompt || ''}
            onChange={(prompt) => updateNode(id, { prompt })}
            refImages={refImages}
            onInsertRef={insertImageRef}
            placeholder={t('properties.nodePromptPlaceholder', '描述你想生成的图片...')}
            accentColor="rgb(59, 130, 246)"
          />

          {/* Bottom toolbar */}
          <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2 flex-wrap nodrag text-[11px] text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--foreground)] transition-colors">
              <Sparkles className="h-3 w-3" />
              <select className="bg-transparent text-inherit text-[11px] focus:outline-none cursor-pointer appearance-none" value={model} onChange={(e) => updateNode(id, { model: e.target.value })}>
                {IMAGE_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <span className="text-[var(--border)]">|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--foreground)] transition-colors">
              <span>⬡</span>
              <select className="bg-transparent text-inherit text-[11px] focus:outline-none cursor-pointer appearance-none" value={aspectRatio} onChange={(e) => updateNode(id, { aspectRatio: e.target.value })}>
                {ASPECT_RATIOS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <span className="text-[var(--border)]">|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--foreground)] transition-colors">
              <Palette className="h-3 w-3" />
              <select className="bg-transparent text-inherit text-[11px] focus:outline-none cursor-pointer appearance-none" value={style} onChange={(e) => updateNode(id, { style: e.target.value })}>
                {STYLES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="ml-auto">
              <NodeGenerateButton nodeId={id} status={status} mode="image" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
