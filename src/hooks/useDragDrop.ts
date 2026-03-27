import { useCallback } from 'react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeType } from '@/types';

function getNodeTypeFromMime(mimeType: string): NodeType | null {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return null;
}

export function useDragDrop() {
  const addNode = useCanvasStore((s) => s.addNode);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      // Get drop position relative to the canvas
      // Use a rough estimate - actual position conversion requires ReactFlow instance
      const rect = (e.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      const baseX = rect ? e.clientX - rect.left : 200;
      const baseY = rect ? e.clientY - rect.top : 200;

      files.forEach((file, index) => {
        const nodeType = getNodeTypeFromMime(file.type);
        if (!nodeType) return;

        const objectUrl = URL.createObjectURL(file);
        const offset = index * 30; // Cascade multiple files

        switch (nodeType) {
          case 'image':
            addNode('image', { x: baseX + offset, y: baseY + offset }, {
              label: file.name,
              imageUrl: objectUrl,
              width: 512,
              height: 512,
              format: file.name.split('.').pop() || 'png',
            });
            break;
          case 'video':
            addNode('video', { x: baseX + offset, y: baseY + offset }, {
              label: file.name,
              videoUrl: objectUrl,
              thumbnailUrl: null,
              duration: 0,
            });
            break;
          case 'audio':
            addNode('audio', { x: baseX + offset, y: baseY + offset }, {
              label: file.name,
              audioUrl: objectUrl,
              duration: 0,
            });
            break;
        }
      });
    },
    [addNode]
  );

  return { handleDragOver, handleDrop };
}
