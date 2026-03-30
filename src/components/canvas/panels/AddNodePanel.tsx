import { Image, Video, Type, Music, Upload, Group, Paintbrush, PenTool, Columns2, Film, BookOpen, Sparkles, Users, User, MapPin, LayoutGrid, Eye, HardDrive, UserPlus, MapPinPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReactFlow } from '@xyflow/react';
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
  { type: 'mask-editor', labelKey: 'nodes.maskEditor', icon: Paintbrush, descKey: 'nodes.maskEditorDesc' },
];

const generationNodeOptions: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  descKey: string;
}> = [
  { type: 'gen-image', labelKey: 'nodes.genImage', icon: Sparkles, descKey: 'nodes.genImageDesc' },
  { type: 'gen-video', labelKey: 'nodes.genVideo', icon: Film, descKey: 'nodes.genVideoDesc' },
];

const storyNodeOptions: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  descKey: string;
}> = [
  { type: 'novel-input', labelKey: 'nodes.novelInput', icon: BookOpen, descKey: 'nodes.novelInputDesc' },
  { type: 'video-analyze', labelKey: 'nodes.videoAnalyze', icon: Film, descKey: 'nodes.videoAnalyzeDesc' },
  { type: 'extract-characters-scenes', labelKey: 'nodes.extractCharactersScenes', icon: Users, descKey: 'nodes.extractCharactersScenesDesc' },
  { type: 'storyboard-node', labelKey: 'nodes.storyboardNode', icon: LayoutGrid, descKey: 'nodes.storyboardNodeDesc' },
];

const characterNodeOptions: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  descKey: string;
}> = [
  { type: 'create-character', labelKey: 'nodes.createCharacter', icon: UserPlus, descKey: 'nodes.createCharacterDesc' },
  { type: 'create-scene', labelKey: 'nodes.createScene', icon: MapPinPlus, descKey: 'nodes.createSceneDesc' },
  { type: 'character-description', labelKey: 'nodes.characterDescription', icon: User, descKey: 'nodes.characterDescriptionDesc' },
  { type: 'scene-description', labelKey: 'nodes.sceneDescription', icon: MapPin, descKey: 'nodes.sceneDescriptionDesc' },
  { type: 'generate-character-image', labelKey: 'nodes.generateCharacterImage', icon: Sparkles, descKey: 'nodes.generateCharacterImageDesc' },
  { type: 'generate-scene-image', labelKey: 'nodes.generateSceneImage', icon: Sparkles, descKey: 'nodes.generateSceneImageDesc' },
];

const outputNodeOptions: Array<{
  type: NodeType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  descKey: string;
}> = [
  { type: 'preview', labelKey: 'nodes.preview', icon: Eye, descKey: 'nodes.previewDesc' },
  { type: 'local-save', labelKey: 'nodes.localSave', icon: HardDrive, descKey: 'nodes.localSaveDesc' },
];

export function AddNodePanel() {
  const addNode = useCanvasStore((s) => s.addNode);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);
  const { t } = useTranslation();
  const { screenToFlowPosition } = useReactFlow();

  const handleAdd = (type: NodeType) => {
    // Place node at center of current viewport
    const centerScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const flowPos = screenToFlowPosition(centerScreen);
    // Add small random offset to avoid stacking
    const x = flowPos.x + (Math.random() - 0.5) * 100;
    const y = flowPos.y + (Math.random() - 0.5) * 80;
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
          {t('nodes.aiGeneration')}
        </p>
        {generationNodeOptions.map(({ type, labelKey, icon: Icon, descKey }) => (
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
          {t('nodes.storyAnalysis')}
        </p>
        {storyNodeOptions.map(({ type, labelKey, icon: Icon, descKey }) => (
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
          {t('nodes.characterScene')}
        </p>
        {characterNodeOptions.map(({ type, labelKey, icon: Icon, descKey }) => (
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
          {t('nodes.output')}
        </p>
        {outputNodeOptions.map(({ type, labelKey, icon: Icon, descKey }) => (
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
