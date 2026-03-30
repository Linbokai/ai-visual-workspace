import { ArrowUp, Square } from 'lucide-react';
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
          updateNode(nodeId, { imageUrl: result.imageUrl, progress: 100 });
          setNodeStatus(nodeId, 'completed');
        } catch (err) {
          clearInterval(progressInterval);
          throw err;
        }
      } else if (mode === 'video') {
        await simulateProgress(nodeId, updateNode, 5000);
        setNodeStatus(nodeId, 'completed');
      } else if (mode === 'text') {
        await simulateProgress(nodeId, updateNode, 2000);
        updateNode(nodeId, { content: `Generated content for: ${prompt}` });
        setNodeStatus(nodeId, 'completed');
      } else if (mode === 'extract') {
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

  return (
    <div className="nodrag inline-flex">
      {isProcessing ? (
        <button
          onClick={handleAbort}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all cursor-pointer"
          title="Stop"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          onClick={handleGenerate}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full transition-all cursor-pointer border',
            status === 'error'
              ? 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'
              : 'bg-[var(--primary)] text-white border-[var(--primary)] hover:opacity-90 shadow-lg shadow-[var(--primary)]/20'
          )}
          title={status === 'error' ? 'Retry' : 'Generate'}
        >
          {status === 'error' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
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
