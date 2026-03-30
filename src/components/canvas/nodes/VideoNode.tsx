import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Video,
  Loader2,
  AlertCircle,
  ChevronDown,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus, VideoModel, CameraMotion } from '@/types';

interface VideoNodeDataType {
  label: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  status?: string;
  prompt?: string;
  model?: VideoModel;
  fps?: number;
  resolution?: string;
  cameraMotion?: CameraMotion;
  keyframes?: Array<{ time: number; label: string }>;
  progress?: number;
}

const VIDEO_MODELS: { value: VideoModel; label: string }[] = [
  { value: 'sora', label: 'Sora' },
  { value: 'veo', label: 'Veo' },
  { value: 'runway', label: 'Runway' },
  { value: 'pika', label: 'Pika' },
  { value: 'kling', label: 'Kling' },
];

const CAMERA_MOTION_KEYS: { value: CameraMotion; key: string }[] = [
  { value: 'none', key: 'none' },
  { value: 'pan-left', key: 'panL' },
  { value: 'pan-right', key: 'panR' },
  { value: 'pan-up', key: 'panUp' },
  { value: 'pan-down', key: 'panDn' },
  { value: 'zoom-in', key: 'zoomIn' },
  { value: 'zoom-out', key: 'zoomOut' },
  { value: 'orbit', key: 'orbit' },
  { value: 'dolly-in', key: 'dollyIn' },
  { value: 'dolly-out', key: 'dollyOut' },
  { value: 'tilt-up', key: 'tiltUp' },
  { value: 'tilt-down', key: 'tiltDn' },
];

const FPS_OPTIONS = [12, 24, 30, 60];
const RESOLUTION_OPTIONS = ['480p', '720p', '1080p', '4K'];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as VideoNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { t } = useTranslation();
  const [showControls, setShowControls] = useState(false);

  const progress = nodeData.progress ?? 0;
  const model = nodeData.model ?? 'sora';
  const cameraMotion = nodeData.cameraMotion ?? 'none';
  const fps = nodeData.fps ?? 24;
  const resolution = nodeData.resolution ?? '1080p';
  const duration = nodeData.duration ?? 5;
  const keyframes = nodeData.keyframes ?? [];

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[240px]',
        selected ? 'border-[var(--node-video)] node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': 'var(--node-video)' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-video)] !border-2 !border-[var(--card)]" />

      {/* Color bar */}
      <div className="h-1 w-full bg-[var(--node-video)]" />

      {/* Model selector bar */}
      <div className="px-2 py-1.5 border-b border-[var(--border)] flex items-center gap-1.5 nodrag">
        <select
          className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
          value={model}
          onChange={(e) => updateNode(id, { model: e.target.value })}
        >
          {VIDEO_MODELS.map((m) => (
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
          {/* Duration and FPS */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('properties.durationLabel', { value: duration })}</p>
              <input
                type="range"
                className="w-full accent-[var(--primary)] h-1"
                min={1}
                max={60}
                value={duration}
                onChange={(e) => updateNode(id, { duration: Number(e.target.value) })}
              />
            </div>
            <div>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('properties.fpsLabel')}</p>
              <div className="flex gap-0.5">
                {FPS_OPTIONS.map((f) => (
                  <button
                    key={f}
                    onClick={() => updateNode(id, { fps: f })}
                    className={cn(
                      'flex-1 text-[8px] py-0.5 rounded border transition-colors cursor-pointer',
                      fps === f
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                        : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resolution */}
          <div>
            <p className="text-[9px] text-[var(--muted-foreground)] mb-0.5">{t('properties.resolutionLabel')}</p>
            <div className="flex gap-0.5">
              {RESOLUTION_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => updateNode(id, { resolution: r })}
                  className={cn(
                    'flex-1 text-[8px] py-0.5 rounded border transition-colors cursor-pointer',
                    resolution === r
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion */}
          <div>
            <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Camera className="h-2.5 w-2.5" /> {t('properties.cameraMotionLabel')}
            </p>
            <div className="flex flex-wrap gap-0.5">
              {CAMERA_MOTION_KEYS.map((cm) => (
                <button
                  key={cm.value}
                  onClick={() => updateNode(id, { cameraMotion: cm.value })}
                  className={cn(
                    'text-[8px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer',
                    cameraMotion === cm.value
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                      : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]'
                  )}
                >
                  {t(`properties.cameraMotionShort.${cm.key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video display area */}
      <div className="w-[240px] h-[160px] flex items-center justify-center bg-[var(--muted)] relative">
        {nodeData.thumbnailUrl ? (
          <>
            <img src={nodeData.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
              {formatDuration(duration)}
            </div>
            {/* Keyframe timeline preview */}
            {keyframes.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/40 flex items-center px-1">
                {keyframes.map((kf, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-2.5 bg-[var(--node-video)] rounded-sm"
                    style={{ left: `${(kf.time / Math.max(duration, 1)) * 100}%` }}
                    title={`${kf.label} @ ${kf.time.toFixed(1)}s`}
                  />
                ))}
              </div>
            )}
          </>
        ) : status === 'processing' ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
            {progress > 0 && (
              <div className="w-24">
                <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--node-video)] rounded-full transition-all duration-300"
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
          <Video className="h-8 w-8 text-[var(--muted-foreground)]" />
        )}
      </div>

      {/* Progress bar for processing */}
      {status === 'processing' && progress > 0 && (
        <div className="h-0.5 w-full bg-[var(--border)]">
          <div
            className="h-full bg-[var(--node-video)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Label */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Video className="h-3.5 w-3.5 text-[var(--node-video)] flex-shrink-0" />
            <p className="text-xs font-medium text-[var(--card-foreground)] truncate">
              {nodeData.label}
            </p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-[var(--muted-foreground)]">
            {resolution} {fps}fps {formatDuration(duration)}
          </p>
          <span className="text-[9px] px-1 py-px rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
            {VIDEO_MODELS.find((m) => m.value === model)?.label ?? model}
          </span>
          {cameraMotion !== 'none' && (
            <span className="text-[9px] px-1 py-px rounded bg-[var(--node-video)]/15 text-[var(--node-video)]">
              {t(`properties.cameraMotionShort.${CAMERA_MOTION_KEYS.find((cm) => cm.value === cameraMotion)?.key}`)}
            </span>
          )}
        </div>
      </div>

      {/* Prompt Editor */}
      <NodePromptEditor
        nodeId={id}
        prompt={nodeData.prompt || ''}
        onChange={(prompt) => updateNode(id, { prompt })}
      />

      {/* Generate Button */}
      <NodeGenerateButton nodeId={id} status={status} mode="video" />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-video)] !border-2 !border-[var(--card)]" />
    </div>
  );
}
