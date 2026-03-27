import { Search, LayoutGrid, List, Plus, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useProjectStore } from '@/stores/useProjectStore';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

export type SortOption = 'updated' | 'created' | 'name';

interface ProjectsToolbarProps {
  onCreateClick: () => void;
}

export function ProjectsToolbar({ onCreateClick }: ProjectsToolbarProps) {
  const activeTab = useProjectStore((s) => s.activeTab);
  const setActiveTab = useProjectStore((s) => s.setActiveTab);
  const searchQuery = useProjectStore((s) => s.searchQuery);
  const setSearchQuery = useProjectStore((s) => s.setSearchQuery);
  const viewMode = useProjectStore((s) => s.viewMode);
  const setViewMode = useProjectStore((s) => s.setViewMode);
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortMenuOpen]);

  const sortLabels: Record<SortOption, string> = {
    updated: 'Last Updated',
    created: 'Date Created',
    name: 'Name',
  };

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Left: Tabs */}
      <div className="flex items-center gap-1 bg-[var(--hover-overlay)] rounded-lg p-1">
        <button
          onClick={() => setActiveTab('personal')}
          aria-pressed={activeTab === 'personal'}
          className={cn(
            'px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer border-none',
            activeTab === 'personal'
              ? 'bg-[var(--active-overlay)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-transparent'
          )}
        >
          Personal
        </button>
        <button
          onClick={() => setActiveTab('team')}
          aria-pressed={activeTab === 'team'}
          className={cn(
            'px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer border-none',
            activeTab === 'team'
              ? 'bg-[var(--active-overlay)] text-[var(--foreground)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-transparent'
          )}
        >
          Team
        </button>
      </div>

      {/* Right: Search + Sort + View + Create */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search projects"
            className="h-9 w-56 rounded-xl border border-[var(--border)] bg-[var(--hover-overlay)] pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
          />
        </div>

        {/* Sort */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortMenuOpen(!sortMenuOpen)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-[var(--border)] bg-transparent text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            aria-label="Sort projects"
            aria-expanded={sortMenuOpen}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortLabels[sortBy]}
            <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', sortMenuOpen && 'rotate-180')} />
          </button>
          {sortMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 shadow-lg">
              {(Object.entries(sortLabels) as [SortOption, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortBy(key); setSortMenuOpen(false); }}
                  className={cn(
                    'flex items-center w-full px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer bg-transparent border-none text-left',
                    sortBy === key
                      ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                      : 'text-[var(--popover-foreground)] hover:bg-[var(--hover-overlay)]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-0.5 bg-[var(--hover-overlay)] rounded-lg p-0.5" role="radiogroup" aria-label="View mode">
          <button
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer border-none',
              viewMode === 'grid'
                ? 'bg-[var(--active-overlay)] text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-transparent'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer border-none',
              viewMode === 'list'
                ? 'bg-[var(--active-overlay)] text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-transparent'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Create */}
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>
    </div>
  );
}
