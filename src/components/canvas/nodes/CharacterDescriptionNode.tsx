import { Handle, Position, type NodeProps } from '@xyflow/react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface CharacterDescriptionNodeDataType {
  label: string;
  character?: { name: string; identity: string; appearance: string; age: string; gender: string; imageUrl: string | null } | null;
  description?: string;
  prompt?: string;
}

export function CharacterDescriptionNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as CharacterDescriptionNodeDataType;
  const { t } = useTranslation();
  const character = nodeData.character;

  return (
    <div className={cn('rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[220px]', selected ? 'border-violet-500 node-selected-glow' : 'border-[var(--border)]')} style={{ '--glow-color': '#8b5cf6' } as React.CSSProperties}>
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-[var(--card)]" />

      {character ? (
        <div className="px-3 py-2.5 space-y-1.5">
          <div className="flex items-center gap-2">
            {character.imageUrl ? (
              <img src={character.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center"><span className="text-sm text-violet-400">{character.name[0]}</span></div>
            )}
            <div>
              <p className="text-xs font-medium text-[var(--foreground)]">{character.name}</p>
              <p className="text-[9px] text-[var(--muted-foreground)]">{character.identity}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div><span className="text-[var(--muted-foreground)]">{t('properties.ageLabel')} </span><span className="text-[var(--foreground)]">{character.age}</span></div>
            <div><span className="text-[var(--muted-foreground)]">{t('properties.genderLabel')} </span><span className="text-[var(--foreground)]">{character.gender}</span></div>
          </div>
          <p className="text-[9px] text-[var(--muted-foreground)] line-clamp-2">{character.appearance}</p>
        </div>
      ) : (
        <div className="px-3 py-6 flex flex-col items-center gap-1">
          <User className="h-6 w-6 text-[var(--muted-foreground)]" />
          <p className="text-[10px] text-[var(--muted-foreground)]">{t('properties.connectCharacterData')}</p>
        </div>
      )}

      <div className="px-3 py-1.5 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <User className="h-3 w-3 text-violet-500" />
          <p className="text-[10px] font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-violet-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
