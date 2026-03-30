import { Play, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { generateImage, AIServiceError } from '@/api/ai-service';

interface NodeGenerateButtonProps {
  nodeId: string;
  status: string;
  /** 'image' | 'video' | 'text' | 'extract' */
  mode: 'image' | 'video' | 'text' | 'extract';
}

export function NodeGenerateButton({ nodeId, status, mode }: NodeGenerateButtonProps) {
  const updateNode = useCanvasStore((s) => s.updateNode);
  const setNodeStatus = useCanvasStore((s) => s.setNodeStatus);
  const nodes = useCanvasStore((s) => s.nodes);

  const isProcessing = status === 'processing';

  const handleGenerate = async () => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const prompt = (node.data as any).prompt;
    if (!prompt && mode !== 'extract') return;

    setNodeStatus(nodeId, 'processing');
    updateNode(nodeId, { progress: 0 });

    try {
      if (mode === 'image') {
        // Simulate progress while waiting for API
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress = Math.min(progress + Math.random() * 10 + 2, 90);
          updateNode(nodeId, { progress: Math.round(progress) });
        }, 300);

        try {
          const model = (node.data as any).model || 'dall-e-3';
          const width = (node.data as any).width || 1024;
          const height = (node.data as any).height || 1024;

          const result = await generateImage({
            model,
            prompt: prompt!,
            width,
            height,
            steps: (node.data as any).samplingSteps,
            cfgScale: (node.data as any).cfgScale,
            seed: (node.data as any).seed,
          });

          clearInterval(progressInterval);
          updateNode(nodeId, {
            imageUrl: result.imageUrl,
            progress: 100,
          });
          setNodeStatus(nodeId, 'completed');
        } catch (err) {
          clearInterval(progressInterval);
          throw err;
        }
      } else if (mode === 'video') {
        // Simulate video generation (no real API yet)
        await simulateProgress(nodeId, updateNode, 5000);
        setNodeStatus(nodeId, 'completed');
      } else if (mode === 'text') {
        // Simulate text generation
        await simulateProgress(nodeId, updateNode, 2000);
        updateNode(nodeId, { content: `Generated content for: ${prompt}` });
        setNodeStatus(nodeId, 'completed');
      } else if (mode === 'extract') {
        // Simulate extraction
        await simulateProgress(nodeId, updateNode, 3000);
        setNodeStatus(nodeId, 'completed');
      }
    } catch (err) {
      const message = err instanceof AIServiceError
        ? err.message
        : err instanceof Error ? err.message : 'Generation failed';
      console.error('Generation failed:', message);
      updateNode(nodeId, { progress: 0 });
      setNodeStatus(nodeId, 'error');
    }
  };

  const handleAbort = () => {
    updateNode(nodeId, { progress: 0 });
    setNodeStatus(nodeId, 'idle');
  };

  const label = mode === 'extract' ? 'Extract' : 'Generate';

  return (
    <div className="px-2 py-1.5 border-t border-[var(--border)] nodrag">
      {isProcessing ? (
        <button
          onClick={handleAbort}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors cursor-pointer"
        >
          <Square className="h-3 w-3" />
          Stop
        </button>
      ) : (
        <button
          onClick={handleGenerate}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer border',
            status === 'error'
              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
              : status === 'completed'
                ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                : 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/30 hover:bg-[var(--primary)]/20'
          )}
        >
          <Play className="h-3 w-3" />
          {status === 'error' ? 'Retry' : status === 'completed' ? 'Regenerate' : label}
        </button>
      )}
    </div>
  );
}

function simulateProgress(
  nodeId: string,
  updateNode: (id: string, data: any) => void,
  durationMs: number,
): Promise<void> {
  return new Promise((resolve) => {
    let progress = 0;
    const steps = 20;
    const interval = durationMs / steps;
    const timer = setInterval(() => {
      progress += 100 / steps;
      if (progress >= 100) {
        clearInterval(timer);
        updateNode(nodeId, { progress: 100 });
        resolve();
      } else {
        updateNode(nodeId, { progress: Math.round(progress) });
      }
    }, interval);
  });
}
