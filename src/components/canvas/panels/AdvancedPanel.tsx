import { useState } from 'react';
import {
  Grid3X3,
  Magnet,
  Download,
  FileJson,
  Image,
  Zap,
  Monitor,
  Sparkles,
  Play,
  Bug,
  ChevronDown,
  Settings,
  Layers,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePanelStore } from '@/stores/usePanelStore';
import { useCanvasStore } from '@/stores/useCanvasStore';

type PerformanceMode = 'fast' | 'normal' | 'quality';

interface CanvasSettings {
  gridSize: number;
  snapToGrid: boolean;
  backgroundColor: string;
}

export function AdvancedPanel() {
  const { t } = useTranslation();
  const showGrid = usePanelStore((s) => s.showGrid);
  const toggleGrid = usePanelStore((s) => s.toggleGrid);
  const showMinimap = usePanelStore((s) => s.showMinimap);
  const toggleMinimap = usePanelStore((s) => s.toggleMinimap);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>('normal');
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    gridSize: 20,
    snapToGrid: false,
    backgroundColor: '#0a0a1a',
  });
  const [_showDebug, _setShowDebug] = useState(false);
  const [batchCount, setBatchCount] = useState(4);
  const [batchRunning, setBatchRunning] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    canvas: true,
    export: false,
    performance: false,
    batch: false,
    debug: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleExportPNG = () => {
    console.log('Export as PNG');
  };

  const handleExportJSON = () => {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workflow.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchStart = () => {
    setBatchRunning(true);
    setTimeout(() => setBatchRunning(false), 3000);
  };

  const performanceModes: { value: PerformanceMode; labelKey: string; descKey: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'fast', labelKey: 'advanced.perfFast', descKey: 'advanced.perfFastDesc', icon: Zap },
    { value: 'normal', labelKey: 'advanced.perfNormal', descKey: 'advanced.perfNormalDesc', icon: Monitor },
    { value: 'quality', labelKey: 'advanced.perfQuality', descKey: 'advanced.perfQualityDesc', icon: Sparkles },
  ];

  const bgPresets = [
    { labelKey: 'advanced.bgDark', value: '#0a0a1a' },
    { labelKey: 'advanced.bgCharcoal', value: '#1a1a2e' },
    { labelKey: 'advanced.bgNavy', value: '#0f1729' },
    { labelKey: 'advanced.bgBlack', value: '#000000' },
    { labelKey: 'advanced.bgLight', value: '#f5f5f5' },
  ];

  const perfModeLabelMap: Record<PerformanceMode, string> = {
    fast: 'advanced.perfFast',
    normal: 'advanced.perfNormal',
    quality: 'advanced.perfQuality',
  };

  // Debug info
  const debugInfo: { labelKey: string; value: number; colorKey?: string }[] = [
    { labelKey: 'advanced.totalNodes', value: nodes.length },
    { labelKey: 'advanced.totalEdges', value: edges.length },
    { labelKey: 'advanced.imageNodes', value: nodes.filter((n) => n.type === 'image').length },
    { labelKey: 'advanced.videoNodes', value: nodes.filter((n) => n.type === 'video').length },
    { labelKey: 'advanced.textNodes', value: nodes.filter((n) => n.type === 'text').length },
    { labelKey: 'advanced.audioNodes', value: nodes.filter((n) => n.type === 'audio').length },
    { labelKey: 'advanced.processingCount', value: nodes.filter((n) => n.status === 'processing').length, colorKey: 'warning' },
    { labelKey: 'advanced.completed', value: nodes.filter((n) => n.status === 'completed').length },
    { labelKey: 'advanced.errors', value: nodes.filter((n) => n.status === 'error').length, colorKey: 'error' },
  ];

  return (
    <div className="space-y-1">
      {/* Canvas Settings */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggleSection('canvas')}
          className="w-full flex items-center gap-2 p-3 text-left cursor-pointer bg-transparent border-none hover:bg-white/5 transition-colors"
        >
          <Settings className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">{t('advanced.canvasSettings')}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${expandedSections.canvas ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.canvas && (
          <div className="px-3 pb-3 space-y-3">
            {/* Grid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Grid3X3 className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--foreground)]">{t('advanced.showGrid')}</span>
              </div>
              <button
                onClick={toggleGrid}
                className={`w-8 h-4.5 rounded-full transition-colors cursor-pointer border-none relative ${
                  showGrid ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
                }`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  showGrid ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Grid Size */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-[var(--muted-foreground)]">{t('advanced.gridSize', { value: canvasSettings.gridSize })}</span>
              </div>
              <input
                type="range"
                className="w-full accent-[var(--primary)] h-1"
                min={10}
                max={50}
                step={5}
                value={canvasSettings.gridSize}
                onChange={(e) => setCanvasSettings({ ...canvasSettings, gridSize: Number(e.target.value) })}
              />
            </div>

            {/* Snap to Grid */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Magnet className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--foreground)]">{t('advanced.snapToGrid')}</span>
              </div>
              <button
                onClick={() => setCanvasSettings({ ...canvasSettings, snapToGrid: !canvasSettings.snapToGrid })}
                className={`w-8 h-4.5 rounded-full transition-colors cursor-pointer border-none relative ${
                  canvasSettings.snapToGrid ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
                }`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  canvasSettings.snapToGrid ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Minimap */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--foreground)]">{t('advanced.minimap')}</span>
              </div>
              <button
                onClick={toggleMinimap}
                className={`w-8 h-4.5 rounded-full transition-colors cursor-pointer border-none relative ${
                  showMinimap ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
                }`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  showMinimap ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            {/* Background Color */}
            <div>
              <span className="text-[11px] text-[var(--muted-foreground)] block mb-1">{t('advanced.background')}</span>
              <div className="flex gap-1">
                {bgPresets.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setCanvasSettings({ ...canvasSettings, backgroundColor: bg.value })}
                    className={`flex-1 text-[9px] py-1 rounded border transition-colors cursor-pointer ${
                      canvasSettings.backgroundColor === bg.value
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50'
                    }`}
                    style={{ backgroundColor: bg.value + '40' }}
                  >
                    {t(bg.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggleSection('export')}
          className="w-full flex items-center gap-2 p-3 text-left cursor-pointer bg-transparent border-none hover:bg-white/5 transition-colors"
        >
          <Download className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">{t('advanced.export')}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${expandedSections.export ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.export && (
          <div className="px-3 pb-3 space-y-2">
            <button
              onClick={handleExportPNG}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Image className="h-4 w-4 text-[var(--node-image)]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t('advanced.exportPNG')}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{t('advanced.exportPNGDesc')}</p>
              </div>
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <FileJson className="h-4 w-4 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--foreground)]">{t('advanced.exportWorkflowJSON')}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{t('advanced.exportWorkflowJSONDesc')}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Performance Mode */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggleSection('performance')}
          className="w-full flex items-center gap-2 p-3 text-left cursor-pointer bg-transparent border-none hover:bg-white/5 transition-colors"
        >
          <Zap className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">{t('advanced.performance')}</span>
          <span className="text-[10px] text-[var(--primary)] mr-1">{t(perfModeLabelMap[performanceMode])}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${expandedSections.performance ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.performance && (
          <div className="px-3 pb-3 space-y-1.5">
            {performanceModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  onClick={() => setPerformanceMode(mode.value)}
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors cursor-pointer border text-left ${
                    performanceMode === mode.value
                      ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                      : 'bg-transparent border-transparent hover:bg-white/5 text-[var(--foreground)]'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{t(mode.labelKey)}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{t(mode.descKey)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Batch Processing */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggleSection('batch')}
          className="w-full flex items-center gap-2 p-3 text-left cursor-pointer bg-transparent border-none hover:bg-white/5 transition-colors"
        >
          <Play className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">{t('advanced.batchProcessing')}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${expandedSections.batch ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.batch && (
          <div className="px-3 pb-3 space-y-2">
            <div>
              <span className="text-[11px] text-[var(--muted-foreground)] block mb-1">
                {t('advanced.parallelTasks', { count: batchCount })}
              </span>
              <input
                type="range"
                className="w-full accent-[var(--primary)] h-1"
                min={1}
                max={8}
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
              />
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)]">
              {t('advanced.batchDesc')}
            </p>
            <button
              onClick={handleBatchStart}
              disabled={batchRunning}
              className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors cursor-pointer border-none ${
                batchRunning
                  ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              {batchRunning ? t('advanced.processing') : t('advanced.runAllNodes')}
            </button>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <button
          onClick={() => toggleSection('debug')}
          className="w-full flex items-center gap-2 p-3 text-left cursor-pointer bg-transparent border-none hover:bg-white/5 transition-colors"
        >
          <Bug className="h-4 w-4 text-[var(--primary)]" />
          <span className="text-sm font-medium text-[var(--foreground)] flex-1">{t('advanced.debugInfo')}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ${expandedSections.debug ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.debug && (
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-[var(--muted)] p-2.5 space-y-1 font-mono">
              {debugInfo.map((item) => (
                <div key={item.labelKey} className="flex justify-between text-[10px]">
                  <span className="text-[var(--muted-foreground)]">{t(item.labelKey)}</span>
                  <span className={`${
                    item.colorKey === 'error' && item.value > 0
                      ? 'text-[var(--error)]'
                      : item.colorKey === 'warning' && item.value > 0
                        ? 'text-[var(--warning)]'
                        : 'text-[var(--foreground)]'
                  }`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
