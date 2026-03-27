import { useProjectStore } from '@/stores/useProjectStore';
import { ProjectCard } from './ProjectCard';
import { NewProjectCard } from './NewProjectCard';
import { motion } from 'framer-motion';
import { Layers, Sparkles, FolderOpen } from 'lucide-react';

interface ProjectGridProps {
  onCreateClick: () => void;
}

export function ProjectGrid({ onCreateClick }: ProjectGridProps) {
  const projects = useProjectStore((s) => s.projects);
  const searchQuery = useProjectStore((s) => s.searchQuery);
  const viewMode = useProjectStore((s) => s.viewMode);
  const activeTab = useProjectStore((s) => s.activeTab);

  const filtered = projects.filter((p) => {
    const matchTab = activeTab === 'personal' ? p.team_id === null : p.team_id !== null;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  // Empty state
  if (filtered.length === 0 && !searchQuery) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-24"
      >
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-[var(--muted)] flex items-center justify-center">
            <FolderOpen className="h-10 w-10 text-[var(--muted-foreground)]" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div className="absolute -bottom-1 -left-2 w-8 h-8 rounded-lg bg-[var(--node-video)]/10 flex items-center justify-center">
            <Layers className="h-4 w-4 text-[var(--node-video)]" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
          No projects yet
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6 text-center max-w-xs">
          Create your first project to start building with AI-powered visual tools
        </p>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <Sparkles className="h-4 w-4" />
          Create First Project
        </button>
      </motion.div>
    );
  }

  // Search empty state
  if (filtered.length === 0 && searchQuery) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--muted)] flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-[var(--foreground)] mb-1">No results found</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          No projects match "{searchQuery}"
        </p>
      </motion.div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <NewProjectCard onClick={onCreateClick} />
        {filtered.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <NewProjectCard onClick={onCreateClick} />
      {filtered.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }}
        >
          <ProjectCard project={project} layout="list" />
        </motion.div>
      ))}
    </div>
  );
}
