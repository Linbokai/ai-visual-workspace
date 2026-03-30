import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MapPinPlus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';
import { useTranslation } from 'react-i18next';

interface CreateSceneNodeDataType {
  label: string;
  scene?: {
    name: string;
    environment: string;
    description: string;
    mood: string;
    imageUrl: string | null;
  } | null;
  referenceImages?: string[];
  notes?: string;
  prompt?: string;
}

const MOOD_OPTIONS = ['', 'peaceful', 'tense', 'mysterious', 'romantic', 'dark', 'cheerful', 'epic', 'melancholy'];

export function CreateSceneNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CreateSceneNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const scene = nodeData.scene;
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors w-[260px]',
        selected ? 'border-emerald-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#10b981' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-emerald-500" />

      <div className="px-3 py-2 space-y-2 nodrag">
        {/* Name */}
        <input
          type="text"
          placeholder={t('nodes.createScene')}
          value={scene?.name || ''}
          onChange={(e) =>
            updateNode(id, { scene: { ...(scene || { environment: '', description: '', mood: '', imageUrl: null }), name: e.target.value } })
          }
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-xs rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-emerald-500"
        />

        {/* Environment */}
        <input
          type="text"
          placeholder={t('properties.environment')}
          value={scene?.environment || ''}
          onChange={(e) =>
            updateNode(id, { scene: { ...(scene || { name: '', description: '', mood: '', imageUrl: null }), environment: e.target.value } })
          }
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-emerald-500"
        />

        {/* Mood */}
        <select
          value={scene?.mood || ''}
          onChange={(e) =>
            updateNode(id, { scene: { ...(scene || { name: '', environment: '', description: '', imageUrl: null }), mood: e.target.value } })
          }
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none cursor-pointer"
        >
          <option value="">{t('properties.moodPlaceholder')}</option>
          {MOOD_OPTIONS.filter(Boolean).map((m) => (
            <option key={m} value={m}>{t(`properties.${m}`)}</option>
          ))}
        </select>

        {/* Description */}
        <textarea
          placeholder={t('properties.sceneDescPlaceholder')}
          value={scene?.description || ''}
          onChange={(e) =>
            updateNode(id, { scene: { ...(scene || { name: '', environment: '', mood: '', imageUrl: null }), description: e.target.value } })
          }
          rows={2}
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-emerald-500 resize-none"
        />

        {/* Reference image */}
        {scene?.imageUrl ? (
          <img src={scene.imageUrl} alt="" className="w-full h-20 rounded-lg object-cover" />
        ) : (
          <div className="w-full h-12 rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center gap-1.5 text-[var(--muted-foreground)]">
            <Upload className="h-3 w-3" />
            <span className="text-[9px]">{t('properties.referenceImage')}</span>
          </div>
        )}

        {/* Notes */}
        <textarea
          placeholder={t('properties.notesPlaceholder')}
          value={nodeData.notes || ''}
          onChange={(e) => updateNode(id, { notes: e.target.value })}
          rows={1}
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-emerald-500 resize-none"
        />
      </div>

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPinPlus className="h-3.5 w-3.5 text-emerald-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
