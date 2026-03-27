import { useState } from 'react';
import { Search, Layers, GitBranch, ArrowRight } from 'lucide-react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
import { mockTemplates, templateCategories, type TemplateCategory } from '@/lib/mock-templates';
import { cn } from '@/lib/utils';
import type { Template, CanvasNode, CanvasEdge, NodeData } from '@/types';

const nodeTypeEmoji: Record<string, string> = {
  image: '\u{1F5BC}',
  video: '\u{1F3AC}',
  text: '\u{1F4DD}',
  audio: '\u{1F3B5}',
  group: '\u{1F4C1}',
};

const categoryColors: Record<string, string> = {
  Generation: 'bg-violet-500/20 text-violet-300',
  Enhancement: 'bg-emerald-500/20 text-emerald-300',
  Marketing: 'bg-amber-500/20 text-amber-300',
  Production: 'bg-sky-500/20 text-sky-300',
};

export function TemplatesPanel() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [search, setSearch] = useState('');
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);

  const filtered = mockTemplates.filter((t) => {
    const matchCategory =
      activeCategory === 'all' ||
      t.category.toLowerCase() === activeCategory;
    const matchSearch =
      search === '' ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleApply = (template: Template) => {
    // Generate fresh UUIDs for all nodes and edges to avoid conflicts
    const idMap = new Map<string, string>();
    template.canvas_data.nodes.forEach((n) => {
      idMap.set(n.id, crypto.randomUUID());
    });

    // Offset positions so template nodes don't stack on top of existing ones
    const offsetX =
      nodes.length > 0
        ? Math.max(...nodes.map((n) => n.position.x)) + 400
        : 0;
    const offsetY = 0;

    const newNodes: CanvasNode[] = template.canvas_data.nodes.map((n) => ({
      ...n,
      id: idMap.get(n.id)!,
      position: { x: n.position.x + offsetX, y: n.position.y + offsetY },
      data: { ...n.data } as NodeData,
    }));

    const newEdges: CanvasEdge[] = template.canvas_data.edges.map((e) => ({
      ...e,
      id: crypto.randomUUID(),
      source: idMap.get(e.source) ?? e.source,
      target: idMap.get(e.target) ?? e.target,
    }));

    setNodes([...nodes, ...newNodes]);
    setEdges([...edges, ...newEdges]);
    closePanel();
  };

  return (
    <div className="space-y-3">
      {/* Category filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {templateCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              'px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer border-none',
              activeCategory === cat.id
                ? 'bg-white/15 text-[var(--foreground)] font-medium'
                : 'bg-white/5 text-[var(--muted-foreground)] hover:bg-white/10'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 rounded-xl border border-[var(--border)] bg-white/5 pl-9 pr-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-white/10"
        />
      </div>

      {/* Template List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No templates found</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((template) => {
            const nodeCount = template.canvas_data.nodes.length;
            const edgeCount = template.canvas_data.edges.length;

            return (
              <div
                key={template.id}
                className="rounded-xl border border-[var(--border)] bg-white/[0.02] hover:bg-white/[0.05] transition-colors overflow-hidden group"
              >
                {/* Mini node graph preview */}
                <div className="h-16 bg-[var(--muted)] relative overflow-hidden px-3 flex items-center">
                  <div className="flex items-center gap-1.5 relative z-10">
                    {template.canvas_data.nodes.slice(0, 5).map((node, i, arr) => (
                      <div key={i} className="flex items-center gap-1">
                        <div
                          className="w-7 h-7 rounded-md bg-white/10 border border-white/5 flex items-center justify-center text-[11px] flex-shrink-0"
                          title={node.data.label}
                        >
                          {nodeTypeEmoji[node.type as string] ?? '\u{1F4E6}'}
                        </div>
                        {i < arr.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-white/20 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                    {template.canvas_data.nodes.length > 5 && (
                      <span className="text-[9px] text-[var(--muted-foreground)] ml-0.5">
                        +{template.canvas_data.nodes.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3">
                  {/* Header: name + category */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[var(--foreground)] leading-tight">
                      {template.name}
                    </h3>
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium',
                        categoryColors[template.category] ?? 'bg-white/10 text-[var(--muted-foreground)]'
                      )}
                    >
                      {template.category}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed line-clamp-2 mb-2.5">
                    {template.description}
                  </p>

                  {/* Footer: stats + button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {nodeCount} node{nodeCount !== 1 ? 's' : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        {edgeCount} connection{edgeCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => handleApply(template)}
                      className="text-[11px] px-3 py-1 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer border-none font-medium"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
