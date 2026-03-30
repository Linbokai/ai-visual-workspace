import { useEffect, useRef } from 'react';
import { Image, Video, Type, Music, Group, Paintbrush, PenTool, Columns2, BookOpen, Film, Users, User, MapPin, Sparkles, LayoutGrid, Eye, HardDrive } from 'lucide-react';
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
  { type: 'mask-editor', labelKey: 'nodes.maskEditor', icon: Paintbrush, group: 'advanced' },
  // AI Generation
  { type: 'gen-image', labelKey: 'nodes.genImage', icon: Sparkles, group: 'generation' },
  { type: 'gen-video', labelKey: 'nodes.genVideo', icon: Film, group: 'generation' },
  // Story & Analysis
  { type: 'novel-input', labelKey: 'nodes.novelInput', icon: BookOpen, group: 'story' },
  { type: 'video-analyze', labelKey: 'nodes.videoAnalyze', icon: Film, group: 'story' },
  { type: 'extract-characters-scenes', labelKey: 'nodes.extractCharactersScenes', icon: Users, group: 'story' },
  { type: 'storyboard-node', labelKey: 'nodes.storyboardNode', icon: LayoutGrid, group: 'story' },
  // Character & Scene
  { type: 'character-description', labelKey: 'nodes.characterDescription', icon: User, group: 'character' },
  { type: 'scene-description', labelKey: 'nodes.sceneDescription', icon: MapPin, group: 'character' },
  { type: 'generate-character-image', labelKey: 'nodes.generateCharacterImage', icon: Sparkles, group: 'character' },
  { type: 'generate-scene-image', labelKey: 'nodes.generateSceneImage', icon: Sparkles, group: 'character' },
  // Output
  { type: 'preview', labelKey: 'nodes.preview', icon: Eye, group: 'output' },
  { type: 'local-save', labelKey: 'nodes.localSave', icon: HardDrive, group: 'output' },
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
      <div className="mx-3 my-1 h-px bg-[var(--border)]" />
      <div className="px-3 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {t('nodes.aiGeneration')}
      </div>
      {menuItems.filter((m) => m.group === 'generation').map(({ type, labelKey, icon: Icon }) => (
        <button key={type} onClick={() => handleAdd(type)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
          {t(labelKey)}
        </button>
      ))}
      <div className="mx-3 my-1 h-px bg-[var(--border)]" />
      <div className="px-3 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {t('nodes.storyAnalysis')}
      </div>
      {menuItems.filter((m) => m.group === 'story').map(({ type, labelKey, icon: Icon }) => (
        <button key={type} onClick={() => handleAdd(type)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
          {t(labelKey)}
        </button>
      ))}
      <div className="mx-3 my-1 h-px bg-[var(--border)]" />
      <div className="px-3 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {t('nodes.characterScene')}
      </div>
      {menuItems.filter((m) => m.group === 'character').map(({ type, labelKey, icon: Icon }) => (
        <button key={type} onClick={() => handleAdd(type)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
          {t(labelKey)}
        </button>
      ))}
      <div className="mx-3 my-1 h-px bg-[var(--border)]" />
      <div className="px-3 py-1 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        {t('nodes.output')}
      </div>
      {menuItems.filter((m) => m.group === 'output').map(({ type, labelKey, icon: Icon }) => (
        <button key={type} onClick={() => handleAdd(type)} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left">
          <Icon className="h-4 w-4 text-[var(--primary)]" />
          {t(labelKey)}
        </button>
      ))}
    </motion.div>
  );
}
