import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  Paintbrush,
  Loader2,
  AlertCircle,
  Sun,
  Contrast,
  Droplets,
  Crop,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface ImageEditorNodeDataType {
  label: string;
  imageUrl: string | null;
  originalUrl?: string;
  status?: string;
  prompt?: string;
  width: number;
  height: number;
  format: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  activeFilter?: string;
}

const FILTERS = [
  { id: 'none', label: 'None' },
  { id: 'grayscale', label: 'B&W' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'dramatic', label: 'Drama' },
];

function getFilterCss(filter: string, brightness: number, contrast: number, saturation: number, blur: number): string {
  const parts: string[] = [];
  parts.push(`brightness(${brightness / 100})`);
  parts.push(`contrast(${contrast / 100})`);
  parts.push(`saturate(${saturation / 100})`);
  if (blur > 0) parts.push(`blur(${blur}px)`);
  switch (filter) {
    case 'grayscale':
      parts.push('grayscale(1)');
      break;
    case 'sepia':
      parts.push('sepia(0.8)');
      break;
    case 'vintage':
      parts.push('sepia(0.3) contrast(1.1) brightness(1.1)');
      break;
    case 'warm':
      parts.push('sepia(0.15) saturate(1.3)');
      break;
    case 'cool':
      parts.push('hue-rotate(20deg) saturate(0.9)');
      break;
    case 'dramatic':
      parts.push('contrast(1.4) saturate(1.2) brightness(0.9)');
      break;
  }
  return parts.join(' ');
}

export function ImageEditorNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ImageEditorNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const [activeTab, setActiveTab] = useState<'adjust' | 'filter' | 'crop'>('adjust');

  const brightness = nodeData.brightness ?? 100;
  const contrast = nodeData.contrast ?? 100;
  const saturation = nodeData.saturation ?? 100;
  const blur = nodeData.blur ?? 0;
  const activeFilter = nodeData.activeFilter ?? 'none';

  const filterCss = getFilterCss(activeFilter, brightness, contrast, saturation, blur);

  const handleReset = () => {
    updateNode(id, {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      activeFilter: 'none',
    });
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[260px]',
        selected ? 'border-[var(--node-image)] node-selected-glow' : 'border-[var(--border)]',
        status === 'processing' && 'node-processing'
      )}
      style={{ '--glow-color': 'var(--node-image)' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-image)] !border-2 !border-[var(--card)]" />

      {/* Color bar */}
      <div className="h-1 w-full bg-[var(--node-image)]" />

      {/* Tab bar */}
      <div className="flex items-center border-b border-[var(--border)] nodrag">
        {(['adjust', 'filter', 'crop'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 text-[10px] py-1.5 transition-colors cursor-pointer bg-transparent border-none capitalize',
              activeTab === tab
                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            {tab}
          </button>
        ))}
        <button
          onClick={handleReset}
          className="p-1 mx-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none"
          title="Reset adjustments"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
      </div>

      {/* Image preview with filters applied */}
      <div className="w-[260px] h-[160px] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.imageUrl ? (
          <img
            src={nodeData.imageUrl}
            alt={nodeData.label}
            className="w-full h-full object-cover"
            style={{ filter: filterCss }}
          />
        ) : status === 'processing' ? (
          <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
        ) : status === 'error' ? (
          <AlertCircle className="h-8 w-8 text-[var(--error)]" />
        ) : (
          <Paintbrush className="h-8 w-8 text-[var(--muted-foreground)]" />
        )}
      </div>

      {/* Controls */}
      <div className="px-2 py-2 border-t border-[var(--border)] space-y-1.5 nodrag">
        {activeTab === 'adjust' && (
          <>
            <div className="flex items-center gap-1.5">
              <Sun className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
              <p className="text-[9px] text-[var(--muted-foreground)] w-10">Bright</p>
              <input
                type="range"
                className="flex-1 accent-[var(--primary)] h-1"
                min={0}
                max={200}
                value={brightness}
                onChange={(e) => updateNode(id, { brightness: Number(e.target.value) })}
              />
              <span className="text-[9px] text-[var(--muted-foreground)] w-6 text-right">{brightness}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Contrast className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
              <p className="text-[9px] text-[var(--muted-foreground)] w-10">Contr</p>
              <input
                type="range"
                className="flex-1 accent-[var(--primary)] h-1"
                min={0}
                max={200}
                value={contrast}
                onChange={(e) => updateNode(id, { contrast: Number(e.target.value) })}
              />
              <span className="text-[9px] text-[var(--muted-foreground)] w-6 text-right">{contrast}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
              <p className="text-[9px] text-[var(--muted-foreground)] w-10">Satur</p>
              <input
                type="range"
                className="flex-1 accent-[var(--primary)] h-1"
                min={0}
                max={200}
                value={saturation}
                onChange={(e) => updateNode(id, { saturation: Number(e.target.value) })}
              />
              <span className="text-[9px] text-[var(--muted-foreground)] w-6 text-right">{saturation}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
              <p className="text-[9px] text-[var(--muted-foreground)] w-10">Blur</p>
              <input
                type="range"
                className="flex-1 accent-[var(--primary)] h-1"
                min={0}
                max={20}
                value={blur}
                onChange={(e) => updateNode(id, { blur: Number(e.target.value) })}
              />
              <span className="text-[9px] text-[var(--muted-foreground)] w-6 text-right">{blur}px</span>
            </div>
          </>
        )}

        {activeTab === 'filter' && (
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => updateNode(id, { activeFilter: f.id })}
                className={cn(
                  'text-[9px] px-2 py-1 rounded border transition-colors cursor-pointer',
                  activeFilter === f.id
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                    : 'border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--active-overlay)]'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'crop' && (
          <div className="text-center py-2">
            <Crop className="h-5 w-5 text-[var(--muted-foreground)] mx-auto mb-1" />
            <p className="text-[9px] text-[var(--muted-foreground)]">
              Drag handles on image to crop
            </p>
            <p className="text-[9px] text-[var(--muted-foreground)]">
              {nodeData.width}x{nodeData.height}
            </p>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Paintbrush className="h-3.5 w-3.5 text-[var(--node-image)] flex-shrink-0" />
            <p className="text-xs font-medium text-[var(--card-foreground)] truncate">
              {nodeData.label}
            </p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>

      {/* Prompt Editor */}
      <NodePromptEditor
        nodeId={id}
        prompt={nodeData.prompt || ''}
        onChange={(prompt) => updateNode(id, { prompt })}
      />

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-image)] !border-2 !border-[var(--card)]" />
    </div>
  );
}
