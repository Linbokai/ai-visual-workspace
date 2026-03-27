import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface NewProjectCardProps {
  onClick: () => void;
}

export function NewProjectCard({ onClick }: NewProjectCardProps) {
  const { t } = useTranslation();

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className="aspect-[4/3] rounded-xl border-2 border-dashed border-[var(--border)] bg-transparent flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer group"
      aria-label={t('projects.newProject')}
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--hover-overlay)] group-hover:bg-[var(--primary)]/10 flex items-center justify-center transition-colors">
        <Plus className="h-6 w-6" />
      </div>
      <span className="text-sm font-medium">{t('projects.newProject')}</span>
    </motion.button>
  );
}
