import { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import {
  Columns2,
  Image,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface CompareNodeDataType {
  label: string;
  imageUrlA: string | null;
  imageUrlB: string | null;
  labelA?: string;
  labelB?: string;
  splitPosition?: number;
  status?: string;
  prompt?: string;
}

export function CompareNode({ id, data, selected }: NodeProps) {
  const { t } = useTranslation();
  const nodeData = data as unknown as CompareNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);

  const labelA = nodeData.labelA ?? t('properties.before');
  const labelB = nodeData.labelB ?? t('properties.after');
  const splitPosition = nodeData.splitPosition ?? 50;
  const [isDragging, setIsDragging] = useState(false);

  const handleSliderDrag = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;
    updateNode(id, { splitPosition: Math.round(pct) });
  }, [isDragging, id, updateNode]);

  const hasImages = nodeData.imageUrlA && nodeData.imageUrlB;
  const hasOneImage = nodeData.imageUrlA || nodeData.imageUrlB;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[280px]',
        selected ? 'border-[var(--primary)] node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': 'var(--primary)' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--primary)] !border-2 !border-[var(--card)]" />
      {/* Second target handle at bottom-left for the second image */}
      <Handle
        type="target"
        position={Position.Left}
        id="imageB"
        className="!w-3 !h-3 !bg-[var(--node-video)] !border-2 !border-[var(--card)]"
        style={{ top: '75%' }}
      />

      {/* Color bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[var(--node-image)] to-[var(--node-video)]" />

      {/* Labels editor */}
      <div className="px-2 py-1.5 border-b border-[var(--border)] flex items-center gap-1 nodrag">
        <input
          className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none text-center"
          value={labelA}
          onChange={(e) => updateNode(id, { labelA: e.target.value })}
          placeholder={t('properties.labelA')}
        />
        <Columns2 className="h-3 w-3 text-[var(--muted-foreground)] flex-shrink-0" />
        <input
          className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-1.5 py-0.5 border border-[var(--border)] focus:outline-none text-center"
          value={labelB}
          onChange={(e) => updateNode(id, { labelB: e.target.value })}
          placeholder={t('properties.labelB')}
        />
      </div>

      {/* Comparison area */}
      <div
        className="w-[280px] h-[200px] bg-[var(--muted)] relative select-none nodrag"
        onMouseMove={handleSliderDrag}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {hasImages ? (
          <>
            {/* Image A (full background) */}
            <img
              src={nodeData.imageUrlA!}
              alt={labelA}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Image B (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${splitPosition}%)` }}
            >
              <img
                src={nodeData.imageUrlB!}
                alt={labelB}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-col-resize z-10"
              style={{ left: `${splitPosition}%` }}
              onMouseDown={() => setIsDragging(true)}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <GripVertical className="h-3 w-3 text-gray-600" />
              </div>
            </div>
            {/* Labels */}
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white">
              {labelA}
            </div>
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white">
              {labelB}
            </div>
          </>
        ) : hasOneImage ? (
          <div className="w-full h-full flex">
            <div className="flex-1 flex items-center justify-center border-r border-[var(--border)]">
              {nodeData.imageUrlA ? (
                <img src={nodeData.imageUrlA} alt={labelA} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Image className="h-6 w-6 text-[var(--muted-foreground)] mx-auto mb-1" />
                  <p className="text-[9px] text-[var(--muted-foreground)]">{labelA}</p>
                </div>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center">
              {nodeData.imageUrlB ? (
                <img src={nodeData.imageUrlB} alt={labelB} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Image className="h-6 w-6 text-[var(--muted-foreground)] mx-auto mb-1" />
                  <p className="text-[9px] text-[var(--muted-foreground)]">{labelB}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Columns2 className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
              <p className="text-[10px] text-[var(--muted-foreground)]">{t('properties.connectTwoImages')}</p>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('properties.toCompareSideBySide')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Label */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <Columns2 className="h-3.5 w-3.5 text-[var(--primary)] flex-shrink-0" />
            <p className="text-xs font-medium text-[var(--card-foreground)] truncate">
              {nodeData.label}
            </p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--primary)] !border-2 !border-[var(--card)]" />
    </div>
  );
}
