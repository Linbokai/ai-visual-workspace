import { useState, useMemo } from 'react';
import {
  Image,
  Video,
  Clock,
  Search,
  Plus,
  Eye,
  X,
  Filter,
} from 'lucide-react';
import { mockHistory } from '@/lib/mock-templates';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
import type { HistoryItem } from '@/types';

type FilterType = 'all' | 'image' | 'video';

function groupByDate(items: HistoryItem[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 86400000 * 7;

  const groups: { label: string; items: HistoryItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'This Week', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const item of items) {
    const t = new Date(item.created_at).getTime();
    if (t >= today) groups[0].items.push(item);
    else if (t >= yesterday) groups[1].items.push(item);
    else if (t >= weekAgo) groups[2].items.push(item);
    else groups[3].items.push(item);
  }

  return groups.filter((g) => g.items.length > 0);
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function HistoryPanel() {
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailItem, setDetailItem] = useState<HistoryItem | null>(null);

  const addNode = useCanvasStore((s) => s.addNode);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);

  const filteredHistory = useMemo(() => {
    return mockHistory.filter((item) => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch = searchQuery === '' ||
        (item.prompt ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filterType, searchQuery]);

  const groups = groupByDate(filteredHistory);

  const handleReuse = (item: HistoryItem) => {
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    const nodeType = item.type === 'video' ? 'video' : 'image';
    addNode(nodeType, { x, y }, {
      label: `From History: ${(item.prompt ?? 'Untitled').slice(0, 30)}`,
      prompt: item.prompt ?? '',
    });
    closePanel();
  };

  if (mockHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <Clock className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
        <p className="text-sm text-[var(--muted-foreground)]">No history yet</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">Generated results will appear here</p>
      </div>
    );
  }

  // Detail view
  if (detailItem) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setDetailItem(null)}
          className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none"
        >
          <X className="h-3 w-3" />
          Back to history
        </button>

        {/* Preview */}
        <div className="aspect-square rounded-xl bg-[var(--muted)] flex items-center justify-center overflow-hidden border border-[var(--border)]">
          {detailItem.type === 'video' ? (
            <Video className="h-12 w-12 text-[var(--node-video)]" />
          ) : (
            <Image className="h-12 w-12 text-[var(--node-image)]" />
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">Prompt</p>
            <p className="text-xs text-[var(--foreground)] leading-relaxed">
              {detailItem.prompt || 'No prompt'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">Type</p>
              <p className="text-xs text-[var(--foreground)] capitalize">{detailItem.type}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">Created</p>
              <p className="text-xs text-[var(--foreground)]">
                {formatDate(detailItem.created_at)} {formatTime(detailItem.created_at)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">Node ID</p>
              <p className="text-xs text-[var(--foreground)] font-mono truncate">{detailItem.node_id}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5">Project</p>
              <p className="text-xs text-[var(--foreground)] font-mono truncate">{detailItem.project_id}</p>
            </div>
          </div>

          <button
            onClick={() => handleReuse(detailItem)}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-xs hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Node from This
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Search history..."
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1">
        <Filter className="h-3 w-3 text-[var(--muted-foreground)]" />
        {(['all', 'image', 'video'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-2 py-1 rounded-md text-[10px] transition-colors cursor-pointer bg-transparent border-none capitalize ${
              filterType === type
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {type}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-[var(--muted-foreground)]">
          {filteredHistory.length} items
        </span>
      </div>

      {/* History groups */}
      {groups.length > 0 ? (
        <div className="space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {group.label}
                <span className="text-[10px] font-normal">({group.items.length})</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-[var(--muted)] flex items-center justify-center">
                      {item.type === 'video' ? (
                        <Video className="h-8 w-8 text-[var(--muted-foreground)]" />
                      ) : (
                        <Image className="h-8 w-8 text-[var(--muted-foreground)]" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2">
                      <p className="text-[11px] text-[var(--foreground)] line-clamp-2 leading-tight">
                        {item.prompt || 'No prompt'}
                      </p>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        {formatTime(item.created_at)}
                      </p>
                    </div>

                    {/* Type badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white uppercase">
                      {item.type}
                    </div>

                    {/* Action buttons (hover) */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setDetailItem(item)}
                        className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer border-none"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleReuse(item)}
                        className="p-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity cursor-pointer border-none"
                        title="Create node from this"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="h-6 w-6 text-[var(--muted-foreground)] mb-2" />
          <p className="text-xs text-[var(--muted-foreground)]">No matching history items</p>
        </div>
      )}
    </div>
  );
}
