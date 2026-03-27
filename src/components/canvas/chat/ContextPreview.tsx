import { X, Image, Video, Type, Music } from 'lucide-react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useChatStore } from '@/stores/useChatStore';

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Video,
  text: Type,
  audio: Music,
};

export function ContextPreview() {
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const nodes = useCanvasStore((s) => s.nodes);
  const setContextNodes = useChatStore((s) => s.setContextNodes);

  const contextNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));

  if (contextNodes.length === 0) return null;

  const handleRemoveContext = (nodeId: string) => {
    const remaining = selectedNodeIds.filter((id) => id !== nodeId);
    setContextNodes(remaining);
  };

  return (
    <div className="px-3 py-2 border-t border-[var(--border)]">
      <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
        Context
      </p>
      <div className="flex gap-2 overflow-x-auto">
        {contextNodes.map((node) => {
          const Icon = typeIcons[node.type] || Image;
          const data = node.data as Record<string, unknown>;
          const thumbnail = (data.imageUrl || data.thumbnailUrl) as string | null;

          return (
            <div
              key={node.id}
              className="relative flex-shrink-0 w-14 h-14 rounded-lg bg-[var(--muted)] overflow-hidden border border-[var(--border)] group"
            >
              {thumbnail ? (
                <img src={thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
              )}
              <button
                onClick={() => handleRemoveContext(node.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--card)] border border-[var(--border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="h-2.5 w-2.5 text-[var(--muted-foreground)]" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                <p className="text-[8px] text-white truncate">{data.label as string}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
