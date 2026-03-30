import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Image,
  Video,
  Type,
  Music,
  Shuffle,
  Paintbrush,
  PenTool,
  Columns2,
} from 'lucide-react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type {
  CanvasNode,
  ImageNodeData,
  VideoNodeData,
  TextNodeData,
  AudioNodeData,
  ImageEditorNodeData,
  DoodleNodeData,
  CompareNodeData,
  NodeData,
} from '@/types';
import type { TFunction } from 'i18next';

// ---------------------------------------------------------------------------
// Shared small components
// ---------------------------------------------------------------------------

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
      {children}
    </h3>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs text-[var(--muted-foreground)] mb-1">
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// nodeTypeConfig as a function that takes t
// ---------------------------------------------------------------------------

function getNodeTypeConfig(t: TFunction): Record<
  string,
  { icon: typeof Image; label: string; color: string }
> {
  return {
    image: { icon: Image, label: t('nodes.image'), color: 'var(--node-image)' },
    'image-editor': { icon: Paintbrush, label: t('nodes.imageEditor'), color: 'var(--node-image)' },
    'doodle-image': { icon: PenTool, label: t('nodes.doodleToImage'), color: 'var(--node-image)' },
    video: { icon: Video, label: t('nodes.video'), color: 'var(--node-video)' },
    'doodle-video': { icon: Video, label: 'Doodle Video', color: 'var(--node-video)' },
    text: { icon: Type, label: t('nodes.text'), color: 'var(--node-text)' },
    audio: { icon: Music, label: t('nodes.audio'), color: 'var(--node-audio)' },
    compare: { icon: Columns2, label: t('nodes.compare'), color: 'var(--primary)' },
  };
}

// ---------------------------------------------------------------------------
// Per-type property editors
// ---------------------------------------------------------------------------

function ImageProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: ImageNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  const sizePresets = [
    { label: '512\u00b2', w: 512, h: 512 },
    { label: '768\u00b2', w: 768, h: 768 },
    { label: '1024\u00b2', w: 1024, h: 1024 },
    { label: '4:3', w: 1024, h: 768 },
    { label: '16:9', w: 1920, h: 1080 },
  ];

  return (
    <>
      {/* Prompt */}
      <section className="mb-4">
        <SectionHeader>{t('properties.prompt')}</SectionHeader>
        <FieldLabel>{t('properties.prompt')}</FieldLabel>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder={t('properties.describeImage')}
        />
        <FieldLabel>{t('properties.negativePrompt')}</FieldLabel>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[40px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={2}
          value={data.negativePrompt ?? ''}
          onChange={(e) => update({ negativePrompt: e.target.value })}
          placeholder={t('properties.whatToAvoid')}
        />
      </section>

      {/* Generation */}
      <section className="mb-4">
        <SectionHeader>{t('properties.generation')}</SectionHeader>

        <FieldLabel>{t('properties.model')}</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
          value={data.model ?? 'sdxl'}
          onChange={(e) => update({ model: e.target.value })}
        >
          <option value="midjourney">Midjourney</option>
          <option value="dall-e-3">DALL-E 3</option>
          <option value="flux">Flux</option>
          <option value="jimeng">{'\u5373\u68a6'}</option>
          <option value="sdxl">SDXL</option>
        </select>

        <FieldLabel>{t('properties.sizePresets')}</FieldLabel>
        <div className="flex gap-1.5 mb-2">
          {sizePresets.map((p) => (
            <button
              key={p.label}
              className={`flex-1 text-[11px] py-1 rounded-md border transition-colors ${
                data.width === p.w && data.height === p.h
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                  : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--active-overlay)]'
              }`}
              onClick={() => update({ width: p.w, height: p.h })}
            >
              {p.w}x{p.h}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <FieldLabel>{t('properties.width')}</FieldLabel>
            <input
              type="number"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              value={data.width}
              min={64}
              max={2048}
              step={64}
              onChange={(e) => update({ width: Number(e.target.value) })}
            />
          </div>
          <div>
            <FieldLabel>{t('properties.height')}</FieldLabel>
            <input
              type="number"
              className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              value={data.height}
              min={64}
              max={2048}
              step={64}
              onChange={(e) => update({ height: Number(e.target.value) })}
            />
          </div>
        </div>
      </section>

      {/* Advanced */}
      <section className="mb-4">
        <SectionHeader>{t('properties.advanced')}</SectionHeader>

        <FieldLabel>{t('properties.samplingSteps', { value: data.samplingSteps ?? 20 })}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)] mb-2"
          min={1}
          max={50}
          value={data.samplingSteps ?? 20}
          onChange={(e) => update({ samplingSteps: Number(e.target.value) })}
        />

        <FieldLabel>{t('properties.cfgScale', { value: data.cfgScale ?? 7 })}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)] mb-2"
          min={1}
          max={20}
          value={data.cfgScale ?? 7}
          onChange={(e) => update({ cfgScale: Number(e.target.value) })}
        />

        <FieldLabel>{t('properties.seed')}</FieldLabel>
        <div className="flex gap-1.5">
          <input
            type="number"
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            value={data.seed ?? -1}
            onChange={(e) => update({ seed: Number(e.target.value) })}
          />
          <button
            className="px-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--active-overlay)] transition-colors"
            title={t('properties.randomSeed')}
            onClick={() =>
              update({ seed: Math.floor(Math.random() * 2147483647) })
            }
          >
            <Shuffle className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>
    </>
  );
}

function VideoProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: VideoNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <>
      <section className="mb-4">
        <SectionHeader>{t('properties.prompt')}</SectionHeader>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder={t('properties.describeVideo')}
        />
      </section>

      <section className="mb-4">
        <SectionHeader>{t('properties.settings')}</SectionHeader>

        <FieldLabel>{t('properties.model')}</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
          value={data.model ?? 'sora'}
          onChange={(e) => update({ model: e.target.value })}
        >
          <option value="sora">Sora</option>
          <option value="veo">Veo</option>
          <option value="runway">Runway</option>
          <option value="pika">Pika</option>
          <option value="kling">Kling</option>
        </select>

        <FieldLabel>{t('properties.duration', { value: data.duration ?? 1 })}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)] mb-2"
          min={1}
          max={60}
          value={data.duration ?? 1}
          onChange={(e) => update({ duration: Number(e.target.value) })}
        />

        <FieldLabel>{t('properties.fps')}</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
          value={data.fps ?? 24}
          onChange={(e) => update({ fps: Number(e.target.value) })}
        >
          <option value={12}>12</option>
          <option value={24}>24</option>
          <option value={30}>30</option>
          <option value={60}>60</option>
        </select>

        <FieldLabel>{t('properties.resolution')}</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
          value={data.resolution ?? '1080p'}
          onChange={(e) => update({ resolution: e.target.value })}
        >
          <option value="480p">480p</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="4K">4K</option>
        </select>

        <FieldLabel>{t('properties.cameraMotion')}</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={data.cameraMotion ?? 'none'}
          onChange={(e) => update({ cameraMotion: e.target.value })}
        >
          <option value="none">{t('properties.cameraMotions.none')}</option>
          <option value="pan-left">{t('properties.cameraMotions.panLeft')}</option>
          <option value="pan-right">{t('properties.cameraMotions.panRight')}</option>
          <option value="pan-up">{t('properties.cameraMotions.panUp')}</option>
          <option value="pan-down">{t('properties.cameraMotions.panDown')}</option>
          <option value="zoom-in">{t('properties.cameraMotions.zoomIn')}</option>
          <option value="zoom-out">{t('properties.cameraMotions.zoomOut')}</option>
          <option value="orbit">{t('properties.cameraMotions.orbit')}</option>
          <option value="dolly-in">{t('properties.cameraMotions.dollyIn')}</option>
          <option value="dolly-out">{t('properties.cameraMotions.dollyOut')}</option>
          <option value="tilt-up">{t('properties.cameraMotions.tiltUp')}</option>
          <option value="tilt-down">{t('properties.cameraMotions.tiltDown')}</option>
        </select>
      </section>
    </>
  );
}

function TextProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: TextNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <section className="mb-4">
      <SectionHeader>{t('properties.content')}</SectionHeader>
      <textarea
        className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[120px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        rows={8}
        value={data.content ?? ''}
        onChange={(e) => update({ content: e.target.value })}
        placeholder={t('properties.enterTextContent')}
      />
    </section>
  );
}

function AudioProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: AudioNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <>
      <section className="mb-4">
        <SectionHeader>{t('properties.prompt')}</SectionHeader>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder={t('properties.describeAudio')}
        />
      </section>

      <section className="mb-4">
        <SectionHeader>{t('properties.voice')}</SectionHeader>

        <FieldLabel>{t('properties.voiceStyle')}</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
          value={data.voiceStyle ?? 'neutral'}
          onChange={(e) => update({ voiceStyle: e.target.value })}
        >
          <option value="neutral">{t('properties.voiceStyles.neutral')}</option>
          <option value="warm">{t('properties.voiceStyles.warm')}</option>
          <option value="energetic">{t('properties.voiceStyles.energetic')}</option>
          <option value="calm">{t('properties.voiceStyles.calm')}</option>
        </select>

        <FieldLabel>{t('properties.speed', { value: (data.speed ?? 1.0).toFixed(1) })}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)]"
          min={0.5}
          max={2.0}
          step={0.1}
          value={data.speed ?? 1.0}
          onChange={(e) => update({ speed: Number(e.target.value) })}
        />
      </section>

      <section className="mb-4">
        <SectionHeader>{t('properties.settings')}</SectionHeader>

        <FieldLabel>{t('properties.duration', { value: data.duration ?? 1 })}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)]"
          min={1}
          max={30}
          value={data.duration ?? 1}
          onChange={(e) => update({ duration: Number(e.target.value) })}
        />
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------

function ImageEditorProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: ImageEditorNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  const filters = ['none', 'grayscale', 'sepia', 'vintage', 'warm', 'cool', 'dramatic'] as const;

  return (
    <>
      <section className="mb-4">
        <SectionHeader>{t('properties.adjustments')}</SectionHeader>
        <FieldLabel>{t('properties.brightness', { value: data.brightness ?? 100 })}</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={200} value={data.brightness ?? 100} onChange={(e) => update({ brightness: Number(e.target.value) })} />
        <FieldLabel>{t('properties.contrast', { value: data.contrast ?? 100 })}</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={200} value={data.contrast ?? 100} onChange={(e) => update({ contrast: Number(e.target.value) })} />
        <FieldLabel>{t('properties.saturation', { value: data.saturation ?? 100 })}</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={200} value={data.saturation ?? 100} onChange={(e) => update({ saturation: Number(e.target.value) })} />
        <FieldLabel>{t('properties.blur', { value: data.blur ?? 0 })}</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={20} value={data.blur ?? 0} onChange={(e) => update({ blur: Number(e.target.value) })} />
      </section>
      <section className="mb-4">
        <SectionHeader>{t('properties.filter')}</SectionHeader>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={data.activeFilter ?? 'none'}
          onChange={(e) => update({ activeFilter: e.target.value })}
        >
          {filters.map((f) => (
            <option key={f} value={f}>{t(`properties.filters.${f}`)}</option>
          ))}
        </select>
      </section>
    </>
  );
}

function DoodleProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: DoodleNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <>
      <section className="mb-4">
        <SectionHeader>{t('properties.prompt')}</SectionHeader>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder={t('properties.doodlePrompt')}
        />
      </section>
      <section className="mb-4">
        <SectionHeader>{t('properties.brush')}</SectionHeader>
        <FieldLabel>{t('properties.brushSize', { value: data.brushSize ?? 4 })}</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={1} max={20} value={data.brushSize ?? 4} onChange={(e) => update({ brushSize: Number(e.target.value) })} />
        <FieldLabel>{t('properties.brushColor')}</FieldLabel>
        <input type="color" className="w-8 h-8 rounded border border-[var(--border)] cursor-pointer" value={data.brushColor ?? '#ffffff'} onChange={(e) => update({ brushColor: e.target.value })} />
      </section>
    </>
  );
}

function CompareProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: CompareNodeData;
}) {
  const { t } = useTranslation();
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <section className="mb-4">
      <SectionHeader>{t('properties.labels')}</SectionHeader>
      <FieldLabel>{t('properties.labelA')}</FieldLabel>
      <input
        type="text"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
        value={data.labelA ?? t('properties.before')}
        onChange={(e) => update({ labelA: e.target.value })}
        placeholder={t('properties.labelA')}
      />
      <FieldLabel>{t('properties.labelB')}</FieldLabel>
      <input
        type="text"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
        value={data.labelB ?? t('properties.after')}
        onChange={(e) => update({ labelB: e.target.value })}
        placeholder={t('properties.labelB')}
      />
      <FieldLabel>{t('properties.splitPosition', { value: data.splitPosition ?? 50 })}</FieldLabel>
      <input type="range" className="w-full accent-[var(--primary)]" min={0} max={100} value={data.splitPosition ?? 50} onChange={(e) => update({ splitPosition: Number(e.target.value) })} />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function NodePropertiesPanel() {
  const { t } = useTranslation();
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const clearSelection = useCanvasStore((s) => s.clearSelection);

  const selectedNode: CanvasNode | undefined =
    selectedNodeIds.length === 1
      ? nodes.find((n) => n.id === selectedNodeIds[0])
      : undefined;

  if (!selectedNode) return null;

  const nodeTypeConfig = getNodeTypeConfig(t);
  const nodeType = selectedNode.type ?? 'text';
  const config = nodeTypeConfig[nodeType] ?? nodeTypeConfig.text;
  const IconComp = config.icon;
  const data = selectedNode.data;

  return (
    <div className="w-[320px] h-full flex flex-col border-l border-[var(--border)] bg-[var(--card)] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
        <IconComp
          className="h-4 w-4 flex-shrink-0"
          style={{ color: config.color }}
        />
        <span className="text-sm font-medium text-[var(--foreground)] truncate flex-1">
          {(data as { label?: string }).label ?? config.label}
        </span>
        <button
          onClick={clearSelection}
          className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--active-overlay)] transition-colors"
          title={t('common.close')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Label field (shared across all types) */}
        <section className="mb-4">
          <FieldLabel>{t('properties.label')}</FieldLabel>
          <input
            type="text"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            value={(data as { label?: string }).label ?? ''}
            onChange={(e) =>
              useCanvasStore.getState().updateNode(selectedNode.id, { label: e.target.value })
            }
          />
        </section>

        {/* Type-specific properties */}
        {(nodeType === 'image' || nodeType === 'image-editor' || nodeType === 'doodle-image') && (
          <ImageProperties
            nodeId={selectedNode.id}
            data={data as ImageNodeData}
          />
        )}
        {(nodeType === 'video' || nodeType === 'doodle-video') && (
          <VideoProperties
            nodeId={selectedNode.id}
            data={data as VideoNodeData}
          />
        )}
        {nodeType === 'text' && (
          <TextProperties
            nodeId={selectedNode.id}
            data={data as TextNodeData}
          />
        )}
        {nodeType === 'audio' && (
          <AudioProperties
            nodeId={selectedNode.id}
            data={data as AudioNodeData}
          />
        )}
        {nodeType === 'image-editor' && (
          <ImageEditorProperties
            nodeId={selectedNode.id}
            data={data as ImageEditorNodeData}
          />
        )}
        {nodeType === 'doodle-image' && (
          <DoodleProperties
            nodeId={selectedNode.id}
            data={data as DoodleNodeData}
          />
        )}
        {nodeType === 'compare' && (
          <CompareProperties
            nodeId={selectedNode.id}
            data={data as CompareNodeData}
          />
        )}
      </div>
    </div>
  );
}
