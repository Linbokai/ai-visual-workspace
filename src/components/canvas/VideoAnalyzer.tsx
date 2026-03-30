import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Video,
  Upload,
  Play,
  Download,
  Plus,
  Layers,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/useCanvasStore';
import {
  analyzeVideo,
  downloadDataUrl,
  formatTimestamp,
  type VideoAnalysisResult,
  type AnalysisProgress,
  type ExtractedFrame,
} from '@/lib/video-analyzer';

export function VideoAnalyzer() {
  const { t } = useTranslation();
  const addNode = useCanvasStore((s) => s.addNode);
  const addEdge = useCanvasStore((s) => s.addEdge);

  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [frameInterval, setFrameInterval] = useState(1);
  const [sceneThreshold, setSceneThreshold] = useState(0.3);
  const [selectedKeyframes, setSelectedKeyframes] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError(t('videoAnalyzer.selectVideoFile'));
      return;
    }
    setError(null);
    setVideoName(file.name);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
    setAnalysisResult(null);
    setSelectedKeyframes(new Set());
  }, [t]);

  // Handle URL input
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    setError(null);
    setVideoName(urlInput.split('/').pop() || 'video');
    setVideoSrc(urlInput.trim());
    setAnalysisResult(null);
    setSelectedKeyframes(new Set());
  }, [urlInput]);

  // Start analysis
  const handleAnalyze = useCallback(async () => {
    if (!videoSrc) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeVideo(
        videoSrc,
        { frameInterval, sceneThreshold },
        setProgress,
      );
      setAnalysisResult(result);
      // Select all keyframes by default
      setSelectedKeyframes(new Set(result.keyframes.map((_, i) => i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('videoAnalyzer.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoSrc, frameInterval, sceneThreshold, t]);

  // Create a single image node from a keyframe
  const handleCreateNode = useCallback((frame: ExtractedFrame) => {
    const x = 200 + Math.random() * 400;
    const y = 100 + Math.random() * 300;
    addNode('image', { x, y }, {
      label: `Keyframe @ ${formatTimestamp(frame.timestamp)}`,
      imageUrl: frame.dataUrl,
      width: 640,
      height: 360,
      format: 'jpg',
      prompt: '',
    });
  }, [addNode]);

  // Batch create nodes from selected keyframes
  const handleBatchCreate = useCallback(() => {
    if (!analysisResult) return;

    const selected = analysisResult.keyframes.filter((_, i) => selectedKeyframes.has(i));
    if (selected.length === 0) return;

    const nodeIds: string[] = [];
    const startX = 100;
    const startY = 100;
    const spacingX = 280;

    selected.forEach((frame, i) => {
      const id = addNode('image', { x: startX + i * spacingX, y: startY }, {
        label: `Scene ${i + 1} @ ${formatTimestamp(frame.timestamp)}`,
        imageUrl: frame.dataUrl,
        width: 640,
        height: 360,
        format: 'jpg',
        prompt: '',
      });
      nodeIds.push(id);
    });

    // Connect nodes in sequence
    for (let i = 0; i < nodeIds.length - 1; i++) {
      addEdge({
        id: `${nodeIds[i]}-${nodeIds[i + 1]}`,
        source: nodeIds[i],
        target: nodeIds[i + 1],
        type: 'process',
      });
    }
  }, [analysisResult, selectedKeyframes, addNode, addEdge]);

  // Export all keyframes
  const handleExportAll = useCallback(() => {
    if (!analysisResult) return;
    analysisResult.keyframes.forEach((frame, i) => {
      downloadDataUrl(frame.dataUrl, `keyframe_${i + 1}_${formatTimestamp(frame.timestamp).replace(/[:.]/g, '-')}.jpg`);
    });
  }, [analysisResult]);

  // Toggle keyframe selection
  const toggleKeyframe = useCallback((index: number) => {
    setSelectedKeyframes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Video Input */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
          {t('videoAnalyzer.videoSource')}
        </h3>

        {/* File Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
            <Upload className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">{t('videoAnalyzer.uploadVideo')}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{t('videoAnalyzer.supportedFormats')}</p>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* URL Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder={t('videoAnalyzer.pasteVideoUrl')}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
            className="px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer border-none"
          >
            {t('videoAnalyzer.load')}
          </button>
        </div>
      </div>

      {/* Current Video */}
      {videoSrc && (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--muted)]">
            <div className="flex items-center gap-2 min-w-0">
              <Video className="h-4 w-4 text-[var(--primary)] flex-shrink-0" />
              <span className="text-xs text-[var(--foreground)] truncate">{videoName}</span>
            </div>
            <button
              onClick={() => {
                setVideoSrc(null);
                setAnalysisResult(null);
                setVideoName('');
                setError(null);
              }}
              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-transparent border-none"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <video
            src={videoSrc}
            controls
            className="w-full max-h-[200px] bg-black"
          />
        </div>
      )}

      {/* Analysis Settings */}
      {videoSrc && !isAnalyzing && (
        <div className="space-y-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>{t('videoAnalyzer.analysisSettings')}</span>
            {showSettings ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showSettings && (
            <div className="space-y-3 p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--muted-foreground)]">
                  {t('videoAnalyzer.frameInterval', { value: frameInterval })}
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={frameInterval}
                  onChange={(e) => setFrameInterval(parseFloat(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-[var(--muted-foreground)]">
                  {t('videoAnalyzer.sceneSensitivity', { value: Math.round(sceneThreshold * 100) })}
                </label>
                <input
                  type="range"
                  min={0.1}
                  max={0.8}
                  step={0.05}
                  value={sceneThreshold}
                  onChange={(e) => setSceneThreshold(parseFloat(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <Play className="h-4 w-4" />
            {t('videoAnalyzer.analyzeVideo')}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isAnalyzing && progress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">{progress.message}</span>
            <span className="text-xs text-[var(--primary)]">{progress.progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Results */}
      {analysisResult && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-[var(--muted)] text-center">
              <p className="text-lg font-semibold text-[var(--foreground)]">{analysisResult.scenes.length}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{t('videoAnalyzer.scenesLabel')}</p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--muted)] text-center">
              <p className="text-lg font-semibold text-[var(--foreground)]">{analysisResult.keyframes.length}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{t('videoAnalyzer.keyframesLabel')}</p>
            </div>
            <div className="p-2 rounded-lg bg-[var(--muted)] text-center">
              <p className="text-lg font-semibold text-[var(--foreground)]">{formatTimestamp(analysisResult.duration)}</p>
              <p className="text-[10px] text-[var(--muted-foreground)]">{t('videoAnalyzer.durationLabel')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleBatchCreate}
              disabled={selectedKeyframes.size === 0}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-30 cursor-pointer border-none"
            >
              <Layers className="h-3.5 w-3.5" />
              {t('videoAnalyzer.addNToCanvas', { count: selectedKeyframes.size })}
            </button>
            <button
              onClick={handleExportAll}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer border border-[var(--border)]"
            >
              <Download className="h-3.5 w-3.5" />
              {t('common.export')}
            </button>
          </div>

          {/* Keyframe Timeline */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
              {t('videoAnalyzer.keyframes')}
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {analysisResult.keyframes.map((frame, i) => {
                const scene = analysisResult.scenes[i];
                const isSelected = selectedKeyframes.has(i);

                return (
                  <div
                    key={frame.index}
                    className={cn(
                      'rounded-lg border overflow-hidden transition-colors cursor-pointer',
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
                    )}
                    onClick={() => toggleKeyframe(i)}
                  >
                    <div className="flex gap-2 p-2">
                      <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden bg-black">
                        <img
                          src={frame.dataUrl}
                          alt={`Keyframe ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                          <span className="text-[9px] text-white font-mono">
                            {formatTimestamp(frame.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-[var(--foreground)]">
                            {t('storyboard.scene', { index: i + 1 })}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateNode(frame);
                              }}
                              title={t('canvas.addToCanvas')}
                              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer bg-transparent border-none"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadDataUrl(frame.dataUrl, `keyframe_${i + 1}.jpg`);
                              }}
                              title={t('common.download')}
                              className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer bg-transparent border-none"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {scene && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-[var(--muted-foreground)]" />
                              <span className="text-[10px] text-[var(--muted-foreground)]">
                                {formatTimestamp(scene.startTime)} - {formatTimestamp(scene.endTime)}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <ImageIcon className="h-3 w-3 text-[var(--muted-foreground)]" />
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            {analysisResult.width}x{analysisResult.height}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
