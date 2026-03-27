import { Image, Video, Type, Music, Upload, Group, Paintbrush, PenTool, Columns2, Film, BookOpen, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
import type { LeftPanelType } from '@/stores/usePanelStore';
import type { NodeType } from '@/types';

const nodeOptions: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  descKey: string;
}> = [
  { type: 'image', labelKey: 'nodes.image', icon: Image, descKey: 'nodes.imageDesc' },
  { type: 'video', labelKey: 'nodes.video', icon: Video, descKey: 'nodes.videoDesc' },
  { type: 'text', labelKey: 'nodes.text', icon: Type, descKey: 'nodes.textDesc' },
  { type: 'audio', labelKey: 'nodes.audio', icon: Music, descKey: 'nodes.audioDesc' },
  { type: 'group', labelKey: 'nodes.group', icon: Group, descKey: 'nodes.groupDesc' },
];

const advancedNodeOptions: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  descKey: string;
}> = [
  { type: 'image-editor', labelKey: 'nodes.imageEditor', icon: Paintbrush, descKey: 'nodes.imageEditorDesc' },
  { type: 'doodle-image', labelKey: 'nodes.doodleToImage', icon: PenTool, descKey: 'nodes.doodleToImageDesc' },
  { type: 'compare', labelKey: 'nodes.compare', icon: Columns2, descKey: 'nodes.compareDesc' },
];

export function AddNodePanel() {
  const addNode = useCanvasStore((s) => s.addNode);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);
  const { t } = useTranslation();

  const handleAdd = (type: NodeType) => {
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    addNode(type, { x, y });
    closePanel();
  };

  return (
    <div className="space-y-2">
      {nodeOptions.map(({ type, labelKey, icon: Icon, descKey }) => (
        <button
          key={type}
          onClick={() => handleAdd(type)}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{t(labelKey)}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t(descKey)}</p>
          </div>
        </button>
      ))}

      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-3 mb-2">
          {t('sidebar.advanced')}
        </p>
        {advancedNodeOptions.map(({ type, labelKey, icon: Icon, descKey }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{t(labelKey)}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{t(descKey)}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-3 mb-2">
          {t('nodes.analysisTools')}
        </p>
        {([
          { panel: 'video-analysis' as LeftPanelType, labelKey: 'sidebar.videoAnalysis', icon: Film, descKey: 'nodes.videoAnalysisDesc' },
          { panel: 'storyboard' as LeftPanelType, labelKey: 'sidebar.storyboard', icon: BookOpen, descKey: 'nodes.storyboardDesc' },
          { panel: 'prompt-engineer' as LeftPanelType, labelKey: 'sidebar.promptEngineer', icon: Sparkles, descKey: 'nodes.promptEngineerDesc' },
        ]).map(({ panel, labelKey, icon: Icon, descKey }) => (
          <button
            key={panel}
            onClick={() => togglePanel(panel)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{t(labelKey)}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{t(descKey)}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-[var(--border)]">
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{t('nodes.upload')}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t('nodes.uploadDesc')}</p>
          </div>
        </button>
      </div>
    </div>
  );
}
