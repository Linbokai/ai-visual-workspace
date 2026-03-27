import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutEntry {
  keys: string;
  description: string;
}

interface ShortcutCategory {
  title: string;
  shortcuts: ShortcutEntry[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    title: 'Selection',
    shortcuts: [
      { keys: 'Ctrl + A', description: 'Select all nodes' },
      { keys: 'Escape', description: 'Deselect all' },
      { keys: 'Click', description: 'Select node' },
      { keys: 'Shift + Click', description: 'Multi-select nodes' },
    ],
  },
  {
    title: 'Editing',
    shortcuts: [
      { keys: 'Ctrl + C', description: 'Copy selected nodes' },
      { keys: 'Ctrl + V', description: 'Paste nodes' },
      { keys: 'Ctrl + X', description: 'Cut selected nodes' },
      { keys: 'Ctrl + D', description: 'Duplicate selected nodes' },
      { keys: 'Delete', description: 'Delete selected nodes' },
      { keys: 'Backspace', description: 'Delete selected nodes' },
    ],
  },
  {
    title: 'View',
    shortcuts: [
      { keys: 'Scroll', description: 'Zoom in / out' },
      { keys: 'Click + Drag', description: 'Pan canvas' },
      { keys: '?', description: 'Toggle this help overlay' },
    ],
  },
  {
    title: 'AI & Tools',
    shortcuts: [
      { keys: 'Ctrl + /', description: 'Toggle AI chat panel' },
      { keys: 'Ctrl + Shift + V', description: 'Video Analysis panel' },
      { keys: 'Ctrl + Shift + B', description: 'Storyboard panel' },
      { keys: 'Ctrl + Shift + P', description: 'Prompt Engineer panel' },
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick reference for all available shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-2">
          {shortcutCategories.map((category) => (
            <div key={category.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-3">
                {category.title}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.keys}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {shortcut.description}
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
            Press <Kbd>?</Kbd> to toggle this overlay
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
