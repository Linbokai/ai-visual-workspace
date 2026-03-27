import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutEntry {
  keys: string;
  descKey: string;
}

interface ShortcutCategory {
  titleKey: string;
  shortcuts: ShortcutEntry[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    titleKey: 'shortcuts.selection',
    shortcuts: [
      { keys: 'Ctrl + A', descKey: 'shortcuts.selectAll' },
      { keys: 'Escape', descKey: 'shortcuts.deselectAll' },
      { keys: 'Click', descKey: 'shortcuts.selectNode' },
      { keys: 'Shift + Click', descKey: 'shortcuts.multiSelect' },
    ],
  },
  {
    titleKey: 'shortcuts.editing',
    shortcuts: [
      { keys: 'Ctrl + C', descKey: 'shortcuts.copy' },
      { keys: 'Ctrl + V', descKey: 'shortcuts.paste' },
      { keys: 'Ctrl + X', descKey: 'shortcuts.cut' },
      { keys: 'Ctrl + D', descKey: 'shortcuts.duplicateNodes' },
      { keys: 'Delete', descKey: 'shortcuts.deleteNodes' },
      { keys: 'Backspace', descKey: 'shortcuts.deleteNodes' },
    ],
  },
  {
    titleKey: 'shortcuts.view',
    shortcuts: [
      { keys: 'Scroll', descKey: 'shortcuts.zoomInOut' },
      { keys: 'Click + Drag', descKey: 'shortcuts.panCanvas' },
      { keys: '?', descKey: 'shortcuts.toggleHelp' },
    ],
  },
  {
    titleKey: 'shortcuts.aiTools',
    shortcuts: [
      { keys: 'Ctrl + /', descKey: 'shortcuts.toggleChat' },
      { keys: 'Ctrl + Shift + V', descKey: 'shortcuts.videoAnalysisPanel' },
      { keys: 'Ctrl + Shift + B', descKey: 'shortcuts.storyboardPanel' },
      { keys: 'Ctrl + Shift + P', descKey: 'shortcuts.promptEngineerPanel' },
    ],
  },
];

function Kbd({ children }: { children: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-medium rounded bg-white/10 border border-white/15 text-[var(--muted-foreground)]">
      {children}
    </kbd>
  );
}

function ShortcutKeys({ keys }: { keys: string }) {
  const parts = keys.split(' + ');
  return (
    <span className="flex items-center gap-1">
      {parts.map((part, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="text-[var(--muted-foreground)] text-xs">+</span>}
          <Kbd>{part}</Kbd>
        </span>
      ))}
    </span>
  );
}

export function ShortcutsHelp({ open, onOpenChange }: ShortcutsHelpProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('shortcuts.title')}</DialogTitle>
          <DialogDescription>
            {t('shortcuts.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-2">
          {shortcutCategories.map((category) => (
            <div key={category.titleKey}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-3">
                {t(category.titleKey)}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {t(shortcut.descKey)}
                    </span>
                    <ShortcutKeys keys={shortcut.keys} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border)] text-center">
          <span className="text-xs text-[var(--muted-foreground)]">
            {t('shortcuts.toggleOverlay', { key: '?' })}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
