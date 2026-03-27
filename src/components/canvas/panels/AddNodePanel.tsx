import { Image, Video, Type, Music, Upload, Group, Paintbrush, PenTool, Columns2, Film, BookOpen, Sparkles } from 'lucide-react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
import type { LeftPanelType } from '@/stores/usePanelStore';
import type { NodeType } from '@/types';

const nodeOptions: Array<{
  type: NodeType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { type: 'image', label: 'Image', icon: Image, description: 'Generate images with AI' },
  { type: 'video', label: 'Video', icon: Video, description: 'Generate videos with AI' },
  { type: 'text', label: 'Text', icon: Type, description: 'Add a text node' },
  { type: 'audio', label: 'Audio', icon: Music, description: 'Add an audio node' },
  { type: 'group', label: 'Group', icon: Group, description: 'Group nodes together' },
];

const advancedNodeOptions: Array<{
  type: NodeType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { type: 'image-editor', label: 'Image Editor', icon: Paintbrush, description: 'Crop, adjust, and filter images' },
  { type: 'doodle-image', label: 'Doodle to Image', icon: PenTool, description: 'Sketch and convert to AI image' },
  { type: 'compare', label: 'Compare', icon: Columns2, description: 'Side-by-side image comparison' },
];

export function AddNodePanel() {
  const addNode = useCanvasStore((s) => s.addNode);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);

  const handleAdd = (type: NodeType) => {
    // Place node at a random position near center
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    addNode(type, { x, y });
    closePanel();
  };

  return (
    <div className="space-y-2">
      {nodeOptions.map(({ type, label, icon: Icon, description }) => (
        <button
          key={type}
          onClick={() => handleAdd(type)}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
          </div>
        </button>
      ))}

      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-3 mb-2">
          Advanced
        </p>
        {advancedNodeOptions.map(({ type, label, icon: Icon, description }) => (
          <button
            key={type}
            onClick={() => handleAdd(type)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-[var(--border)]">
        <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-3 mb-2">
          Analysis Tools
        </p>
        {([
          { panel: 'video-analysis' as LeftPanelType, label: 'Video Analysis', icon: Film, description: 'Extract keyframes and detect scenes' },
          { panel: 'storyboard' as LeftPanelType, label: 'Storyboard', icon: BookOpen, description: 'Generate storyboard from text' },
          { panel: 'prompt-engineer' as LeftPanelType, label: 'Prompt Engineer', icon: Sparkles, description: 'Build and manage prompts' },
        ]).map(({ panel, label, icon: Icon, description }) => (
          <button
            key={panel}
            onClick={() => togglePanel(panel)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
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
            <p className="text-sm font-medium text-[var(--foreground)]">Upload</p>
            <p className="text-xs text-[var(--muted-foreground)]">Upload from your device</p>
          </div>
        </button>
      </div>
    </div>
  );
}
