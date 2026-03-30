import { useCallback, useEffect, useMemo, useState, memo, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type Node,
  type Edge,
  type Viewport,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/stores/useCanvasStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { usePanelStore } from '@/stores/usePanelStore';
import { usePerformanceStore } from '@/stores/performanceStore';
import { useAutoSave, loadCanvasFromStorageSync } from '@/hooks/useAutoSave';
import { useCanvasShortcuts } from '@/hooks/useCanvasShortcuts';
import { useDragDrop } from '@/hooks/useDragDrop';
import {
  useCanvasPerformance,
  useRAFThrottle,
  areNodePropsEqual,
} from '@/hooks/useCanvasPerformance';
import { CanvasTopBar } from '@/components/canvas/CanvasTopBar';
import { CanvasBottomBar } from '@/components/canvas/CanvasBottomBar';
import { LeftSidebar } from '@/components/canvas/LeftSidebar';
import { SlidingPanel } from '@/components/canvas/panels/SlidingPanel';
import { ImageNode } from '@/components/canvas/nodes/ImageNode';
import { VideoNode } from '@/components/canvas/nodes/VideoNode';
import { TextNode } from '@/components/canvas/nodes/TextNode';
import { AudioNode } from '@/components/canvas/nodes/AudioNode';
import { GroupNode } from '@/components/canvas/nodes/GroupNode';
import { ImageEditorNode } from '@/components/canvas/nodes/ImageEditorNode';
import { DoodleNode } from '@/components/canvas/nodes/DoodleNode';
import { CompareNode } from '@/components/canvas/nodes/CompareNode';
import { NovelInputNode } from '@/components/canvas/nodes/NovelInputNode';
import { VideoAnalyzeNode } from '@/components/canvas/nodes/VideoAnalyzeNode';
import { ExtractNode } from '@/components/canvas/nodes/ExtractNode';
import { CharacterDescriptionNode } from '@/components/canvas/nodes/CharacterDescriptionNode';
import { SceneDescriptionNode } from '@/components/canvas/nodes/SceneDescriptionNode';
import { GenerateImageNode } from '@/components/canvas/nodes/GenerateImageNode';
import { StoryboardNode } from '@/components/canvas/nodes/StoryboardNode';
import { PreviewNode } from '@/components/canvas/nodes/PreviewNode';
import { LocalSaveNode } from '@/components/canvas/nodes/LocalSaveNode';
import { MaskEditorNode } from '@/components/canvas/nodes/MaskEditorNode';
import { ProcessEdge } from '@/components/canvas/edges/ProcessEdge';
import { CanvasContextMenu } from '@/components/canvas/CanvasContextMenu';
import { ShortcutsHelp } from '@/components/canvas/ShortcutsHelp';
import { OnboardingOverlay } from '@/components/canvas/OnboardingOverlay';
import { PropertiesPanelSkeleton, ChatMessageSkeleton } from '@/components/ui/Skeleton';

// Lazy load heavy panels
const ChatPanel = lazy(() =>
  import('@/components/canvas/chat/ChatPanel').then((m) => ({ default: m.ChatPanel }))
);
const NodePropertiesPanel = lazy(() =>
  import('@/components/canvas/panels/NodePropertiesPanel').then((m) => ({
    default: m.NodePropertiesPanel,
  }))
);

// Memoized node components with proper comparison functions
const MemoizedImageNode = memo(ImageNode, areNodePropsEqual);
const MemoizedVideoNode = memo(VideoNode, areNodePropsEqual);
const MemoizedTextNode = memo(TextNode, areNodePropsEqual);
const MemoizedAudioNode = memo(AudioNode, areNodePropsEqual);
const MemoizedGroupNode = memo(GroupNode, areNodePropsEqual);
const MemoizedImageEditorNode = memo(ImageEditorNode, areNodePropsEqual);
const MemoizedDoodleNode = memo(DoodleNode, areNodePropsEqual);
const MemoizedCompareNode = memo(CompareNode, areNodePropsEqual);
const MemoizedNovelInputNode = memo(NovelInputNode, areNodePropsEqual);
const MemoizedVideoAnalyzeNode = memo(VideoAnalyzeNode, areNodePropsEqual);
const MemoizedExtractNode = memo(ExtractNode, areNodePropsEqual);
const MemoizedCharacterDescriptionNode = memo(CharacterDescriptionNode, areNodePropsEqual);
const MemoizedSceneDescriptionNode = memo(SceneDescriptionNode, areNodePropsEqual);
const MemoizedGenerateImageNode = memo(GenerateImageNode, areNodePropsEqual);
const MemoizedStoryboardNode = memo(StoryboardNode, areNodePropsEqual);
const MemoizedPreviewNode = memo(PreviewNode, areNodePropsEqual);
const MemoizedLocalSaveNode = memo(LocalSaveNode, areNodePropsEqual);
const MemoizedMaskEditorNode = memo(MaskEditorNode, areNodePropsEqual);

const nodeTypes = {
  image: MemoizedImageNode,
  video: MemoizedVideoNode,
  text: MemoizedTextNode,
  audio: MemoizedAudioNode,
  group: MemoizedGroupNode,
  'image-editor': MemoizedImageEditorNode,
  'doodle-image': MemoizedDoodleNode,
  compare: MemoizedCompareNode,
  'novel-input': MemoizedNovelInputNode,
  'video-analyze': MemoizedVideoAnalyzeNode,
  'extract-characters-scenes': MemoizedExtractNode,
  'character-description': MemoizedCharacterDescriptionNode,
  'scene-description': MemoizedSceneDescriptionNode,
  'gen-image': MemoizedGenerateImageNode,
  'gen-video': MemoizedGenerateImageNode, // reuse same component
  'generate-character-image': MemoizedGenerateImageNode,
  'generate-character-video': MemoizedGenerateImageNode,
  'generate-scene-image': MemoizedGenerateImageNode,
  'generate-scene-video': MemoizedGenerateImageNode,
  'create-character': MemoizedCharacterDescriptionNode, // reuse
  'create-scene': MemoizedSceneDescriptionNode, // reuse
  'storyboard-node': MemoizedStoryboardNode,
  'preview': MemoizedPreviewNode,
  'local-save': MemoizedLocalSaveNode,
  'mask-editor': MemoizedMaskEditorNode,
};

const edgeTypes = {
  process: ProcessEdge,
};

export function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasPageInner />
    </ReactFlowProvider>
  );
}

function CanvasPageInner() {
  const { projectId } = useParams<{ projectId: string }>();
  const { screenToFlowPosition } = useReactFlow();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const selectNodes = useCanvasStore((s) => s.selectNodes);
  const setProject = useCanvasStore((s) => s.setProject);
  const loadCanvas = useCanvasStore((s) => s.loadCanvas);
  const projects = useProjectStore((s) => s.projects);
  const selectedNodeIds = useCanvasStore((s) => s.selectedNodeIds);
  const chatPanelOpen = usePanelStore((s) => s.chatPanelOpen);
  const activeLeftPanel = usePanelStore((s) => s.activeLeftPanel);
  const showMinimap = usePanelStore((s) => s.showMinimap);
  const showGrid = usePanelStore((s) => s.showGrid);
  const setZoomLevel = usePanelStore((s) => s.setZoomLevel);
  const perfSettings = usePerformanceStore((s) => s.settings);

  // Performance hooks
  const { gpuStyle } = useCanvasPerformance(nodes.length);

  // Hooks
  useAutoSave();
  const { showShortcutsHelp, setShowShortcutsHelp } = useCanvasShortcuts();
  const { handleDragOver, handleDrop } = useDragDrop();

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    // Synchronous localStorage load for instant display
    const saved = loadCanvasFromStorageSync(projectId);
    if (saved) {
      const project = projects.find((p) => p.id === projectId);
      loadCanvas(projectId, project?.name || 'Untitled Project', saved.nodes || [], saved.edges || []);
      return;
    }

    const project = projects.find((p) => p.id === projectId);
    if (project) {
      loadCanvas(projectId, project.name, project.canvas_data.nodes, project.canvas_data.edges);
    } else {
      setProject(projectId, 'Untitled Project');
    }
  }, [projectId, projects, setProject, loadCanvas]);

  const flowNodes = nodes as Node[];
  const flowEdges = edges as Edge[];

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((prev) => applyNodeChanges(changes, prev as Node[]) as typeof prev);
    },
    [setNodes],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges((prev) => applyEdgeChanges(changes, prev as Edge[]) as typeof prev);
    },
    [setEdges],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((prev) => addEdge({ ...connection, type: 'process' }, prev as Edge[]) as typeof prev);
    },
    [setEdges],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Array<{ id: string }> }) => {
      selectNodes(selectedNodes.map((n) => n.id));
    },
    [selectNodes],
  );

  // RAF-throttled viewport change handler for smooth performance
  const onViewportChange = useRAFThrottle(
    useCallback(
      (viewport: Viewport) => {
        setZoomLevel(viewport.zoom);
      },
      [setZoomLevel],
    ),
  );

  // Context menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    canvasPosition: { x: number; y: number };
  } | null>(null);

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const flowPosition = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        canvasPosition: flowPosition,
      });
    },
    [screenToFlowPosition],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const defaultEdgeOptions = useMemo(() => ({ type: 'process' }), []);

  // Hide minimap in fast mode
  const effectiveMinimap = showMinimap && !perfSettings.disableMinimap;

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--background)]">
      <CanvasTopBar />

      <div className="flex flex-1 pt-14 overflow-hidden">
        <LeftSidebar />

        {activeLeftPanel !== 'none' && <SlidingPanel />}

        {/* Canvas with GPU acceleration */}
        <div
          className="flex-1 relative"
          style={gpuStyle}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={closeContextMenu}
            onMoveStart={closeContextMenu}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            deleteKeyCode="Delete"
            className="bg-[var(--background)]"
            proOptions={{ hideAttribution: true }}
            onViewportChange={onViewportChange}
          >
            {showGrid && (
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="var(--canvas-dot)"
              />
            )}
            <Controls
              className="!bg-[var(--card)] !border-[var(--border)] !rounded-xl !shadow-lg [&>button]:!bg-[var(--card)] [&>button]:!border-[var(--border)] [&>button]:!text-[var(--foreground)] [&>button:hover]:!bg-[var(--active-overlay)]"
            />
            {effectiveMinimap && (
              <MiniMap
                className="!bg-[var(--card)] !border-[var(--border)] !rounded-xl"
                maskColor="var(--minimap-mask)"
                nodeColor="var(--primary)"
              />
            )}
          </ReactFlow>
        </div>

        {/* Lazy-loaded panels with skeleton fallbacks */}
        {chatPanelOpen && (
          <Suspense
            fallback={
              <div className="w-80 border-l border-[var(--border)] bg-[var(--chat-background)] p-4">
                <ChatMessageSkeleton />
                <ChatMessageSkeleton />
              </div>
            }
          >
            <ChatPanel />
          </Suspense>
        )}
        {!chatPanelOpen && selectedNodeIds.length === 1 && (
          <Suspense fallback={<PropertiesPanelSkeleton />}>
            <NodePropertiesPanel />
          </Suspense>
        )}
      </div>

      <CanvasBottomBar />

      {contextMenu && (
        <CanvasContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          canvasPosition={contextMenu.canvasPosition}
          onClose={closeContextMenu}
        />
      )}
      <ShortcutsHelp
        open={showShortcutsHelp}
        onOpenChange={setShowShortcutsHelp}
      />
      <OnboardingOverlay />
    </div>
  );
}
