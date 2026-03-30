import { useRef, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Eraser, Paintbrush } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface MaskEditorNodeDataType {
  label: string;
  imageUrl: string | null;
  maskDataUrl?: string | null;
  brushSize?: number;
  prompt?: string;
  width?: number;
  height?: number;
}

export function MaskEditorNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as MaskEditorNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [painting, setPainting] = useState(false);
  const brushSize = nodeData.brushSize ?? 20;

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setPainting(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [brushSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!painting) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [painting, brushSize]);

  const handleMouseUp = useCallback(() => {
    setPainting(false);
    const canvas = canvasRef.current;
    if (canvas) {
      updateNode(id, { maskDataUrl: canvas.toDataURL() });
    }
  }, [id, updateNode]);

  return (
    <div className={cn('rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[240px]', selected ? 'border-indigo-500 node-selected-glow' : 'border-[var(--border)]')} style={{ '--glow-color': '#6366f1' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-indigo-500" />

      <div className="px-2 py-1.5 border-b border-[var(--border)] flex items-center gap-2 nodrag">
        <Paintbrush className="h-3 w-3 text-indigo-400" />
        <input type="range" className="flex-1 accent-indigo-500 h-1" min={5} max={50} value={brushSize} onChange={(e) => updateNode(id, { brushSize: Number(e.target.value) })} />
        <span className="text-[9px] text-[var(--muted-foreground)] w-8 text-right">{brushSize}px</span>
      </div>

      <div className="w-[240px] h-[180px] relative bg-[var(--muted)] overflow-hidden nodrag">
        {nodeData.imageUrl && <img src={nodeData.imageUrl} alt="" className="w-full h-full object-cover absolute inset-0" />}
        <canvas ref={canvasRef} width={240} height={180} className="absolute inset-0 cursor-crosshair" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} />
        {!nodeData.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Eraser className="h-8 w-8 text-[var(--muted-foreground)]" />
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><Paintbrush className="h-3.5 w-3.5 text-indigo-500" /><p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p></div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
