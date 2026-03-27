import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { NodeToolbar } from './toolbar/NodeToolbar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useState } from 'react';

export function CanvasTopBar() {
  const projectName = useCanvasStore((s) => s.projectName);
  const setProjectName = useCanvasStore((s) => s.setProjectName);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(projectName);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed) setProjectName(trimmed);
    setEditing(false);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 border-b border-[var(--topbar-border)]"
      style={{
        backdropFilter: 'blur(24px)',
        background: 'var(--topbar-bg)',
      }}
    >
      {/* Left: Back + Logo + Name */}
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors no-underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <Sparkles className="h-5 w-5 text-[var(--primary)]" />
        </Link>

        {editing ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className="h-7 px-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        ) : (
          <button
            onClick={() => { setEditValue(projectName); setEditing(true); }}
            className="text-sm font-medium text-[var(--foreground)] hover:bg-[var(--hover-overlay)] px-2 py-1 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
          >
            {projectName}
          </button>
        )}
      </div>

      {/* Center: Node Toolbar */}
      <NodeToolbar />

      {/* Right: Credits + Theme */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--muted-foreground)]">
          Credits: ∞
        </span>
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
