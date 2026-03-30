import { useEffect, useRef, useState } from 'react';
import {
  Image, Video, Type, Music, Group, Paintbrush, PenTool, Columns2,
  BookOpen, Film, Users, User, MapPin, Sparkles, LayoutGrid, Eye,
  HardDrive, Search, UserPlus, MapPinPlus, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeType } from '@/types';

interface CanvasContextMenuProps {
  x: number;
  y: number;
  canvasPosition: { x: number; y: number };
  onClose: () => void;
}

interface MenuItem {
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

const menuGroups: Array<{ id: string; labelKey: string; items: MenuItem[] }> = [
  {
    id: 'basic',
    labelKey: 'sidebar.addNode',
    items: [
      { type: 'image', labelKey: 'nodes.imageNode', icon: Image, group: 'basic' },
      { type: 'video', labelKey: 'nodes.videoNode', icon: Video, group: 'basic' },
      { type: 'text', labelKey: 'nodes.textNode', icon: Type, group: 'basic' },
      { type: 'audio', labelKey: 'nodes.audioNode', icon: Music, group: 'basic' },
      { type: 'group', labelKey: 'nodes.groupNode', icon: Group, group: 'basic' },
    ],
  },
  {
    id: 'advanced',
    labelKey: 'sidebar.advanced',
    items: [
      { type: 'image-editor', labelKey: 'nodes.imageEditor', icon: Paintbrush, group: 'advanced' },
      { type: 'doodle-image', labelKey: 'nodes.doodleToImage', icon: PenTool, group: 'advanced' },
      { type: 'compare', labelKey: 'nodes.compareNode', icon: Columns2, group: 'advanced' },
      { type: 'mask-editor', labelKey: 'nodes.maskEditor', icon: Paintbrush, group: 'advanced' },
    ],
  },
  {
    id: 'generation',
    labelKey: 'nodes.aiGeneration',
    items: [
      { type: 'gen-image', labelKey: 'nodes.genImage', icon: Sparkles, group: 'generation' },
      { type: 'gen-video', labelKey: 'nodes.genVideo', icon: Film, group: 'generation' },
    ],
  },
  {
    id: 'story',
    labelKey: 'nodes.storyAnalysis',
    items: [
      { type: 'novel-input', labelKey: 'nodes.novelInput', icon: BookOpen, group: 'story' },
      { type: 'video-analyze', labelKey: 'nodes.videoAnalyze', icon: Film, group: 'story' },
      { type: 'extract-characters-scenes', labelKey: 'nodes.extractCharactersScenes', icon: Users, group: 'story' },
      { type: 'storyboard-node', labelKey: 'nodes.storyboardNode', icon: LayoutGrid, group: 'story' },
    ],
  },
  {
    id: 'character',
    labelKey: 'nodes.characterScene',
    items: [
      { type: 'create-character', labelKey: 'nodes.createCharacter', icon: UserPlus, group: 'character' },
      { type: 'create-scene', labelKey: 'nodes.createScene', icon: MapPinPlus, group: 'character' },
      { type: 'character-description', labelKey: 'nodes.characterDescription', icon: User, group: 'character' },
      { type: 'scene-description', labelKey: 'nodes.sceneDescription', icon: MapPin, group: 'character' },
      { type: 'generate-character-image', labelKey: 'nodes.generateCharacterImage', icon: Sparkles, group: 'character' },
      { type: 'generate-character-video', labelKey: 'nodes.generateCharacterVideo', icon: Film, group: 'character' },
      { type: 'generate-scene-image', labelKey: 'nodes.generateSceneImage', icon: Sparkles, group: 'character' },
      { type: 'generate-scene-video', labelKey: 'nodes.generateSceneVideo', icon: Film, group: 'character' },
    ],
  },
  {
    id: 'output',
    labelKey: 'nodes.output',
    items: [
      { type: 'preview', labelKey: 'nodes.preview', icon: Eye, group: 'output' },
      { type: 'local-save', labelKey: 'nodes.localSave', icon: HardDrive, group: 'output' },
    ],
  },
];

const allItems = menuGroups.flatMap((g) => g.items);

export function CanvasContextMenu({ x, y, canvasPosition, onClose }: CanvasContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const addNode = useCanvasStore((s) => s.addNode);
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) onClose();
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

  const isSearching = search.trim().length > 0;
  const filteredItems = isSearching
    ? allItems.filter((item) => {
        const label = t(item.labelKey).toLowerCase();
        const query = search.toLowerCase();
        return label.includes(query) || item.type.includes(query);
      })
    : [];

  // Position adjustment to keep menu within viewport
  const menuStyle: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 240),
    top: Math.min(y, window.innerHeight - 400),
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 w-[220px] rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-2xl py-1.5 max-h-[70vh] flex flex-col"
      style={menuStyle}
    >
      {/* Search input */}
      <div className="px-2 pb-1.5 nodrag">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-[var(--muted-foreground)]" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t('common.search')}...`}
            className="w-full bg-[var(--muted)] text-[var(--foreground)] text-xs rounded-lg pl-7 pr-2 py-1.5 border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin">
        {isSearching ? (
          /* Search results */
          filteredItems.length > 0 ? (
            filteredItems.map(({ type, labelKey, icon: Icon }) => (
              <MenuButton key={type} icon={Icon} label={t(labelKey)} onClick={() => handleAdd(type)} />
            ))
          ) : (
            <p className="px-3 py-4 text-[10px] text-center text-[var(--muted-foreground)]">No results</p>
          )
        ) : (
          /* Grouped menu with collapsible sections */
          menuGroups.map((group, gi) => (
            <div key={group.id}>
              {gi > 0 && <div className="mx-3 my-1 h-px bg-[var(--border)]" />}

              {/* Basic group: always expanded, no header */}
              {group.id === 'basic' ? (
                group.items.map(({ type, labelKey, icon: Icon }) => (
                  <MenuButton key={type} icon={Icon} label={t(labelKey)} onClick={() => handleAdd(type)} />
                ))
              ) : (
                <>
                  <button
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none"
                  >
                    <span>{t(group.labelKey)}</span>
                    <ChevronRight className={`h-3 w-3 transition-transform ${expandedGroup === group.id ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {expandedGroup === group.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        {group.items.map(({ type, labelKey, icon: Icon }) => (
                          <MenuButton key={type} icon={Icon} label={t(labelKey)} onClick={() => handleAdd(type)} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
    >
      <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
      {label}
    </button>
  );
}
