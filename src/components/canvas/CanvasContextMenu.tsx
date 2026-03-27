import { useEffect, useRef } from 'react';
import { Image, Video, Type, Music, Group, Paintbrush, PenTool, Columns2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeType } from '@/types';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  canvasPosition: { x: number; y: number };
  onClose: () => void;
}

const menuItems: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: string;
}> = [
  { type: 'image', labelKey: 'nodes.imageNode', icon: Image },
  { type: 'video', labelKey: 'nodes.videoNode', icon: Video },
  { type: 'text', labelKey: 'nodes.textNode', icon: Type },
  { type: 'audio', labelKey: 'nodes.audioNode', icon: Music },
  { type: 'group', labelKey: 'nodes.groupNode', icon: Group },
  { type: 'image-editor', labelKey: 'nodes.imageEditor', icon: Paintbrush, group: 'advanced' },
  { type: 'doodle-image', labelKey: 'nodes.doodleToImage', icon: PenTool, group: 'advanced' },
  { type: 'compare', labelKey: 'nodes.compareNode', icon: Columns2, group: 'advanced' },
];

export function CanvasContextMenu({ x, y, canvasPosition, onClose }: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const addNode = useCanvasStore((s) => s.addNode);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAdd = (type: NodeType) => {
    addNode(type, canvasPosition);
    onClose();
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 min-w-[180px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl py-1.5"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {t('sidebar.addNode')}
      </div>
      {menuItems.filter((m) => !m.group).map(({ type, labelKey, icon: Icon }) => (
        <button
          key={type}
          onClick={() => handleAdd(type)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <Icon className="h-4 w-4 text-[var(--primary)]" />
          {t(labelKey)}
        </button>
      ))}
      <div className="mx-3 my-1 h-px bg-[var(--border)]" />
      <div className="px-3 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {t('sidebar.advanced')}
      </div>
      {menuItems.filter((m) => m.group === 'advanced').map(({ type, labelKey, icon: Icon }) => (
        <button
          key={type}
          onClick={() => handleAdd(type)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <Icon className="h-4 w-4 text-[var(--primary)]" />
          {t(labelKey)}
        </button>
      ))}
    </motion.div>
  );
}
