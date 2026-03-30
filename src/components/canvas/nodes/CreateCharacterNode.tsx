import { Handle, Position, type NodeProps } from '@xyflow/react';
import { UserPlus, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeStatus } from '@/types';
import { useTranslation } from 'react-i18next';

interface CreateCharacterNodeDataType {
  label: string;
  character?: {
    name: string;
    identity: string;
    appearance: string;
    age: string;
    gender: string;
    imageUrl: string | null;
  } | null;
  referenceImages?: string[];
  notes?: string;
  prompt?: string;
}

export function CreateCharacterNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CreateCharacterNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const character = nodeData.character;
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors w-[260px]',
        selected ? 'border-amber-500 node-selected-glow' : 'border-[var(--border)]'
      )}
      style={{ '--glow-color': '#f59e0b' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-amber-500" />

      <div className="px-3 py-2 space-y-2 nodrag">
        {/* Name */}
        <input
          type="text"
          placeholder={t('nodes.createCharacter')}
          value={character?.name || ''}
          onChange={(e) =>
            updateNode(id, { character: { ...(character || { identity: '', appearance: '', age: '', gender: '', imageUrl: null }), name: e.target.value } })
          }
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-xs rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-amber-500"
        />

        {/* Identity & Gender/Age row */}
        <input
          type="text"
          placeholder="Identity / Role"
          value={character?.identity || ''}
          onChange={(e) =>
            updateNode(id, { character: { ...(character || { name: '', appearance: '', age: '', gender: '', imageUrl: null }), identity: e.target.value } })
          }
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-amber-500"
        />
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Age"
            value={character?.age || ''}
            onChange={(e) =>
              updateNode(id, { character: { ...(character || { name: '', identity: '', appearance: '', gender: '', imageUrl: null }), age: e.target.value } })
            }
            className="w-1/2 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-amber-500"
          />
          <select
            value={character?.gender || ''}
            onChange={(e) =>
              updateNode(id, { character: { ...(character || { name: '', identity: '', appearance: '', age: '', imageUrl: null }), gender: e.target.value } })
            }
            className="w-1/2 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none cursor-pointer"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Appearance */}
        <textarea
          placeholder="Appearance description..."
          value={character?.appearance || ''}
          onChange={(e) =>
            updateNode(id, { character: { ...(character || { name: '', identity: '', age: '', gender: '', imageUrl: null }), appearance: e.target.value } })
          }
          rows={2}
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-amber-500 resize-none"
        />

        {/* Reference image preview */}
        {character?.imageUrl ? (
          <img src={character.imageUrl} alt="" className="w-full h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-full h-12 rounded-lg border border-dashed border-[var(--border)] flex items-center justify-center gap-1.5 text-[var(--muted-foreground)]">
            <Upload className="h-3 w-3" />
            <span className="text-[9px]">Reference image</span>
          </div>
        )}

        {/* Notes */}
        <textarea
          placeholder="Notes..."
          value={nodeData.notes || ''}
          onChange={(e) => updateNode(id, { notes: e.target.value })}
          rows={1}
          className="w-full bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:border-amber-500 resize-none"
        />
      </div>

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <UserPlus className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <NodeStatusBadge status={status as NodeStatus} />
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
