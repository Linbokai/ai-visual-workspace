import { useRef, useState, useCallback, useEffect } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import {
  PenTool,
  Loader2,
  AlertCircle,
  Eraser,
  Trash2,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface DoodleNodeDataType {
  label: string;
  imageUrl: string | null;
  doodleDataUrl?: string;
  status?: string;
  prompt?: string;
  width: number;
  height: number;
  format: string;
  brushSize?: number;
  brushColor?: string;
}

const COLORS = ['#ffffff', '#ff4444', '#44aaff', '#44ff44', '#ffaa00', '#ff44ff', '#000000'];
const SIZES = [2, 4, 8, 12];

export function DoodleNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as DoodleNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const brushSize = nodeData.brushSize ?? 4;
  const brushColor = nodeData.brushColor ?? '#ffffff';

  // Initialize canvas from saved data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (nodeData.doodleDataUrl) {
      const img = new window.Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = nodeData.doodleDataUrl;
    } else {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const getCanvasCoords = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  }, [getCanvasCoords]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  }, [isDrawing, brushSize, brushColor, isEraser, getCanvasCoords]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Save canvas data
    const dataUrl = canvas.toDataURL('image/png');
    updateNode(id, { doodleDataUrl: dataUrl });
  }, [id, updateNode]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateNode(id, { doodleDataUrl: null });
  }, [id, updateNode]);

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

      {/* Toolbar */}
      <div className="px-2 py-1.5 border-b border-[var(--border)] flex items-center gap-1 nodrag">
        {/* Color palette */}
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => {
              updateNode(id, { brushColor: c });
              setIsEraser(false);
            }}
            className={cn(
              'w-4 h-4 rounded-full border-2 transition-all cursor-pointer flex-shrink-0',
              brushColor === c && !isEraser
                ? 'border-[var(--primary)] scale-110'
                : 'border-[var(--border)]'
            )}
            style={{ backgroundColor: c }}
          />
        ))}
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />

        {/* Brush sizes */}
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => updateNode(id, { brushSize: s })}
            className={cn(
              'w-5 h-5 flex items-center justify-center rounded transition-colors cursor-pointer bg-transparent border-none',
              brushSize === s
                ? 'text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: Math.max(s / 2, 2), height: Math.max(s / 2, 2) }}
            />
          </button>
        ))}
        <div className="w-px h-4 bg-[var(--border)] mx-0.5" />

        {/* Eraser */}
        <button
          onClick={() => setIsEraser(!isEraser)}
          className={cn(
            'p-0.5 rounded transition-colors cursor-pointer bg-transparent border-none',
            isEraser ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          )}
        >
          <Eraser className="h-3 w-3" />
        </button>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="p-0.5 rounded text-[var(--muted-foreground)] hover:text-[var(--error)] transition-colors cursor-pointer bg-transparent border-none"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Canvas area */}
      <div className="w-[240px] h-[180px] bg-[#1a1a2e] relative nodrag nowheel">
        {nodeData.imageUrl ? (
          /* Show generated result */
          <div className="w-full h-full relative">
            <img
              src={nodeData.imageUrl}
              alt={nodeData.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white flex items-center gap-0.5">
              <Image className="h-2.5 w-2.5" /> Generated
            </div>
          </div>
        ) : status === 'processing' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-[var(--primary)] animate-spin" />
          </div>
        ) : status === 'error' ? (
          <div className="w-full h-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-[var(--error)]" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={240}
            height={180}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
          />
        )}
      </div>

      {/* Label */}
      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <PenTool className="h-3.5 w-3.5 text-[var(--node-image)] flex-shrink-0" />
            <p className="text-xs font-medium text-[var(--card-foreground)] truncate">
              {nodeData.label}
            </p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
        <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
          Draw a sketch, then generate with AI
        </p>
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
