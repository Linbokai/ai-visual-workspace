import { Map, Grid3x3, Maximize, HelpCircle, Undo2, Redo2, Minus, Plus, ChevronDown, Zap, Gauge, ImageIcon, Check, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { usePanelStore } from '@/stores/usePanelStore';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePerformanceStore, type PerformanceMode } from '@/stores/performanceStore';
import { useReactFlow } from '@xyflow/react';
import { useState, useRef, useEffect } from 'react';

const zoomPresets = [25, 50, 75, 100, 125, 150, 200];

export function CanvasBottomBar() {
  const showMinimap = usePanelStore((s) => s.showMinimap);
  const showGrid = usePanelStore((s) => s.showGrid);
  const toggleMinimap = usePanelStore((s) => s.toggleMinimap);
  const toggleGrid = usePanelStore((s) => s.toggleGrid);
  const zoomLevel = usePanelStore((s) => s.zoomLevel);

  const perfMode = usePerformanceStore((s) => s.mode);
  const setPerfMode = usePerformanceStore((s) => s.setMode);
  const saveStatus = usePerformanceStore((s) => s.saveStatus);

  const { fitView, zoomTo, zoomIn, zoomOut } = useReactFlow();
  const { t } = useTranslation();

  const [zoomMenuOpen, setZoomMenuOpen] = useState(false);
  const [perfMenuOpen, setPerfMenuOpen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);
  const perfMenuRef = useRef<HTMLDivElement>(null);

  const handleUndo = () => useCanvasStore.temporal.getState().undo();
  const handleRedo = () => useCanvasStore.temporal.getState().redo();
  const canUndo = useCanvasStore.temporal.getState().pastStates.length > 0;
  const canRedo = useCanvasStore.temporal.getState().futureStates.length > 0;

  const perfModeLabels: Record<PerformanceMode, { label: string; description: string }> = {
    fast: { label: t('performance.fast'), description: t('performance.fastDesc') },
    normal: { label: t('performance.normal'), description: t('performance.normalDesc') },
    quality: { label: t('performance.quality'), description: t('performance.qualityDesc') },
  };

  useEffect(() => {
    if (!zoomMenuOpen && !perfMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (zoomMenuOpen && zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setZoomMenuOpen(false);
      }
      if (perfMenuOpen && perfMenuRef.current && !perfMenuRef.current.contains(e.target as Node)) {
        setPerfMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [zoomMenuOpen, perfMenuOpen]);

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 400 });
  };

  const handleZoomPreset = (percent: number) => {
    zoomTo(percent / 100, { duration: 300 });
    setZoomMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed bottom-0 left-16 right-0 z-20 h-12 flex items-center justify-between px-4 border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm"
      role="toolbar"
      aria-label="Canvas controls"
    >
      <div className="flex items-center gap-1">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          title={`${t('common.undo')} (Ctrl+Z)`}
          aria-label={t('common.undo')}
          className={cn(
            'p-1.5 rounded-lg transition-colors bg-transparent border-none',
            canUndo
              ? 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] cursor-pointer'
              : 'text-[var(--muted-foreground)]/30 cursor-not-allowed opacity-30'
          )}
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
          className={cn(
            'p-1.5 rounded-lg transition-colors bg-transparent border-none',
            canRedo
              ? 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] cursor-pointer'
              : 'text-[var(--muted-foreground)]/30 cursor-not-allowed opacity-30'
          )}
        >
          <Redo2 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        <ToggleButton
          icon={<Map className="h-4 w-4" />}
          active={showMinimap}
          onClick={toggleMinimap}
          tooltip="Minimap (M)"
        />
        <ToggleButton
          icon={<Grid3x3 className="h-4 w-4" />}
          active={showGrid}
          onClick={toggleGrid}
          tooltip="Grid (G)"
        />
        <ToggleButton
          icon={<Maximize className="h-4 w-4" />}
          active={false}
          onClick={handleFitView}
          tooltip={`${t('canvas.fitView')} (F)`}
        />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => zoomOut({ duration: 200 })}
          title="Zoom out"
          aria-label="Zoom out"
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>

        <div className="relative" ref={zoomMenuRef}>
          <button
            onClick={() => setZoomMenuOpen(!zoomMenuOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none min-w-[52px] justify-center"
            aria-label="Zoom level"
            aria-expanded={zoomMenuOpen}
          >
            {Math.round(zoomLevel * 100)}%
            <ChevronDown className={cn('h-3 w-3 transition-transform', zoomMenuOpen && 'rotate-180')} />
          </button>
          {zoomMenuOpen && (
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-50 min-w-[100px] rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 shadow-xl">
              <button
                onClick={() => { handleFitView(); setZoomMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-[var(--primary)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none text-left font-medium"
              >
                <Maximize className="h-3 w-3" />
                {t('canvas.fitView')}
              </button>
              <div className="h-px bg-[var(--border)] my-1 -mx-1" />
              {zoomPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleZoomPreset(preset)}
                  className={cn(
                    'flex items-center w-full px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer bg-transparent border-none text-left',
                    Math.round(zoomLevel * 100) === preset
                      ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                      : 'text-[var(--popover-foreground)] hover:bg-[var(--hover-overlay)]'
                  )}
                >
                  {preset}%
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => zoomIn({ duration: 200 })}
          title="Zoom in"
          aria-label="Zoom in"
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        <SaveStatusIndicator status={saveStatus} />

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        {/* Performance mode selector */}
        <div className="relative" ref={perfMenuRef}>
          <button
            onClick={() => setPerfMenuOpen(!perfMenuOpen)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer bg-transparent border-none',
              perfMode === 'fast'
                ? 'text-[var(--warning)]'
                : perfMode === 'quality'
                  ? 'text-[var(--info)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              'hover:bg-[var(--hover-overlay)]',
            )}
            title={t('performance.normal')}
            aria-label="Performance mode"
            aria-expanded={perfMenuOpen}
          >
            {perfMode === 'fast' && <Zap className="h-3.5 w-3.5" />}
            {perfMode === 'normal' && <Gauge className="h-3.5 w-3.5" />}
            {perfMode === 'quality' && <ImageIcon className="h-3.5 w-3.5" />}
            <span>{perfModeLabels[perfMode].label}</span>
          </button>
          {perfMenuOpen && (
            <div className="absolute bottom-full mb-1 right-0 z-50 min-w-[160px] rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 shadow-xl">
              {(['fast', 'normal', 'quality'] as PerformanceMode[]).map((mode) => {
                const config = perfModeLabels[mode];
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setPerfMode(mode);
                      setPerfMenuOpen(false);
                    }}
                    className={cn(
                      'flex flex-col w-full px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer bg-transparent border-none text-left',
                      perfMode === mode
                        ? 'text-[var(--primary)] bg-[var(--primary)]/5'
                        : 'text-[var(--popover-foreground)] hover:bg-[var(--hover-overlay)]',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {mode === 'fast' && <Zap className="h-3 w-3" />}
                      {mode === 'normal' && <Gauge className="h-3 w-3" />}
                      {mode === 'quality' && <ImageIcon className="h-3 w-3" />}
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] mt-0.5 ml-4.5">
                      {config.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-[var(--border)] mx-1" />

        <button
          className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
          title={`${t('shortcuts.title')} (?)`}
          aria-label={t('shortcuts.title')}
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

function ToggleButton({
  icon,
  active,
  onClick,
  tooltip,
}: {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tooltip: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      aria-pressed={active}
      className={cn(
        'p-1.5 rounded-lg transition-colors cursor-pointer bg-transparent border-none',
        active
          ? 'text-[var(--foreground)] bg-[var(--active-overlay)]'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)]'
      )}
    >
      {icon}
    </button>
  );
}

function SaveStatusIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  const { t } = useTranslation();
  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded',
        status === 'saving' && 'text-[var(--warning)]',
        status === 'saved' && 'text-[var(--success)]',
        status === 'error' && 'text-[var(--error)]',
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{t('canvas.saving')}</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3" />
          <span>{t('canvas.saved')}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>{t('canvas.saveFailed')}</span>
        </>
      )}
    </div>
  );
}
