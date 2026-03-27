import { Sparkles, Image, Video, Type, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeMessageProps {
  onQuickAction: (prompt: string) => void;
}

export function WelcomeMessage({ onQuickAction }: WelcomeMessageProps) {
  const { t } = useTranslation();

  const quickActions = [
    { icon: Image, labelKey: 'welcome.generateSunset', prompt: 'Generate image of a dramatic sunset over mountain landscape with golden hour lighting' },
    { icon: Video, labelKey: 'welcome.createProductVideo', prompt: 'Create a 5-second video showing a product rotating on a clean white background' },
    { icon: Type, labelKey: 'welcome.writeMarketingCopy', prompt: 'Write compelling marketing copy for a modern tech product launch' },
    { icon: Music, labelKey: 'welcome.generateMusic', prompt: 'Generate audio ambient background music for a product showcase video' },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6 text-[var(--primary)]" />
      </div>
      <h3 className="text-base font-medium text-[var(--foreground)] mb-1">
        {t('welcome.title')}
      </h3>
      <p className="text-sm text-[var(--muted-foreground)] text-center mb-6 max-w-[280px]">
        {t('welcome.subtitle')}
      </p>

      <div className="w-full space-y-2">
        <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
          {t('welcome.quickActions')}
        </p>
        {quickActions.map(({ icon: Icon, labelKey, prompt }) => (
          <button
            key={labelKey}
            onClick={() => onQuickAction(prompt)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer bg-transparent border border-[var(--border)] text-left"
          >
            <Icon className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
            <span className="text-sm text-[var(--foreground)]">{t(labelKey)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
