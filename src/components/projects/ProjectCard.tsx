import { useNavigate } from 'react-router-dom';
import { MoreVertical, Copy, Trash2, Pencil, Download, ImageIcon, Video, Type, Music } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '@/stores/useProjectStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { cn } from '@/lib/utils';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  layout?: 'grid' | 'list';
}

const nodeTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  text: Type,
  audio: Music,
};

const nodeTypeColors: Record<string, string> = {
  image: 'var(--node-image)',
  video: 'var(--node-video)',
  text: 'var(--node-text)',
  audio: 'var(--node-audio)',
};

export function ProjectCard({ project, layout = 'grid' }: ProjectCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const removeProject = useProjectStore((s) => s.removeProject);
  const addProject = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renaming]);

  const timeAgo = getTimeAgo(project.updated_at);
  const nodeCount = project.canvas_data.nodes.length;

  // Compute node type summary for preview
  const nodeTypeCounts = project.canvas_data.nodes.reduce((acc, n) => {
    const type = n.type || 'text';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const dup: Project = {
      ...project,
      id: crypto.randomUUID(),
      name: `${project.name} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addProject(dup);
    addNotification({
      type: 'success',
      title: 'Project duplicated',
      message: `"${dup.name}" has been created`,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    removeProject(project.id);
    addNotification({
      type: 'info',
      title: 'Project deleted',
      message: `"${project.name}" has been removed`,
      action: {
        label: 'Undo',
        onClick: () => addProject(project),
      },
    });
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification({
      type: 'success',
      title: 'Project exported',
      message: `"${project.name}" saved to file`,
    });
  };

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setRenameValue(project.name);
    setRenaming(true);
  };

  const handleRenameConfirm = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== project.name) {
      updateProject(project.id, { name: trimmed, updated_at: new Date().toISOString() });
    }
    setRenaming(false);
  };

  if (layout === 'list') {
    return (
      <div
        onClick={() => !renaming && navigate(`/canvas/${project.id}`)}
        className="flex items-center gap-4 p-3 rounded-xl bg-[var(--card)] hover:bg-[var(--hover-overlay)] transition-all cursor-pointer group border border-transparent hover:border-[var(--border)]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' && !renaming) navigate(`/canvas/${project.id}`); }}
        aria-label={`Open project ${project.name}`}
      >
        <div className="w-16 h-12 rounded-lg bg-[var(--muted)] overflow-hidden flex-shrink-0 flex items-center justify-center">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center gap-0.5">
              {Object.entries(nodeTypeCounts).slice(0, 3).map(([type]) => {
                const Icon = nodeTypeIcons[type];
                return Icon ? (
                  <span key={type} style={{ color: nodeTypeColors[type] }}><Icon className="h-3 w-3" /></span>
                ) : null;
              })}
              {nodeCount === 0 && <span className="text-xs text-[var(--muted-foreground)]">Empty</span>}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {renaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={handleRenameConfirm}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenaming(false); }}
              onClick={(e) => e.stopPropagation()}
              className="h-7 w-full px-2 rounded-lg border border-[var(--border)] bg-[var(--input)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              aria-label="Rename project"
            />
          ) : (
            <>
              <h3 className="text-sm font-medium text-[var(--foreground)] truncate">{project.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-[var(--muted-foreground)]">{timeAgo}</p>
                {nodeCount > 0 && (
                  <span className="text-xs text-[var(--muted-foreground)]">{nodeCount} node{nodeCount > 1 ? 's' : ''}</span>
                )}
              </div>
            </>
          )}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 hover:bg-[var(--active-overlay)] transition-all cursor-pointer bg-transparent border-none"
            aria-label="Project options"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && <CardMenu onDuplicate={handleDuplicate} onRename={handleRenameStart} onExport={handleExport} onDelete={handleDelete} />}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={() => !renaming && navigate(`/canvas/${project.id}`)}
      className="group relative rounded-xl overflow-hidden bg-[var(--card)] cursor-pointer project-card-hover border border-transparent hover:border-[var(--border)]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && !renaming) navigate(`/canvas/${project.id}`); }}
      aria-label={`Open project ${project.name}`}
    >
      {/* Thumbnail area */}
      <div className="aspect-[4/3] bg-[var(--muted)] overflow-hidden relative">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {/* Mini canvas preview showing node layout */}
            {nodeCount > 0 ? (
              <div className="relative w-3/4 h-3/4">
                {project.canvas_data.nodes.slice(0, 6).map((node, i) => {
                  const Icon = nodeTypeIcons[node.type || 'text'];
                  const color = nodeTypeColors[node.type || 'text'];
                  // Normalize positions for preview
                  const nodes = project.canvas_data.nodes;
                  const minX = Math.min(...nodes.map((n) => n.position.x));
                  const maxX = Math.max(...nodes.map((n) => n.position.x));
                  const minY = Math.min(...nodes.map((n) => n.position.y));
                  const maxY = Math.max(...nodes.map((n) => n.position.y));
                  const rangeX = maxX - minX || 1;
                  const rangeY = maxY - minY || 1;
                  const x = ((node.position.x - minX) / rangeX) * 70 + 5;
                  const y = ((node.position.y - minY) / rangeY) * 70 + 5;

                  return (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="absolute w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                      }}
                    >
                      {Icon && <span style={{ color }}><Icon className="h-3.5 w-3.5" /></span>}
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[var(--muted-foreground)] opacity-40">
                <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Hover overlay with node count badge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {nodeCount > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            {nodeCount} node{nodeCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {renaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); if (e.key === 'Escape') setRenaming(false); }}
                onClick={(e) => e.stopPropagation()}
                className="h-6 w-full px-1 rounded border border-[var(--border)] bg-[var(--input)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                aria-label="Rename project"
              />
            ) : (
              <>
                <h3 className="text-sm font-medium text-[var(--card-foreground)] truncate">{project.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-[var(--muted-foreground)]">{timeAgo}</p>
                  {/* Node type indicators */}
                  <div className="flex items-center gap-0.5">
                    {Object.entries(nodeTypeCounts).map(([type, count]) => {
                      const Icon = nodeTypeIcons[type];
                      return Icon ? (
                        <div key={type} className="flex items-center gap-0.5" title={`${count} ${type} node${count > 1 ? 's' : ''}`}>
                          <span style={{ color: nodeTypeColors[type], opacity: 0.7 }}><Icon className="h-3 w-3" /></span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className={cn(
                'p-1 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--active-overlay)] transition-all cursor-pointer bg-transparent border-none',
                menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
              aria-label="Project options"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && <CardMenu onDuplicate={handleDuplicate} onRename={handleRenameStart} onExport={handleExport} onDelete={handleDelete} />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CardMenu({
  onDuplicate,
  onRename,
  onExport,
  onDelete,
}: {
  onDuplicate: (e: React.MouseEvent) => void;
  onRename: (e: React.MouseEvent) => void;
  onExport: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 shadow-xl" role="menu">
      <button
        onClick={onRename}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm text-[var(--popover-foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none text-left"
        role="menuitem"
      >
        <Pencil className="h-3.5 w-3.5" /> Rename
      </button>
      <button
        onClick={onDuplicate}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm text-[var(--popover-foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none text-left"
        role="menuitem"
      >
        <Copy className="h-3.5 w-3.5" /> Duplicate
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm text-[var(--popover-foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none text-left"
        role="menuitem"
      >
        <Download className="h-3.5 w-3.5" /> Export JSON
      </button>
      <div className="h-px bg-[var(--border)] my-1 -mx-1" role="separator" />
      <button
        onClick={onDelete}
        className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-sm text-[var(--error)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none text-left"
        role="menuitem"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}
