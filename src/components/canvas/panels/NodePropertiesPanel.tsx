import { useCallback } from 'react';
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
// Per-type property editors
// ---------------------------------------------------------------------------

function ImageProperties({
  nodeId,
  data,
}: {
  nodeId: string;
  data: ImageNodeData;
}) {
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
        <SectionHeader>Prompt</SectionHeader>
        <FieldLabel>Prompt</FieldLabel>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder="Describe the image..."
        />
        <FieldLabel>Negative Prompt</FieldLabel>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[40px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={2}
          value={data.negativePrompt ?? ''}
          onChange={(e) => update({ negativePrompt: e.target.value })}
          placeholder="What to avoid..."
        />
      </section>

      {/* Generation */}
      <section className="mb-4">
        <SectionHeader>Generation</SectionHeader>

        <FieldLabel>Model</FieldLabel>
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

        <FieldLabel>Size Presets</FieldLabel>
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
            <FieldLabel>Width</FieldLabel>
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
            <FieldLabel>Height</FieldLabel>
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
        <SectionHeader>Advanced</SectionHeader>

        <FieldLabel>Sampling Steps: {data.samplingSteps ?? 20}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)] mb-2"
          min={1}
          max={50}
          value={data.samplingSteps ?? 20}
          onChange={(e) => update({ samplingSteps: Number(e.target.value) })}
        />

        <FieldLabel>CFG Scale: {data.cfgScale ?? 7}</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)] mb-2"
          min={1}
          max={20}
          value={data.cfgScale ?? 7}
          onChange={(e) => update({ cfgScale: Number(e.target.value) })}
        />

        <FieldLabel>Seed</FieldLabel>
        <div className="flex gap-1.5">
          <input
            type="number"
            className="flex-1 rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            value={data.seed ?? -1}
            onChange={(e) => update({ seed: Number(e.target.value) })}
          />
          <button
            className="px-2 py-1.5 rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--active-overlay)] transition-colors"
            title="Random seed"
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
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <>
      <section className="mb-4">
        <SectionHeader>Prompt</SectionHeader>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder="Describe the video..."
        />
      </section>

      <section className="mb-4">
        <SectionHeader>Settings</SectionHeader>

        <FieldLabel>Model</FieldLabel>
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

        <FieldLabel>Duration: {data.duration ?? 1}s</FieldLabel>
        <input
          type="range"
          className="w-full accent-[var(--primary)] mb-2"
          min={1}
          max={60}
          value={data.duration ?? 1}
          onChange={(e) => update({ duration: Number(e.target.value) })}
        />

        <FieldLabel>FPS</FieldLabel>
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

        <FieldLabel>Resolution</FieldLabel>
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

        <FieldLabel>Camera Motion</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={data.cameraMotion ?? 'none'}
          onChange={(e) => update({ cameraMotion: e.target.value })}
        >
          <option value="none">None</option>
          <option value="pan-left">Pan Left</option>
          <option value="pan-right">Pan Right</option>
          <option value="pan-up">Pan Up</option>
          <option value="pan-down">Pan Down</option>
          <option value="zoom-in">Zoom In</option>
          <option value="zoom-out">Zoom Out</option>
          <option value="orbit">Orbit</option>
          <option value="dolly-in">Dolly In</option>
          <option value="dolly-out">Dolly Out</option>
          <option value="tilt-up">Tilt Up</option>
          <option value="tilt-down">Tilt Down</option>
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
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <section className="mb-4">
      <SectionHeader>Content</SectionHeader>
      <textarea
        className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[120px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        rows={8}
        value={data.content ?? ''}
        onChange={(e) => update({ content: e.target.value })}
        placeholder="Enter text content..."
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
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <>
      <section className="mb-4">
        <SectionHeader>Prompt</SectionHeader>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder="Describe the audio..."
        />
      </section>

      <section className="mb-4">
        <SectionHeader>Voice</SectionHeader>

        <FieldLabel>Voice Style</FieldLabel>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
          value={data.voiceStyle ?? 'neutral'}
          onChange={(e) => update({ voiceStyle: e.target.value })}
        >
          <option value="neutral">Neutral</option>
          <option value="warm">Warm</option>
          <option value="energetic">Energetic</option>
          <option value="calm">Calm</option>
        </select>

        <FieldLabel>Speed: {(data.speed ?? 1.0).toFixed(1)}x</FieldLabel>
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
        <SectionHeader>Settings</SectionHeader>

        <FieldLabel>Duration: {data.duration ?? 1}s</FieldLabel>
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
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  const filters = ['none', 'grayscale', 'sepia', 'vintage', 'warm', 'cool', 'dramatic'];

  return (
    <>
      <section className="mb-4">
        <SectionHeader>Adjustments</SectionHeader>
        <FieldLabel>Brightness: {data.brightness ?? 100}%</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={200} value={data.brightness ?? 100} onChange={(e) => update({ brightness: Number(e.target.value) })} />
        <FieldLabel>Contrast: {data.contrast ?? 100}%</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={200} value={data.contrast ?? 100} onChange={(e) => update({ contrast: Number(e.target.value) })} />
        <FieldLabel>Saturation: {data.saturation ?? 100}%</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={200} value={data.saturation ?? 100} onChange={(e) => update({ saturation: Number(e.target.value) })} />
        <FieldLabel>Blur: {data.blur ?? 0}px</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={0} max={20} value={data.blur ?? 0} onChange={(e) => update({ blur: Number(e.target.value) })} />
      </section>
      <section className="mb-4">
        <SectionHeader>Filter</SectionHeader>
        <select
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={data.activeFilter ?? 'none'}
          onChange={(e) => update({ activeFilter: e.target.value })}
        >
          {filters.map((f) => (
            <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>
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
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <>
      <section className="mb-4">
        <SectionHeader>Prompt</SectionHeader>
        <textarea
          className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-2 resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          rows={3}
          value={data.prompt ?? ''}
          onChange={(e) => update({ prompt: e.target.value })}
          placeholder="Describe what to generate from the doodle..."
        />
      </section>
      <section className="mb-4">
        <SectionHeader>Brush</SectionHeader>
        <FieldLabel>Size: {data.brushSize ?? 4}px</FieldLabel>
        <input type="range" className="w-full accent-[var(--primary)] mb-2" min={1} max={20} value={data.brushSize ?? 4} onChange={(e) => update({ brushSize: Number(e.target.value) })} />
        <FieldLabel>Color</FieldLabel>
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
  const updateNode = useCanvasStore((s) => s.updateNode);
  const update = useCallback(
    (partial: Partial<NodeData>) => updateNode(nodeId, partial),
    [nodeId, updateNode],
  );

  return (
    <section className="mb-4">
      <SectionHeader>Labels</SectionHeader>
      <FieldLabel>Label A</FieldLabel>
      <input
        type="text"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
        value={data.labelA ?? 'Before'}
        onChange={(e) => update({ labelA: e.target.value })}
      />
      <FieldLabel>Label B</FieldLabel>
      <input
        type="text"
        className="w-full rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] mb-2"
        value={data.labelB ?? 'After'}
        onChange={(e) => update({ labelB: e.target.value })}
      />
      <FieldLabel>Split Position: {data.splitPosition ?? 50}%</FieldLabel>
      <input type="range" className="w-full accent-[var(--primary)]" min={0} max={100} value={data.splitPosition ?? 50} onChange={(e) => update({ splitPosition: Number(e.target.value) })} />
    </section>
  );
}

const nodeTypeConfig: Record<
  string,
  { icon: typeof Image; label: string; color: string }
> = {
  image: { icon: Image, label: 'Image', color: 'var(--node-image)' },
  'image-editor': { icon: Paintbrush, label: 'Image Editor', color: 'var(--node-image)' },
  'doodle-image': { icon: PenTool, label: 'Doodle Image', color: 'var(--node-image)' },
  video: { icon: Video, label: 'Video', color: 'var(--node-video)' },
  'doodle-video': { icon: Video, label: 'Doodle Video', color: 'var(--node-video)' },
  text: { icon: Type, label: 'Text', color: 'var(--node-text)' },
  audio: { icon: Music, label: 'Audio', color: 'var(--node-audio)' },
  compare: { icon: Columns2, label: 'Compare', color: 'var(--primary)' },
};

// ---------------------------------------------------------------------------
// Main panel
// ---------------------------------------------------------------------------

export function NodePropertiesPanel() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const clearSelection = useCanvasStore((s) => s.clearSelection);

  const selectedNode: CanvasNode | undefined =
    selectedNodeIds.length === 1
      ? nodes.find((n) => n.id === selectedNodeIds[0])
      : undefined;

  if (!selectedNode) return null;

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
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Label field (shared across all types) */}
        <section className="mb-4">
          <FieldLabel>Label</FieldLabel>
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
