import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Video,
  Music,
  Search,
  Upload,
  Grid3X3,
  List,
  Info,
  Plus,
  FolderOpen,
} from 'lucide-react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
import type { NodeType } from '@/types';

type AssetType = 'all' | 'image' | 'video' | 'audio';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail: string;
  size: string;
  dimensions?: string;
  duration?: string;
  createdAt: string;
}

// Mock assets for demonstration
const mockAssets: Asset[] = [
  {
    id: 'a1',
    name: 'Hero Banner.png',
    type: 'image',
    url: '',
    thumbnail: '',
    size: '2.4 MB',
    dimensions: '1920x1080',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'a2',
    name: 'Product Shot.jpg',
    type: 'image',
    url: '',
    thumbnail: '',
    size: '1.8 MB',
    dimensions: '1024x1024',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'a3',
    name: 'Promo Clip.mp4',
    type: 'video',
    url: '',
    thumbnail: '',
    size: '12.5 MB',
    duration: '0:15',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'a4',
    name: 'Background Music.mp3',
    type: 'audio',
    url: '',
    thumbnail: '',
    size: '3.2 MB',
    duration: '2:30',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'a5',
    name: 'Logo Design.png',
    type: 'image',
    url: '',
    thumbnail: '',
    size: '0.5 MB',
    dimensions: '512x512',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'a6',
    name: 'Narration.wav',
    type: 'audio',
    url: '',
    thumbnail: '',
    size: '8.1 MB',
    duration: '1:45',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

const typeToNodeType: Record<string, NodeType> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
};

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Video,
  audio: Music,
};

const typeColors: Record<string, string> = {
  image: 'var(--node-image)',
  video: 'var(--node-video)',
  audio: 'var(--node-audio)',
};

export function AssetsPanel() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AssetType>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const addNode = useCanvasStore((s) => s.addNode);
  const closePanel = usePanelStore((s) => s.closeLeftPanel);

  const filterTabs: { id: AssetType; label: string; icon: React.ComponentType<{ className?: string }> }[] = useMemo(() => [
    { id: 'all', label: t('assets.all'), icon: FolderOpen },
    { id: 'image', label: t('assets.images'), icon: Image },
    { id: 'video', label: t('assets.videos'), icon: Video },
    { id: 'audio', label: t('assets.audio'), icon: Music },
  ], [t]);

  const filteredAssets = useMemo(() => {
    return mockAssets.filter((asset) => {
      const matchesType = filterType === 'all' || asset.type === filterType;
      const matchesSearch = searchQuery === '' ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filterType, searchQuery]);

  const handleAddToCanvas = (asset: Asset) => {
    const nodeType = typeToNodeType[asset.type];
    const x = 200 + Math.random() * 300;
    const y = 100 + Math.random() * 200;
    addNode(nodeType, { x, y }, { label: asset.name });
    closePanel();
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: typeToNodeType[asset.type],
      label: asset.name,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const selected = selectedAsset ? mockAssets.find((a) => a.id === selectedAsset) : null;

  if (mockAssets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <FolderOpen className="h-8 w-8 text-[var(--muted-foreground)] mb-2" />
        <p className="text-sm text-[var(--muted-foreground)]">
          {t('assets.noAssets')}
        </p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {t('assets.noAssetsDesc')}
        </p>
        <button className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-xs hover:opacity-90 transition-opacity cursor-pointer border-none">
          <Upload className="h-3.5 w-3.5" />
          {t('assets.uploadFiles')}
        </button>
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
          placeholder={t('assets.searchAssets')}
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter tabs and view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-colors cursor-pointer bg-transparent border-none ${
                filterType === tab.id
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded transition-colors cursor-pointer bg-transparent border-none ${
              viewMode === 'grid' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded transition-colors cursor-pointer bg-transparent border-none ${
              viewMode === 'list' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Upload button */}
      <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors cursor-pointer bg-transparent text-xs">
        <Upload className="h-3.5 w-3.5" />
        {t('assets.uploadFiles')}
      </button>

      {/* Asset grid/list */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2">
          {filteredAssets.map((asset) => {
            const Icon = typeIcons[asset.type];
            const color = typeColors[asset.type];
            return (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
                className={`group relative rounded-xl overflow-hidden bg-[var(--card)] border transition-colors cursor-pointer ${
                  selectedAsset === asset.id
                    ? 'border-[var(--primary)]'
                    : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-square bg-[var(--muted)] flex items-center justify-center">
                  <span style={{ color }}><Icon className="h-8 w-8" /></span>
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-[11px] text-[var(--foreground)] truncate leading-tight">
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    {asset.size}
                  </p>
                </div>
                {/* Add to canvas button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCanvas(asset);
                  }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                  title={t('assets.addToCanvas')}
                >
                  <Plus className="h-3 w-3" />
                </button>
                {/* Type badge */}
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white uppercase">
                  {asset.type}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredAssets.map((asset) => {
            const Icon = typeIcons[asset.type];
            const color = typeColors[asset.type];
            return (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, asset)}
                onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
                className={`group flex items-center gap-2.5 p-2 rounded-lg transition-colors cursor-pointer ${
                  selectedAsset === asset.id
                    ? 'bg-[var(--primary)]/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                  <span style={{ color }}><Icon className="h-4 w-4" /></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--foreground)] truncate">{asset.name}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    {asset.size} {asset.dimensions ? `\u00b7 ${asset.dimensions}` : ''} {asset.duration ? `\u00b7 ${asset.duration}` : ''}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCanvas(asset);
                  }}
                  className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-transparent border-none"
                  title={t('assets.addToCanvas')}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset metadata display */}
      {selected && (
        <div className="mt-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center gap-1.5 mb-2">
            <Info className="h-3.5 w-3.5 text-[var(--primary)]" />
            <h4 className="text-xs font-medium text-[var(--foreground)]">{t('assets.assetDetails')}</h4>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('assets.name')}</span>
              <span className="text-[var(--foreground)] truncate ml-2">{selected.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('assets.type')}</span>
              <span className="text-[var(--foreground)] capitalize">{selected.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">{t('assets.size')}</span>
              <span className="text-[var(--foreground)]">{selected.size}</span>
            </div>
            {selected.dimensions && (
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">{t('assets.dimensions')}</span>
                <span className="text-[var(--foreground)]">{selected.dimensions}</span>
              </div>
            )}
            {selected.duration && (
              <div className="flex justify-between">
                <span className="text-[var(--muted-foreground)]">{t('assets.duration')}</span>
                <span className="text-[var(--foreground)]">{selected.duration}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => handleAddToCanvas(selected)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] text-xs hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <Plus className="h-3 w-3" />
            {t('assets.addToCanvas')}
          </button>
        </div>
      )}

      {/* Empty filtered state */}
      {filteredAssets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Search className="h-6 w-6 text-[var(--muted-foreground)] mb-2" />
          <p className="text-xs text-[var(--muted-foreground)]">{t('assets.noMatchingAssets')}</p>
        </div>
      )}
    </div>
  );
}
