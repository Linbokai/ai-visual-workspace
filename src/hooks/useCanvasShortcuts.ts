import { useEffect, useState } from 'react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { usePanelStore } from '@/stores/usePanelStore';

export function useCanvasShortcuts() {
  const removeNode = useCanvasStore((s) => s.removeNode);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const selectAllNodes = useCanvasStore((s) => s.selectAllNodes);
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes);
  const copyNodes = useCanvasStore((s) => s.copyNodes);
  const pasteNodes = useCanvasStore((s) => s.pasteNodes);
  const toggleChatPanel = usePanelStore((s) => s.toggleChatPanel);
  const toggleLeftPanel = usePanelStore((s) => s.toggleLeftPanel);

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const mod = e.ctrlKey || e.metaKey;

      // Delete selected nodes
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedNodeIds.forEach((id) => removeNode(id));
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Ctrl/Cmd + / to toggle chat panel
      if (mod && e.key === '/') {
        e.preventDefault();
        toggleChatPanel();
      }

      // Ctrl/Cmd + A: Select all nodes
      if (mod && e.key === 'a') {
        e.preventDefault();
        selectAllNodes();
      }

      // Ctrl/Cmd + C: Copy selected nodes
      if (mod && e.key === 'c') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          copyNodes(selectedNodeIds);
        }
      }

      // Ctrl/Cmd + V: Paste nodes from clipboard
      if (mod && e.key === 'v') {
        e.preventDefault();
        pasteNodes();
      }

      // Ctrl/Cmd + X: Cut (copy + delete)
      if (mod && e.key === 'x') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          copyNodes(selectedNodeIds);
          selectedNodeIds.forEach((id) => removeNode(id));
        }
      }

      // Ctrl/Cmd + D: Duplicate selected nodes
      if (mod && e.key === 'd') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) {
          duplicateNodes(selectedNodeIds);
        }
      }

      // Ctrl/Cmd + Z: Undo
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useCanvasStore.temporal.getState().undo();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((mod && e.key === 'Z' && e.shiftKey) || (mod && e.key === 'y')) {
        e.preventDefault();
        useCanvasStore.temporal.getState().redo();
      }

      // Ctrl/Cmd + Shift + V: Video Analysis panel
      if (mod && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        toggleLeftPanel('video-analysis');
      }

      // Ctrl/Cmd + Shift + B: Storyboard panel
      if (mod && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        toggleLeftPanel('storyboard');
      }

      // Ctrl/Cmd + Shift + P: Prompt Engineer panel
      if (mod && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        toggleLeftPanel('prompt-engineer');
      }

      // ? key: Toggle shortcuts help overlay
      if (e.key === '?' && !mod) {
        setShowShortcutsHelp((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodeIds,
    removeNode,
    clearSelection,
    selectAllNodes,
    duplicateNodes,
    copyNodes,
    pasteNodes,
    toggleChatPanel,
    toggleLeftPanel,
  ]);

  return { showShortcutsHelp, setShowShortcutsHelp };
}
