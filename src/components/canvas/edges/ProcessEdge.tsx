import { type FC, useState, useEffect, useRef } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';
import { Plus, ImageIcon, VideoIcon, TypeIcon, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeType } from '@/types';

const nodeTypeOptions: { type: NodeType; labelKey: string; icon: FC<{ className?: string }> }[] = [
  { type: 'image', labelKey: 'nodes.image', icon: ImageIcon },
  { type: 'video', labelKey: 'nodes.video', icon: VideoIcon },
  { type: 'text', labelKey: 'nodes.text', icon: TypeIcon },
  { type: 'audio', labelKey: 'nodes.audio', icon: Music },
];

// Color based on source node type
const edgeColorMap: Record<string, string> = {
  image: 'var(--node-image)',
  video: 'var(--node-video)',
  text: 'var(--node-text)',
  audio: 'var(--node-audio)',
};

export const ProcessEdge: FC<EdgeProps> = ({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const insertNodeOnEdge = useCanvasStore((s) => s.insertNodeOnEdge);
  const nodes = useCanvasStore((s) => s.nodes);

  // Find source node to determine edge color
  const sourceNode = nodes.find((n) => n.id === source);
  const sourceType = sourceNode?.type || 'text';
  const edgeColor = edgeColorMap[sourceType] || 'var(--primary)';

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Close picker on click outside
  useEffect(() => {
    if (!pickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [pickerOpen]);

  const handleInsertNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerOpen((prev) => !prev);
  };

  const handleSelectType = (nodeType: NodeType) => {
    insertNodeOnEdge(id, nodeType, { x: labelX, y: labelY });
    setPickerOpen(false);
  };

  // Compute path length for animation
  const pathLength = Math.sqrt(
    Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2)
  );
  const dashLength = Math.max(6, pathLength * 0.03);

  return (
    <>
      {/* Background edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isHovered ? edgeColor : `color-mix(in srgb, ${edgeColor} 40%, transparent)`,
          strokeWidth: isHovered ? 2.5 : 1.5,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      {/* Animated flow particles */}
      <path
        d={edgePath}
        fill="none"
        stroke={edgeColor}
        strokeWidth={isHovered ? 2.5 : 1.5}
        strokeDasharray={`${dashLength} ${dashLength * 3}`}
        className="edge-flow-animation"
        style={{
          opacity: isHovered ? 0.9 : 0.4,
          transition: 'opacity 0.2s',
        }}
      />
      {/* Invisible wider path for easier hover detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { if (!pickerOpen) setIsHovered(false); }}
        >
          <button
            onClick={handleInsertNode}
            className={`
              w-6 h-6 rounded-full flex items-center justify-center
              border border-[var(--border)] bg-[var(--card)]
              text-[var(--muted-foreground)] hover:text-[var(--primary)]
              hover:border-[var(--primary)] hover:bg-[var(--card)]
              transition-all cursor-pointer shadow-lg
              ${isHovered || pickerOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
            `}
            style={{ transition: 'opacity 0.2s, transform 0.2s, color 0.2s, border-color 0.2s' }}
            aria-label={t('canvas.insertNodeOnEdge')}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>

          {/* Node type picker */}
          {pickerOpen && (
            <div
              ref={pickerRef}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="flex flex-col gap-0.5 py-1 px-1 rounded-lg bg-[var(--card)] border border-[var(--border)] shadow-xl min-w-[120px]">
                {nodeTypeOptions.map(({ type, labelKey, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={(e) => { e.stopPropagation(); handleSelectType(type); }}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer whitespace-nowrap bg-transparent border-none"
                    role="menuitem"
                  >
                    <span style={{ color: edgeColorMap[type] }}><Icon className="h-3.5 w-3.5" /></span>
                    <span>{t(labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Operation label */}
          {Boolean(data?.operation) && isHovered && !pickerOpen && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--popover)] text-[var(--popover-foreground)] border border-[var(--border)]">
                {String(data?.operation)}
              </span>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
