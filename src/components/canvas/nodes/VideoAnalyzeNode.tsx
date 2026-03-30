import { useState, useRef, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Film, Loader2, Upload, Play, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeStatusBadge } from './NodeStatusBadge';
import { NodePromptEditor } from './NodePromptEditor';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';
import type { NodeStatus } from '@/types';

interface VideoAnalyzeNodeDataType {
  label: string;
  videoUrl: string | null;
  scenes?: Array<{ timestamp: number; description: string; thumbnailUrl: string | null }>;
  keyframes?: Array<{ time: number; imageUrl: string | null }>;
  analysisStatus?: string;
  prompt?: string;
}

export function VideoAnalyzeNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as VideoAnalyzeNodeDataType;
  const status = (nodeData as any).status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const togglePanel = usePanelStore((s) => s.toggleLeftPanel);
  const { t } = useTranslation();

  const analysisStatus = nodeData.analysisStatus || 'idle';
  const keyframes = nodeData.keyframes || [];
  const scenes = nodeData.scenes || [];

  const [urlInput, setUrlInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [frameInterval, setFrameInterval] = useState(1);
  const [sceneSensitivity, setSceneSensitivity] = useState(30);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('video/')) return;
    const url = URL.createObjectURL(file);
    updateNode(id, { videoUrl: url });
  }, [id, updateNode]);

  const handleUrlLoad = useCallback(() => {
    if (!urlInput.trim()) return;
    updateNode(id, { videoUrl: urlInput.trim() });
    setUrlInput('');
  }, [id, urlInput, updateNode]);

  const handleAnalyze = useCallback(() => {
    if (!nodeData.videoUrl) return;
    updateNode(id, { analysisStatus: 'analyzing' });
    // Open video analysis panel for full analysis UI
    togglePanel('video-analysis');
    setTimeout(() => {
      updateNode(id, { analysisStatus: 'idle' });
    }, 2000);
  }, [id, nodeData.videoUrl, updateNode, togglePanel]);

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden bg-[var(--card)] border-2 transition-colors min-w-[280px]',
        selected ? 'border-cyan-500 node-selected-glow' : 'border-[var(--border)]',
        analysisStatus !== 'idle' && analysisStatus !== 'done' && 'node-processing'
      )}
      style={{ '--glow-color': '#06b6d4' } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[var(--card)]" />
      <div className="h-1 w-full bg-cyan-500" />

      <div className="p-2 space-y-2 nodrag">
        {/* Video preview or upload area */}
        {nodeData.videoUrl ? (
          <video src={nodeData.videoUrl} className="w-full h-32 rounded-lg object-cover bg-black" controls />
        ) : (
          <div
            className="w-full h-20 rounded-lg border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 hover:border-cyan-500/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
            <p className="text-[10px] text-[var(--muted-foreground)]">{t('videoAnalyzer.uploadVideo')}</p>
            <p className="text-[9px] text-[var(--muted-foreground)]">{t('videoAnalyzer.supportedFormats')}</p>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileUpload} />

        {/* URL input */}
        <div className="flex gap-1">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('videoAnalyzer.pasteVideoUrl')}
            className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-[10px] rounded px-2 py-1 border border-[var(--border)] focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <button
            onClick={handleUrlLoad}
            disabled={!urlInput.trim()}
            className="px-2 py-1 rounded bg-cyan-500 text-white text-[10px] font-medium hover:bg-cyan-600 disabled:opacity-40 cursor-pointer border-none"
          >
            {t('videoAnalyzer.load')}
          </button>
        </div>

        {/* Analysis settings toggle */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1 text-[9px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-transparent border-none"
        >
          <Settings2 className="h-3 w-3" />
          {t('videoAnalyzer.analysisSettings')}
        </button>

        {showSettings && (
          <div className="space-y-1.5 px-1">
            <div>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('videoAnalyzer.frameInterval', { value: frameInterval })}</p>
              <input type="range" className="w-full accent-cyan-500 h-1" min={0.5} max={5} step={0.5} value={frameInterval} onChange={(e) => setFrameInterval(Number(e.target.value))} />
            </div>
            <div>
              <p className="text-[9px] text-[var(--muted-foreground)]">{t('videoAnalyzer.sceneSensitivity', { value: sceneSensitivity })}</p>
              <input type="range" className="w-full accent-cyan-500 h-1" min={10} max={90} value={sceneSensitivity} onChange={(e) => setSceneSensitivity(Number(e.target.value))} />
            </div>
          </div>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!nodeData.videoUrl || analysisStatus === 'analyzing'}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer border-none',
            nodeData.videoUrl && analysisStatus !== 'analyzing'
              ? 'bg-cyan-500 text-white hover:bg-cyan-600'
              : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
          )}
        >
          {analysisStatus === 'analyzing' ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t('storyboard.analyzing')}</>
          ) : (
            <><Play className="h-3.5 w-3.5" />{t('videoAnalyzer.analyzeVideo')}</>
          )}
        </button>
      </div>

      {/* Keyframes display */}
      {keyframes.length > 0 && (
        <div className="px-2 py-1.5 border-t border-[var(--border)]">
          <p className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1">{t('videoAnalyzer.keyframes')} ({keyframes.length})</p>
          <div className="grid grid-cols-4 gap-1">
            {keyframes.slice(0, 8).map((kf, i) => (
              <div key={i} className="aspect-video rounded bg-[var(--muted)] overflow-hidden">
                {kf.imageUrl ? <img src={kf.imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-3 py-2 border-t border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Film className="h-3.5 w-3.5 text-cyan-500" />
            <p className="text-xs font-medium text-[var(--card-foreground)]">{nodeData.label}</p>
          </div>
          <div className="flex items-center gap-1">
            {scenes.length > 0 && (
              <span className="text-[9px] px-1 py-px rounded bg-cyan-500/20 text-cyan-400">{t('videoAnalyzer.scenesLabel')} {scenes.length}</span>
            )}
            <NodeStatusBadge status={status as NodeStatus} />
          </div>
        </div>
      </div>
      <NodePromptEditor nodeId={id} prompt={nodeData.prompt || ''} onChange={(prompt) => updateNode(id, { prompt })} />
      <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-[var(--card)]" />
    </div>
  );
}
