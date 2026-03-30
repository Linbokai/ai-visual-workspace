import { useRef } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Music, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NodeGenerateButton } from './NodeGenerateButton';
import { useCanvasStore } from '@/stores/useCanvasStore';

interface AudioNodeDataType {
  label: string;
  audioUrl: string | null;
  duration: number;
  status?: string;
  prompt?: string;
}

export function AudioNode({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as AudioNodeDataType;
  const status = nodeData.status || 'idle';
  const updateNode = useCanvasStore((s) => s.updateNode);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      updateNode(id, { audioUrl: url, duration: audio.duration, label: file.name });
    };
  };

  return (
    <div className={cn('transition-colors', selected && 'z-10')}>
      {/* ── Node card ── */}
      <div
        className={cn(
          'rounded-xl overflow-hidden bg-[var(--card)] border transition-all w-[200px]',
          selected ? 'border-[var(--node-audio)]/60' : 'border-[var(--border)]',
        )}
      >
        <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-[var(--node-audio)] !border-2 !border-[var(--card)]" />

        <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />

        {/* Title */}
        <div className="px-2.5 py-1.5 flex items-center gap-1.5">
          <Music className="h-3 w-3 text-[var(--muted-foreground)]" />
          <span className="text-[11px] text-[var(--muted-foreground)] truncate">{nodeData.label}</span>
          {!nodeData.audioUrl && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md border border-[var(--border)] text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent"
            >
              <Upload className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Audio display */}
        <div className="px-3 py-2">
          {nodeData.audioUrl ? (
            <audio src={nodeData.audioUrl} controls className="w-full h-8" style={{ minWidth: 0 }} />
          ) : status === 'processing' ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 text-[var(--node-audio)] animate-spin" />
              <span className="text-[10px] text-[var(--muted-foreground)]">Generating...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center py-3">
              <Music className="h-6 w-6 text-[var(--muted-foreground)]/30" />
            </div>
          )}
        </div>

        <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-[var(--node-audio)] !border-2 !border-[var(--card)]" />
      </div>

      {/* ── Editing panel ── */}
      {selected && (
        <div className="mt-2 rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-hidden w-[300px] -ml-[50px] shadow-xl">
          <div className="px-3 py-2 nodrag nowheel">
            <textarea
              value={nodeData.prompt || ''}
              onChange={(e) => updateNode(id, { prompt: e.target.value })}
              placeholder={t('properties.nodePromptPlaceholder', '描述你想生成的音频...')}
              className="w-full bg-transparent text-xs text-[var(--foreground)] resize-none outline-none min-h-[36px] max-h-[80px] border-none p-0 leading-relaxed placeholder:text-[var(--muted-foreground)]/40"
              rows={2}
              spellCheck={false}
            />
          </div>
          <div className="px-3 py-2 border-t border-[var(--border)] flex items-center justify-between nodrag">
            <span className="text-[11px] text-[var(--muted-foreground)]">AI 音频生成</span>
            <NodeGenerateButton nodeId={id} status={status} mode="text" />
          </div>
        </div>
      )}
    </div>
  );
}
