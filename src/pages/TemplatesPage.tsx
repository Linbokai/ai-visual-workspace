import { useState, useMemo } from 'react';
import { Search, Plus, Trash2, LayoutGrid, List, Filter } from 'lucide-react';
import { mockTemplates } from '@/lib/mock-templates';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { cn } from '@/lib/utils';
import type { Template } from '@/types';

type Tab = 'public' | 'mine';
type View = 'grid' | 'list';

export function TemplatesPage() {
  const [tab, setTab] = useState<Tab>('public');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [templates, setTemplates] = useState(mockTemplates);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const projectId = useCanvasStore((s) => s.projectId);
  const projectName = useCanvasStore((s) => s.projectName);

  // Derive unique categories from all templates
  const categories = useMemo(() => {
    const cats = new Set(templates.map((t) => t.category));
    return ['All', ...Array.from(cats).sort()];
  }, [templates]);

  const filtered = templates.filter((t) => {
    const matchTab = tab === 'public' ? t.is_public : !t.is_public;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchTab && matchSearch && matchCategory;
  });

  const handleDelete = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateTemplate = () => {
    if (!projectId || nodes.length === 0) return;

    const newTemplate: Template = {
      id: `tmpl-${Date.now().toString(36)}`,
      name: projectName || 'Untitled Template',
      thumbnail: '',
      description: `Saved from project "${projectName}"`,
      category: 'Custom',
      canvas_data: {
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: nodes.map((n) => ({ ...n })),
        edges: edges.map((e) => ({ ...e })),
      },
      is_public: false,
      created_by: '1',
      created_at: new Date().toISOString(),
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setTab('mine');
  };

  const hasCanvasContent = nodes.length > 0;

  return (
    <div className="max-w-[1500px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">Templates</h1>
        <button
          onClick={handleCreateTemplate}
          disabled={!hasCanvasContent}
          className={cn(
            'flex items-center gap-1.5 h-9 px-4 rounded-xl text-sm font-medium transition-opacity cursor-pointer border-none',
            hasCanvasContent
              ? 'bg-[var(--primary)] text-white hover:opacity-90'
              : 'bg-white/5 text-[var(--muted-foreground)] cursor-not-allowed'
          )}
        >
          <Plus className="h-4 w-4" />
          Save as Template
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setTab('public')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer border-none',
                tab === 'public'
                  ? 'bg-white/10 text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] bg-transparent'
              )}
            >
              Public Templates
            </button>
            <button
              onClick={() => setTab('mine')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm transition-colors cursor-pointer border-none',
                tab === 'mine'
                  ? 'bg-white/10 text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] bg-transparent'
              )}
            >
              My Templates
            </button>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-[var(--muted-foreground)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-xl border border-[var(--border)] bg-white/5 px-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-white/10 appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-[var(--background)] text-[var(--foreground)]">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-xl border border-[var(--border)] bg-white/5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer border-none',
                view === 'grid'
                  ? 'bg-white/10 text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] bg-transparent'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer border-none',
                view === 'list'
                  ? 'bg-white/10 text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] bg-transparent'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--muted-foreground)] mb-4">
        {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
      </p>

      {/* Grid / List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--muted-foreground)]">No templates found</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Try adjusting your search or category filter
          </p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((t) => (
            <TemplateCard key={t.id} template={t} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <TemplateListItem key={t.id} template={t} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onDelete,
}: {
  template: Template;
  onDelete: (id: string) => void;
}) {
  const nodeTypes = template.canvas_data.nodes.reduce(
    (acc, n) => {
      acc[n.type as string] = (acc[n.type as string] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden group">
      {/* Thumbnail area */}
      <div className="h-36 bg-[var(--muted)] flex items-center justify-center">
        <div className="flex gap-2">
          {template.canvas_data.nodes.slice(0, 3).map((node, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-sm"
            >
              {node.type === 'image'
                ? '\u{1F5BC}'
                : node.type === 'video'
                  ? '\u{1F3AC}'
                  : '\u{1F4DD}'}
            </div>
          ))}
          {template.canvas_data.nodes.length > 3 && (
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
              +{template.canvas_data.nodes.length - 3}
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-[var(--card-foreground)] truncate">
              {template.name}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--muted-foreground)] inline-block mt-0.5">
              {template.category}
            </span>
          </div>
          {!template.is_public && (
            <button
              onClick={() => onDelete(template.id)}
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-transparent border-none flex-shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-2">
          {template.description}
        </p>

        {/* Content preview */}
        <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
          <span>{template.canvas_data.nodes.length} nodes</span>
          <span>&middot;</span>
          <span>{template.canvas_data.edges.length} edges</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {Object.entries(nodeTypes).map(([type, count]) => (
            <span
              key={type}
              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--muted-foreground)]"
            >
              {count} {type}
            </span>
          ))}
        </div>

        <p className="text-[9px] text-[var(--muted-foreground)] mt-2">
          {new Date(template.created_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function TemplateListItem({
  template,
  onDelete,
}: {
  template: Template;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--card)] group">
      <div className="w-20 h-14 rounded-lg bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
        <span className="text-lg">
          {template.canvas_data.nodes[0]?.type === 'image'
            ? '\u{1F5BC}'
            : template.canvas_data.nodes[0]?.type === 'video'
              ? '\u{1F3AC}'
              : '\u{1F4DD}'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-[var(--foreground)]">{template.name}</h3>
        <p className="text-xs text-[var(--muted-foreground)] truncate">{template.description}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] flex-shrink-0">
        <span>{template.canvas_data.nodes.length} nodes</span>
        <span>{template.canvas_data.edges.length} edges</span>
      </div>
      <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0 px-2 py-0.5 rounded-full bg-white/5">
        {template.category}
      </span>
      <span className="text-[10px] text-[var(--muted-foreground)] flex-shrink-0">
        {new Date(template.created_at).toLocaleDateString()}
      </span>
      {!template.is_public && (
        <button
          onClick={() => onDelete(template.id)}
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--error)] opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-transparent border-none"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
