import { useMemo, useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Video, Upload, Film, Loader2, Clock, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeGenerateButton } from './NodeGenerateButton';
import { RichPromptEditor } from './RichPromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface VideoNodeDataType {
  label: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  status?: string;
  prompt?: string;
  model?: string;
  progress?: number;
  aspectRatio?: string;
  cameraMotion?: string;
}

const VIDEO_MODELS = [
  { value: 'sora-2', label: 'Sora 2' },
  { value: 'veo3', label: 'Veo 3' },
  { value: 'runway', label: 'Runway Gen-3' },
  { value: 'pika', label: 'Pika' },
  { value: 'kling', label: 'Kling' },
  { value: 'jimeng-video-3.5', label: '即梦 3.5' },
  { value: 'grok-video', label: 'Grok Video' },
  { value: 'sora', label: 'Sora' },
  { value: 'veo', label: 'Veo' },
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

const CAMERA_MOTIONS = [
  { value: 'none', label: '摄影机控制' },
  { value: 'pan-left', label: '左移' },
  { value: 'pan-right', label: '右移' },
  { value: 'zoom-in', label: '推近' },
  { value: 'zoom-out', label: '拉远' },
  { value: 'orbit', label: '环绕' },
];

interface RefImage {
  nodeId: string;
  label: string;
  imageUrl: string;
  index: number;
}

export function VideoNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as VideoNodeDataType;
  const status = (nodeData.status || 'idle') as string;
  const updateNode = useCanvasStore((s) => s.updateNode);
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progress = nodeData.progress ?? 0;
  const model = nodeData.model || 'sora-2';
  const duration = nodeData.duration ?? 5;
  const aspectRatio = nodeData.aspectRatio || '16:9';
  const cameraMotion = nodeData.cameraMotion || 'none';

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
    updateNode(id, { videoUrl: URL.createObjectURL(file), label: file.name });
  };

  const triggerUpload = () => { fileInputRef.current?.click(); };

  return (
    <div className={cn('transition-colors', selected && 'z-10')}>
      {/* ── Node card ── */}
      <div
        className={cn(
          'rounded-xl overflow-hidden bg-[var(--card)] border transition-all w-[260px]',
          selected ? 'border-[var(--node-video)]/60' : 'border-[var(--border)]',
        )}
      >
        <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-video)] !border-2 !border-[var(--card)]" />

        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

        {/* Title bar */}
        <div className="px-2.5 py-1.5 flex items-center gap-1.5">
          <Video className="h-3 w-3 text-[var(--muted-foreground)]" />
          <span className="text-[11px] text-[var(--muted-foreground)] truncate">{nodeData.label}</span>
          {!nodeData.videoUrl && (
            <button
              onClick={triggerUpload}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border)] text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-colors cursor-pointer bg-transparent"
            >
              <Upload className="h-3 w-3" />
              {t('nodes.upload', '上传')}
            </button>
          )}
        </div>

        {/* Video display */}
        <div className="w-full aspect-video flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
          {nodeData.videoUrl ? (
            <div className="relative group w-full h-full">
              <video src={nodeData.videoUrl} poster={nodeData.thumbnailUrl || undefined} className="w-full h-full object-contain" controls muted />
              <button onClick={triggerUpload} className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md border border-white/20 bg-black/50 text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm hover:bg-black/70">
                <Upload className="h-3 w-3" />{t('nodes.upload', '上传')}
              </button>
            </div>
          ) : status === 'processing' ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 text-[var(--muted-foreground)] animate-spin" />
              {progress > 0 && (
                <div className="w-20">
                  <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--node-video)] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Video className="h-8 w-8 text-[var(--muted-foreground)]/30" />
          )}
        </div>

        {status === 'processing' && progress > 0 && (
          <div className="h-0.5 w-full bg-[var(--border)]"><div className="h-full bg-[var(--node-video)] transition-all" style={{ width: `${progress}%` }} /></div>
        )}

        <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-video)] !border-2 !border-[var(--card)]" />
      </div>

      {/* ── Editing panel (selected only) ── */}
      {selected && (
        <div className="mt-2 rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden w-[360px] -ml-[50px] shadow-xl">
          <RichPromptEditor
            nodeId={id}
            prompt={nodeData.prompt || ''}
            onChange={(prompt) => updateNode(id, { prompt })}
            refImages={refImages}
            onInsertRef={insertImageRef}
            placeholder={t('properties.nodePromptPlaceholder', '描述你想生成的视频...')}
            accentColor="rgb(168, 85, 247)"
          />

          <div className="px-3 py-2 border-t border-[var(--border)] flex items-center gap-2 flex-wrap nodrag text-[11px] text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--foreground)] transition-colors">
              <Film className="h-3 w-3" />
              <select className="bg-transparent text-inherit text-[11px] focus:outline-none cursor-pointer appearance-none" value={model} onChange={(e) => updateNode(id, { model: e.target.value })}>
                {VIDEO_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
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
              <Clock className="h-3 w-3" />
              <select className="bg-transparent text-inherit text-[11px] focus:outline-none cursor-pointer appearance-none" value={duration} onChange={(e) => updateNode(id, { duration: Number(e.target.value) })}>
                {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <span className="text-[var(--border)]">|</span>
            <div className="flex items-center gap-1 cursor-pointer hover:text-[var(--foreground)] transition-colors">
              <Camera className="h-3 w-3" />
              <select className="bg-transparent text-inherit text-[11px] focus:outline-none cursor-pointer appearance-none" value={cameraMotion} onChange={(e) => updateNode(id, { cameraMotion: e.target.value })}>
                {CAMERA_MOTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="ml-auto">
              <NodeGenerateButton nodeId={id} status={status} mode="video" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
