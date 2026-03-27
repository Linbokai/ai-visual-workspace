import {
  Plus,
  FolderOpen,
  LayoutTemplate,
  MessageSquare,
  Clock,
  Wand2,
  Bot,
  Film,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { usePanelStore } from '@/stores/usePanelStore';
import type { LeftPanelType } from '@/stores/usePanelStore';
import { cn } from '@/lib/utils';

const sidebarItems: Array<{
  id: LeftPanelType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  dividerBefore?: boolean;
}> = [
  { id: 'add', icon: Plus, label: 'Add Node' },
  { id: 'assets', icon: FolderOpen, label: 'Assets' },
  { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
  { id: 'history', icon: Clock, label: 'History' },
  { id: 'advanced', icon: Wand2, label: 'Advanced' },
  { id: 'video-analysis', icon: Film, label: 'Video Analysis', dividerBefore: true },
  { id: 'storyboard', icon: BookOpen, label: 'Storyboard' },
  { id: 'prompt-engineer', icon: Sparkles, label: 'Prompt Engineer' },
];

export function LeftSidebar() {
  const activePanel = usePanelStore((s) => s.activeLeftPanel);
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);
  const toggleChat = usePanelStore((s) => s.toggleChatPanel);
  const chatOpen = usePanelStore((s) => s.chatPanelOpen);

  return (
    <nav
      className="w-16 h-full flex flex-col items-center py-3 gap-1 border-r border-[var(--border)] bg-[var(--sidebar)]"
      role="toolbar"
      aria-label="Canvas tools"
    >
      {sidebarItems.map(({ id, icon: Icon, label, dividerBefore }) => (
        <span key={id} className="contents">
          {dividerBefore && (
            <div className="w-6 h-px bg-[var(--border)] my-1" aria-hidden="true" />
          )}
          <button
            onClick={() => togglePanel(id)}
            title={label}
            aria-label={label}
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
        title="AI Chat"
        aria-label="AI Chat"
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
        title="AI Agent"
        aria-label="AI Agent"
        className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
      >
        <Bot className="h-5 w-5" />
      </button>
    </nav>
  );
}
