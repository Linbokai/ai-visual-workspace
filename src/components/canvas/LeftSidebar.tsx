import {
  Plus,
  FolderOpen,
  LayoutTemplate,
  MessageSquare,
  Clock,
  Users,
  Wand2,
  Bot,
  Film,
  BookOpen,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePanelStore } from '@/stores/usePanelStore';
import type { LeftPanelType } from '@/stores/usePanelStore';
import { cn } from '@/lib/utils';

const sidebarItems: Array<{
  id: LeftPanelType;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: string;
  dividerBefore?: boolean;
}> = [
  { id: 'add', icon: Plus, labelKey: 'sidebar.addNode' },
  { id: 'assets', icon: FolderOpen, labelKey: 'sidebar.assets' },
  { id: 'templates', icon: LayoutTemplate, labelKey: 'sidebar.templates' },
  { id: 'history', icon: Clock, labelKey: 'sidebar.history' },
  { id: 'characters', icon: Users, labelKey: 'sidebar.characters' },
  { id: 'advanced', icon: Wand2, labelKey: 'sidebar.advanced' },
  { id: 'video-analysis', icon: Film, labelKey: 'sidebar.videoAnalysis', dividerBefore: true },
  { id: 'storyboard', icon: BookOpen, labelKey: 'sidebar.storyboard' },
  { id: 'prompt-engineer', icon: Sparkles, labelKey: 'sidebar.promptEngineer' },
  { id: 'batch', icon: Layers, labelKey: 'sidebar.batch', dividerBefore: true },
];

export function LeftSidebar() {
  const activePanel = usePanelStore((s) => s.activeLeftPanel);
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);
  const toggleChat = usePanelStore((s) => s.toggleChatPanel);
  const chatOpen = usePanelStore((s) => s.chatPanelOpen);
  const { t } = useTranslation();

  return (
    <nav
      className="w-16 h-full flex flex-col items-center py-3 gap-1 border-r border-[var(--border)] bg-[var(--sidebar)]"
      role="toolbar"
      aria-label="Canvas tools"
    >
      {sidebarItems.map(({ id, icon: Icon, labelKey, dividerBefore }) => (
        <span key={id} className="contents">
          {dividerBefore && (
            <div className="w-6 h-px bg-[var(--border)] my-1" aria-hidden="true" />
          )}
          <button
            onClick={() => togglePanel(id)}
            title={t(labelKey)}
            aria-label={t(labelKey)}
            aria-pressed={activePanel === id}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer bg-transparent border-none',
              activePanel === id
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)]'
            )}
          >
            <Icon className="h-5 w-5" />
          </button>
        </span>
      ))}

      <div className="flex-1" />

      {/* Chat toggle */}
      <button
        onClick={toggleChat}
        title={t('canvas.aiChat')}
        aria-label={t('canvas.aiChat')}
        aria-pressed={chatOpen}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-xl transition-colors cursor-pointer bg-transparent border-none',
          chatOpen
            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)]'
        )}
      >
        <MessageSquare className="h-5 w-5" />
      </button>

      {/* AI Agent */}
      <button
        title={t('canvas.aiAgent')}
        aria-label={t('canvas.aiAgent')}
        className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
      >
        <Bot className="h-5 w-5" />
      </button>
    </nav>
  );
}
