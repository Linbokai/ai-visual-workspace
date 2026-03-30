import { Sun, Moon, Sunrise } from 'lucide-react';
import { useThemeStore } from '@/stores/useThemeStore';

const themeIcons = {
  dark: Sun,
  light: Sunrise,
  solarized: Moon,
} as const;

const themeTitles = {
  dark: 'Switch to light mode',
  light: 'Switch to solarized mode',
  solarized: 'Switch to dark mode',
} as const;

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const Icon = themeIcons[theme];

  return (
    <button
      onClick={toggleTheme}
      title={themeTitles[theme]}
      className="flex items-center justify-center p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
