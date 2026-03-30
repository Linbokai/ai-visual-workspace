import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Image,
  Loader2,
  AlertCircle,
  ChevronDown,
  Upload,
  ArrowLeftRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus, ImageModel, ResolutionPreset } from '@/types';

interface ImageNodeDataType {
  label: string;
  imageUrl: string | null;
  originalUrl?: string;
  referenceImageUrl?: string;
  width: number;
  height: number;
  format: string;
  status?: string;
  prompt?: string;
  model?: ImageModel;
  resolutionPreset?: ResolutionPreset;
  samplingSteps?: number;
  cfgScale?: number;
  seed?: number;
  denoisingStrength?: number;
  progress?: number;
  showComparison?: boolean;
}

const IMAGE_MODELS: { value: ImageModel; label: string }[] = [
  { value: 'midjourney', label: 'Midjourney' },
  { value: 'dall-e-3', label: 'DALL-E 3' },
  { value: 'flux', label: 'Flux' },
  { value: 'jimeng', label: '\u5373\u68a6' },
  { value: 'sdxl', label: 'SDXL' },
];

const RESOLUTION_PRESETS: { value: ResolutionPreset; label: string; w: number; h: number }[] = [
  { value: '512x512', label: '512\u00b2', w: 512, h: 512 },
  { value: '768x768', label: '768\u00b2', w: 768, h: 768 },
  { value: '1024x1024', label: '1024\u00b2', w: 1024, h: 1024 },
  { value: '1024x768', label: '4:3', w: 1024, h: 768 },
  { value: '768x1024', label: '3:4', w: 768, h: 1024 },
  { value: '1920x1080', label: '16:9', w: 1920, h: 1080 },
];

export function ImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ImageNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { t } = useTranslation();
  const [showControls, setShowControls] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const progress = nodeData.progress ?? 0;
  const model = nodeData.model ?? 'midjourney';

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[240px]',
        selected ? 'border-[var(--node-image)] node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': 'var(--node-image)' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-image)] !border-2 !border-[var(--card)]" />

      {/* Color bar */}
      <div className="h-1 w-full bg-[var(--node-image)]" />

      {/* Model selector bar */}
      <div className="px-2 py-1.5 border-b border-[var(--border)] flex items-center gap-1.5 nodrag">
        <select
          className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
          value={model}
          onChange={(e) => updateNode(id, { model: e.target.value })}
        >
          {IMAGE_MODELS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <button
          onClick={() => setShowControls(!showControls)}
          className={cn(
            'p-0.5 rounded transition-colors cursor-pointer bg-transparent border-none',
            showControls ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          <ChevronDown className={cn('h-3 w-3 transition-transform', showControls && 'rotate-180')} />
        </button>
      </div>

      {/* Expandable controls */}
      {showControls && (
        <div className="px-2 py-2 border-b border-[var(--border)] space-y-2 nodrag">
          {/* Resolution presets */}
          <div>
            <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('properties.resolutionLabel')}</p>
            <div className="flex flex-wrap gap-1">
              {RESOLUTION_PRESETS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => updateNode(id, { resolutionPreset: r.value, width: r.w, height: r.h })}
                  className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer',
                    nodeData.resolutionPreset === r.value
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--active-overlay)]'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <div>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('properties.steps', { value: nodeData.samplingSteps ?? 20 })}</p>
              <input
                type="range"
                className="w-full accent-[var(--primary)] h-1"
                min={1}
                max={50}
                value={nodeData.samplingSteps ?? 20}
                onChange={(e) => updateNode(id, { samplingSteps: Number(e.target.value) })}
              />
            </div>
            <div>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('properties.cfg', { value: nodeData.cfgScale ?? 7 })}</p>
              <input
                type="range"
                className="w-full accent-[var(--primary)] h-1"
                min={1}
                max={20}
                value={nodeData.cfgScale ?? 7}
                onChange={(e) => updateNode(id, { cfgScale: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Seed */}
          <div className="flex items-center gap-1">
            <p className="text-[9px] text-[var(--muted-foreground)] flex-shrink-0">{t('properties.seedLabel')}</p>
            <input
              type="number"
              className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[9px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none w-full min-w-0"
              value={nodeData.seed ?? -1}
              onChange={(e) => updateNode(id, { seed: Number(e.target.value) })}
            />
          </div>

          {/* Image-to-Image reference */}
          <div>
            <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('properties.referenceImageI2I')}</p>
            <div className="flex items-center gap-1">
              {nodeData.referenceImageUrl ? (
                <div className="w-10 h-10 rounded border border-[var(--border)] overflow-hidden flex-shrink-0">
                  <img src={nodeData.referenceImageUrl} alt="ref" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded border border-dashed border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <Upload className="h-3 w-3 text-[var(--muted-foreground)]" />
                </div>
              )}
              {nodeData.referenceImageUrl && (
                <div className="flex-1">
                  <p className="text-[9px] text-[var(--muted-foreground)]">{t('properties.strength', { value: ((nodeData.denoisingStrength ?? 0.75) * 100).toFixed(0) })}</p>
                  <input
                    type="range"
                    className="w-full accent-[var(--primary)] h-1"
                    min={0}
                    max={1}
                    step={0.05}
                    value={nodeData.denoisingStrength ?? 0.75}
                    onChange={(e) => updateNode(id, { denoisingStrength: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image display area */}
      <div className="w-[240px] h-[180px] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.imageUrl ? (
          showComparison && nodeData.originalUrl ? (
            /* Before/After comparison view */
            <div className="w-full h-full relative">
              <img
                src={nodeData.originalUrl}
                alt="before"
                className="w-full h-full object-cover absolute inset-0"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
              <img
                src={nodeData.imageUrl}
                alt="after"
                className="w-full h-full object-cover absolute inset-0"
                style={{ clipPath: 'inset(0 0 0 50%)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-px h-full bg-white/60" />
              </div>
              <div className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-black/60 text-[8px] text-white">{t('properties.before')}</div>
              <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/60 text-[8px] text-white">{t('properties.after')}</div>
            </div>
          ) : (
            <img
              src={nodeData.imageUrl}
              alt={nodeData.label}
              className="w-full h-full object-cover"
            />
          )
        ) : status === 'processing' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
            {progress > 0 && (
              <div className="w-24">
                <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[9px] text-[var(--muted-foreground)] text-center mt-0.5">{progress}%</p>
              </div>
            )}
          </div>
        ) : status === 'error' ? (
          <AlertCircle className="h-8 w-8 text-[var(--error)]" />
        ) : (
          <Image className="h-8 w-8 text-[var(--muted-foreground)]" />
        )}
      </div>

      {/* Progress bar for processing */}
      {status === 'processing' && progress > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)]">
          <div
            className="h-full bg-[var(--node-image)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Label */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Image className="h-3.5 w-3.5 text-[var(--node-image)] flex-shrink-0" />
            <p className="text-xs font-medium text-[var(--card-foreground)] truncate">
              {nodeData.label}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {nodeData.imageUrl && nodeData.originalUrl && (
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={cn(
                  'p-0.5 rounded transition-colors cursor-pointer bg-transparent border-none',
                  showComparison ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                )}
                title="Compare before/after"
              >
                <ArrowLeftRight className="h-3 w-3" />
              </button>
            )}
            <NodeStatusBadge status={status as NodeStatus} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-[var(--muted-foreground)]">
            {nodeData.width}x{nodeData.height} {nodeData.format}
          </p>
          <span className="text-[9px] px-1 py-px rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
            {IMAGE_MODELS.find((m) => m.value === model)?.label ?? model}
          </span>
        </div>
      </div>

      {/* Prompt Editor */}
      <NodePromptEditor
        nodeId={id}
        prompt={nodeData.prompt || ''}
        onChange={(prompt) => updateNode(id, { prompt })}
      />

      {/* Generate Button */}
      <NodeGenerateButton nodeId={id} status={status} mode="image" />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-image)] !border-2 !border-[var(--card)]" />
    </div>
  );
}
