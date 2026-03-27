import { Sparkles, Image, Video, Type, Music } from 'lucide-react';

interface WelcomeMessageProps {
  onQuickAction: (prompt: string) => void;
}

const quickActions = [
  { icon: Image, label: 'Generate a sunset landscape image', prompt: 'Generate image of a dramatic sunset over mountain landscape with golden hour lighting' },
  { icon: Video, label: 'Create a 5-second product video', prompt: 'Create a 5-second video showing a product rotating on a clean white background' },
  { icon: Type, label: 'Write marketing copy', prompt: 'Write compelling marketing copy for a modern tech product launch' },
  { icon: Music, label: 'Generate background music', prompt: 'Generate audio ambient background music for a product showcase video' },
];

export function WelcomeMessage({ onQuickAction }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6 text-[var(--primary)]" />
      </div>
      <h3 className="text-base font-medium text-[var(--foreground)] mb-1">
        AI Assistant
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] text-center mb-6 max-w-[280px]">
        Select a node and describe what you'd like to create or modify.
      </p>

      <div className="w-full space-y-2">
        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          Quick Actions
        </p>
        {quickActions.map(({ icon: Icon, label, prompt }) => (
          <button
            key={label}
            onClick={() => onQuickAction(prompt)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border border-[var(--border)] text-left"
          >
            <Icon className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
            <span className="text-sm text-[var(--foreground)]">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
