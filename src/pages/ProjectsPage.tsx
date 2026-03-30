import { ProjectsToolbar } from '@/components/projects/ProjectsToolbar';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';
import { useMockData } from '@/hooks/useMockData';
import { useState, useRef } from 'react';
import { useProjectStore } from '@/stores/useProjectStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { motion } from 'framer-motion';
import { generateId } from '@/lib/utils';
import { Clock, Upload, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { Project } from '@/types';

export function ProjectsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);
  const projects = useProjectStore((s) => s.projects);
  const addProject = useProjectStore((s) => s.addProject);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { t } = useTranslation();

  // Load mock data for development
  useMockData();

  // Recent projects - last 4 opened/updated
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  // Export all projects as JSON
  const handleExportAll = () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-workspace-projects-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification({
      type: 'success',
      title: t('projects.projectExported'),
      message: t('projects.projectExportedMsg', { count: projects.length }),
    });
  };

  // Import projects from JSON
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        const projectList: Project[] = Array.isArray(imported) ? imported : [imported];
        let count = 0;
        projectList.forEach((p) => {
          if (p.id && p.name) {
            addProject({
              ...p,
              id: generateId(),
              created_at: p.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            count++;
          }
        });
        addNotification({
          type: 'success',
          title: t('projects.importComplete'),
          message: t('projects.importCompleteMsg', { count }),
        });
      } catch {
        addNotification({
          type: 'error',
          title: t('projects.importFailed'),
          message: t('projects.importFailedMsg'),
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1500px] mx-auto px-6 py-8"
    >
      <ProjectsToolbar onCreateClick={() => setCreateDialogOpen(true)} />

      {/* Import/Export actions */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={handleExportAll}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] bg-transparent text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer"
          aria-label={t('projects.exportAll')}
        >
          <Download className="h-3.5 w-3.5" />
          {t('projects.exportAll')}
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[var(--border)] bg-transparent text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer"
          aria-label={t('common.import')}
        >
          <Upload className="h-3.5 w-3.5" />
          {t('common.import')}
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Recent Projects Section */}
      {recentProjects.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h2 className="text-sm font-medium text-[var(--muted-foreground)]">{t('projects.recentlyUpdated')}</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {recentProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Divider */}
      {recentProjects.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted-foreground)]">{t('projects.allProjects')}</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>
      )}

      <ProjectGrid onCreateClick={() => setCreateDialogOpen(true)} />
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </motion.div>
  );
}
