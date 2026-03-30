import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useProjectStore } from '@/stores/useProjectStore';
import { generateId } from '@/lib/utils';
import type { Project } from '@/types';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const addProject = useProjectStore((s) => s.addProject);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCreate = () => {
    const trimmed = name.trim() || t('projects.untitledProject');
    const project: Project = {
      id: generateId(),
      name: trimmed,
      thumbnail: null,
      owner_id: '1',
      team_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      canvas_data: {
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [],
        edges: [],
      },
    };
    addProject(project);
    setName('');
    onOpenChange(false);
    navigate(`/canvas/${project.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('projects.createDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('projects.createDialog.description')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('projects.createDialog.placeholder')}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 rounded-lg border border-[var(--border)] bg-transparent text-sm text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCreate}
              className="h-9 px-4 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              {t('common.create')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
