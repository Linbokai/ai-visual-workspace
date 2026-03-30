import { useTranslation } from 'react-i18next';
import {
  Crop,
  SlidersHorizontal,
  Eraser,
  Palette,
  MoreHorizontal,
  CheckCircle2,
  Download,
  Maximize,
  Trash2,
  Wand2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface ToolbarAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export function NodeToolbar() {
  const { t } = useTranslation();
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const removeNode = useCanvasStore((s) => s.removeNode);

  const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
  const singleNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const isMediaNode = singleNode && (singleNode.type === 'image' || singleNode.type === 'video');

  const handleDelete = () => {
    selectedNodeIds.forEach((id) => removeNode(id));
  };

  const handleDownload = () => {
    if (!singleNode) return;
    const data = singleNode.data as Record<string, unknown>;
    const url = (data.imageUrl || data.videoUrl || data.audioUrl) as string | null;
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = (data.label as string) || 'download';
      a.click();
    }
  };

  const actions: ToolbarAction[] = [];

  if (isMediaNode) {
    actions.push(
      { icon: Crop, label: t('toolbar.crop'), onClick: () => console.log('crop') },
      { icon: SlidersHorizontal, label: t('toolbar.adjust'), onClick: () => console.log('adjust') },
      { icon: Eraser, label: t('toolbar.erase'), onClick: () => console.log('erase') },
      { icon: Palette, label: t('toolbar.styleTransfer'), onClick: () => console.log('style') },
      { icon: Wand2, label: t('toolbar.enhance'), onClick: () => console.log('enhance') },
    );
  }

  actions.push(
    { icon: CheckCircle2, label: t('toolbar.markDone'), onClick: () => console.log('done') },
    { icon: Download, label: t('toolbar.download'), onClick: handleDownload },
    { icon: Maximize, label: t('toolbar.fullscreen'), onClick: () => console.log('fullscreen') },
  );

  return (
    <AnimatePresence>
      {selectedNodeIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center gap-0.5 px-1 py-0.5 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-lg"
        >
          {actions.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              title={label}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}

          {/* More actions */}
          <button
            title={t('toolbar.more')}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {/* Separator */}
          <div className="w-px h-5 bg-[var(--border)] mx-1" />

          {/* Delete */}
          <button
            onClick={handleDelete}
            title={t('toolbar.delete')}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--error)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
