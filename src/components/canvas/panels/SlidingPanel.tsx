import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePanelStore } from '@/stores/usePanelStore';
import { AddNodePanel } from './AddNodePanel';
import { AssetsPanel } from './AssetsPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { HistoryPanel } from './HistoryPanel';
import { AdvancedPanel } from './AdvancedPanel';
import { VideoAnalyzer } from '../VideoAnalyzer';
import { StoryboardPanel } from '../StoryboardPanel';
import { PromptEngineer } from '../PromptEngineer';
import { CharactersPanel } from './CharactersPanel';
import { BatchPanel } from './BatchPanel';

const panelTitles: Record<string, string> = {
  add: 'Add Node',
  assets: 'Assets',
  templates: 'Templates',
  history: 'History',
  characters: 'Characters',
  advanced: 'Advanced',
  'video-analysis': 'Video Analysis',
  storyboard: 'Storyboard',
  'prompt-engineer': 'Prompt Engineer',
  batch: 'Batch Queue',
};

export function SlidingPanel() {
  const activePanel = usePanelStore((s) => s.activeLeftPanel);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);

  return (
    <AnimatePresence>
      {activePanel !== 'none' && (
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-[420px] h-full border-r border-[var(--border)] bg-[var(--sidebar)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] flex-shrink-0">
            <h2 className="text-sm font-medium text-[var(--foreground)]">
              {panelTitles[activePanel]}
            </h2>
            <button
              onClick={closePanel}
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activePanel === 'add' && <AddNodePanel />}
            {activePanel === 'assets' && <AssetsPanel />}
            {activePanel === 'templates' && <TemplatesPanel />}
            {activePanel === 'history' && <HistoryPanel />}
            {activePanel === 'characters' && <CharactersPanel />}
            {activePanel === 'advanced' && <AdvancedPanel />}
            {activePanel === 'video-analysis' && <VideoAnalyzer />}
            {activePanel === 'storyboard' && <StoryboardPanel />}
            {activePanel === 'prompt-engineer' && <PromptEngineer />}
            {activePanel === 'batch' && <BatchPanel />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
