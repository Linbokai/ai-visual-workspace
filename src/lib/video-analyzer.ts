// ---------------------------------------------------------------------------
// Video Analysis Engine
// Frame extraction, scene detection, and keyframe selection
// ---------------------------------------------------------------------------

export interface ExtractedFrame {
  index: number;
  timestamp: number;
  dataUrl: string;
  histogram: number[];
}

export interface SceneBoundary {
  startFrame: number;
  endFrame: number;
  startTime: number;
  endTime: number;
  keyframeIndex: number;
}

export interface VideoAnalysisResult {
  frames: ExtractedFrame[];
  scenes: SceneBoundary[];
  keyframes: ExtractedFrame[];
  duration: number;
  width: number;
  height: number;
  fps: number;
}

export interface AnalysisProgress {
  phase: 'extracting' | 'detecting' | 'selecting' | 'complete';
  progress: number; // 0-100
  message: string;
}

type ProgressCallback = (progress: AnalysisProgress) => void;

// ---------------------------------------------------------------------------
// Frame Extraction
// ---------------------------------------------------------------------------

function computeHistogram(ctx: CanvasRenderingContext2D, w: number, h: number): number[] {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  // 64-bin histogram (R:16 + G:16 + B:16 + Luma:16)
  const hist = new Array(64).fill(0);
  const pixelCount = w * h;

  for (let i = 0; i < data.length; i += 16) {
    // Sample every 4th pixel for performance
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    hist[Math.floor(r / 16)] += 1;
    hist[16 + Math.floor(g / 16)] += 1;
    hist[32 + Math.floor(b / 16)] += 1;
    hist[48 + Math.floor(luma / 16)] += 1;
  }

  // Normalize
  const sampleCount = Math.ceil(pixelCount / 4);
  for (let i = 0; i < hist.length; i++) {
    hist[i] /= sampleCount;
  }

  return hist;
}

function histogramDifference(a: number[], b: number[]): number {
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff += Math.abs(a[i] - b[i]);
  }
  return diff;
}

async function extractFrames(
  videoSrc: string,
  intervalSeconds: number,
  onProgress: ProgressCallback,
): Promise<{ frames: ExtractedFrame[]; duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'auto';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    video.onloadedmetadata = () => {
      const { videoWidth, videoHeight, duration } = video;
      // Scale down for performance (max 320px width)
      const scale = Math.min(1, 320 / videoWidth);
      const w = Math.round(videoWidth * scale);
      const h = Math.round(videoHeight * scale);
      canvas.width = w;
      canvas.height = h;

      const frames: ExtractedFrame[] = [];
      const totalFrames = Math.floor(duration / intervalSeconds);
      let currentIndex = 0;

      const seekNext = () => {
        const timestamp = currentIndex * intervalSeconds;
        if (timestamp >= duration) {
          resolve({ frames, duration, width: videoWidth, height: videoHeight });
          return;
        }
        video.currentTime = timestamp;
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, w, h);
        const timestamp = currentIndex * intervalSeconds;
        const histogram = computeHistogram(ctx, w, h);

        // Use full resolution for the data URL
        const fullCanvas = document.createElement('canvas');
        const fullCtx = fullCanvas.getContext('2d')!;
        const fullScale = Math.min(1, 640 / video.videoWidth);
        fullCanvas.width = Math.round(video.videoWidth * fullScale);
        fullCanvas.height = Math.round(video.videoHeight * fullScale);
        fullCtx.drawImage(video, 0, 0, fullCanvas.width, fullCanvas.height);

        frames.push({
          index: currentIndex,
          timestamp,
          dataUrl: fullCanvas.toDataURL('image/jpeg', 0.85),
          histogram,
        });

        currentIndex++;
        const progress = Math.round(((currentIndex) / Math.max(totalFrames, 1)) * 60);
        onProgress({
          phase: 'extracting',
          progress: Math.min(progress, 60),
          message: `Extracting frame ${currentIndex} / ${totalFrames}`,
        });

        // Use requestAnimationFrame to avoid blocking UI
        requestAnimationFrame(seekNext);
      };

      seekNext();
    };

    video.onerror = () => reject(new Error('Failed to load video'));

    if (videoSrc.startsWith('data:') || videoSrc.startsWith('blob:')) {
      video.src = videoSrc;
    } else {
      video.src = videoSrc;
    }
  });
}

// ---------------------------------------------------------------------------
// Scene Detection
// ---------------------------------------------------------------------------

function detectScenes(
  frames: ExtractedFrame[],
  threshold: number,
  onProgress: ProgressCallback,
): SceneBoundary[] {
  if (frames.length === 0) return [];

  const scenes: SceneBoundary[] = [];
  let sceneStart = 0;

  for (let i = 1; i < frames.length; i++) {
    const diff = histogramDifference(frames[i - 1].histogram, frames[i].histogram);

    const progress = 60 + Math.round((i / frames.length) * 20);
    onProgress({
      phase: 'detecting',
      progress,
      message: `Detecting scenes... (${i}/${frames.length})`,
    });

    if (diff > threshold) {
      scenes.push({
        startFrame: sceneStart,
        endFrame: i - 1,
        startTime: frames[sceneStart].timestamp,
        endTime: frames[i - 1].timestamp,
        keyframeIndex: -1, // Will be set during keyframe selection
      });
      sceneStart = i;
    }
  }

  // Add the last scene
  scenes.push({
    startFrame: sceneStart,
    endFrame: frames.length - 1,
    startTime: frames[sceneStart].timestamp,
    endTime: frames[frames.length - 1].timestamp,
    keyframeIndex: -1,
  });

  return scenes;
}

// ---------------------------------------------------------------------------
// Keyframe Selection
// ---------------------------------------------------------------------------

function selectKeyframes(
  frames: ExtractedFrame[],
  scenes: SceneBoundary[],
  onProgress: ProgressCallback,
): ExtractedFrame[] {
  const keyframes: ExtractedFrame[] = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    // Pick the middle frame of each scene as the keyframe
    const midIndex = Math.floor((scene.startFrame + scene.endFrame) / 2);
    const keyframe = frames[midIndex];
    keyframes.push(keyframe);
    scene.keyframeIndex = midIndex;

    const progress = 80 + Math.round(((i + 1) / scenes.length) * 20);
    onProgress({
      phase: 'selecting',
      progress,
      message: `Selecting keyframes... (${i + 1}/${scenes.length})`,
    });
  }

  return keyframes;
}

// ---------------------------------------------------------------------------
// Main Analysis Function
// ---------------------------------------------------------------------------

export async function analyzeVideo(
  videoSrc: string,
  options: {
    frameInterval?: number; // seconds between frames (default: 1)
    sceneThreshold?: number; // histogram diff threshold (default: 0.3)
  } = {},
  onProgress?: ProgressCallback,
): Promise<VideoAnalysisResult> {
  const frameInterval = options.frameInterval ?? 1;
  const sceneThreshold = options.sceneThreshold ?? 0.3;
  const progress = onProgress ?? (() => {});

  progress({ phase: 'extracting', progress: 0, message: 'Starting frame extraction...' });

  const { frames, duration, width, height } = await extractFrames(
    videoSrc,
    frameInterval,
    progress,
  );

  progress({ phase: 'detecting', progress: 60, message: 'Detecting scene changes...' });

  const scenes = detectScenes(frames, sceneThreshold, progress);

  progress({ phase: 'selecting', progress: 80, message: 'Selecting keyframes...' });

  const keyframes = selectKeyframes(frames, scenes, progress);

  progress({ phase: 'complete', progress: 100, message: 'Analysis complete!' });

  return {
    frames,
    scenes,
    keyframes,
    duration,
    width,
    height,
    fps: Math.round(1 / frameInterval),
  };
}

// ---------------------------------------------------------------------------
// Export Helpers
// ---------------------------------------------------------------------------

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}
