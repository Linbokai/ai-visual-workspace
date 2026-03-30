import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Eye, Maximize2, Image, Film, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';

interface PreviewNodeDataType {
  label: string;
  mediaUrl: string | null;
  mediaType?: 'image' | 'video' | 'audio';
  prompt?: string;
}

export function PreviewNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as PreviewNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const mediaType = nodeData.mediaType || 'image';

  const MediaIcon = mediaType === 'video' ? Film : mediaType === 'audio' ? Music : Image;

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[240px]',
        selected ? 'border-emerald-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#10b981' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-emerald-500" />

      <div className="w-[240px] h-[180px] flex items-center justify-center bg-[var(--muted)] relative overflow-hidden">
        {nodeData.mediaUrl ? (
          mediaType === 'video' ? (
            <video src={nodeData.mediaUrl} className="w-full h-full object-cover" controls />
          ) : mediaType === 'audio' ? (
            <div className="flex flex-col items-center gap-2 p-4">
              <Music className="h-8 w-8 text-emerald-500" />
              <audio src={nodeData.mediaUrl} controls className="w-full" />
            </div>
          ) : (
            <img src={nodeData.mediaUrl} alt={nodeData.label} className="w-full h-full object-cover" />
          )
        ) : (
          <Eye className="h-8 w-8 text-[var(--muted-foreground)]" />
        )}
        {nodeData.mediaUrl && (
          <button className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer border-none">
            <Maximize2 className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-emerald-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[9px] px-1 py-px rounded bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
              <MediaIcon className="h-2.5 w-2.5" /> {mediaType}
            </span>
            <NodeStatusBadge status={status as NodeStatus} />
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
