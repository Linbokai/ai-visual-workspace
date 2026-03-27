import { type NodeProps } from '@xyflow/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface GroupNodeDataType {
  label: string;
  color?: string;
}

const groupColors = [
  { name: 'Gray', value: 'var(--node-group)', bg: 'var(--node-group)' },
  { name: 'Blue', value: 'var(--node-image)', bg: 'var(--node-image)' },
  { name: 'Purple', value: 'var(--node-video)', bg: 'var(--node-video)' },
  { name: 'Amber', value: 'var(--node-text)', bg: 'var(--node-text)' },
  { name: 'Green', value: 'var(--node-audio)', bg: 'var(--node-audio)' },
];

export function GroupNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as GroupNodeDataType;
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(nodeData.label || 'Group');
  const inputRef = useRef<HTMLInputElement>(null);
  const updateNode = useCanvasStore((s) => s.updateNode);
  const groupColor = nodeData.color || 'var(--node-group)';

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) {
      updateNode(id, { label: trimmed } as Record<string, unknown>);
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-dashed min-w-[300px] min-h-[200px] transition-all',
        selected
          ? 'node-selected-glow'
          : 'bg-white/[0.02]'
      )}
      style={{
        '--glow-color': groupColor,
        borderColor: selected ? groupColor : 'var(--border)',
        backgroundColor: selected
          ? `color-mix(in srgb, ${groupColor} 5%, transparent)`
          : undefined,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-2xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${groupColor} 8%, transparent)`,
          borderBottom: `1px dashed color-mix(in srgb, ${groupColor} 20%, transparent)`,
        }}
      >
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="h-5 px-1 rounded border border-[var(--border)] bg-[var(--input)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] w-32"
            aria-label="Group name"
          />
        ) : (
          <button
            onDoubleClick={() => { setEditValue(nodeData.label || 'Group'); setEditing(true); }}
            className="text-xs font-medium cursor-text bg-transparent border-none p-0"
            style={{ color: groupColor }}
          >
            {nodeData.label || 'Group'}
          </button>
        )}

        {/* Color selector (visible on select) */}
        {selected && (
          <div className="flex items-center gap-1">
            {groupColors.map((c) => (
              <button
                key={c.name}
                title={c.name}
                onClick={() => updateNode(id, { color: c.value } as Record<string, unknown>)}
                className="w-3 h-3 rounded-full cursor-pointer border-none hover:scale-125 transition-transform"
                style={{
                  backgroundColor: c.bg,
                  boxShadow: groupColor === c.value ? `0 0 0 2px var(--card), 0 0 0 3px ${c.bg}` : 'none',
                }}
                aria-label={`Set group color to ${c.name}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body - drop zone for child nodes */}
      <div className="p-3 min-h-[160px]" />
    </div>
  );
}
