import { Sparkles, Image, Video, Type, Music } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeMessageProps {
  onQuickAction: (prompt: string) => void;
}

export function WelcomeMessage({ onQuickAction }: WelcomeMessageProps) {
  const { t } = useTranslation();

  const quickActions = [
    { icon: Image, labelKey: 'welcome.generateSunset', prompt: '生成一张戏剧性的日落山景图片，黄金时刻光线' },
    { icon: Video, labelKey: 'welcome.createProductVideo', prompt: '创建一个5秒的产品旋转展示视频，干净的白色背景' },
    { icon: Type, labelKey: 'welcome.writeMarketingCopy', prompt: '为现代科技产品发布撰写引人入胜的营销文案' },
    { icon: Music, labelKey: 'welcome.generateMusic', prompt: '生成一段产品展示视频用的氛围背景音乐' },
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
