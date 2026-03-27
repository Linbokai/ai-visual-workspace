import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
      aria-label="Switch language"
      title={i18n.language === 'zh' ? 'English' : '中文'}
    >
      <Languages className="h-4 w-4" />
      <span className="text-xs">{i18n.language === 'zh' ? '中' : 'EN'}</span>
    </button>
  );
}
