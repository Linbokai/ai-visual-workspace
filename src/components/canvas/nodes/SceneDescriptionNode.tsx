import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneDescriptionNodeDataType {
  label: string;
  scene?: { name: string; environment: string; description: string; mood: string; imageUrl: string | null } | null;
  prompt?: string;
}

export function SceneDescriptionNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as SceneDescriptionNodeDataType;
  const scene = nodeData.scene;

  return (
    <div className={cn('rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[220px]', selected ? 'border-teal-500 node-selected-glow' : 'border-[var(--border)]')} style={{ '--glow-color': '#14b8a6' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-[var(--card)]" />

      {scene ? (
        <div className="px-3 py-2.5 space-y-1.5">
          {scene.imageUrl && <img src={scene.imageUrl} alt="" className="w-full h-20 rounded-lg object-cover" />}
          <p className="text-xs font-medium text-[var(--foreground)]">{scene.name}</p>
          <p className="text-[9px] text-[var(--muted-foreground)]">{scene.environment}</p>
          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-400">{scene.mood}</span>
          <p className="text-[9px] text-[var(--muted-foreground)] line-clamp-2">{scene.description}</p>
        </div>
      ) : (
        <div className="px-3 py-6 flex flex-col items-center gap-1">
          <MapPin className="h-6 w-6 text-[var(--muted-foreground)]" />
          <p className="text-[10px] text-[var(--muted-foreground)]">Connect scene data</p>
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-teal-500" />
          <p className="text-[10px] font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-teal-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
