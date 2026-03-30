import { create } from 'zustand';
import { useStore as useStoreZustand } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { temporal, type TemporalState } from 'zundo';
import type { CanvasNode, CanvasEdge, NodeType, NodeData, NodeStatus } from '@/types';
import { generateId } from '@/lib/utils';
import i18n from '@/i18n';

interface CanvasState {
  projectId: string | null;
  projectName: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodeIds: string[];
  clipboard: CanvasNode[];

  // Project
  setProject: (id: string, name: string) => void;
  setProjectName: (name: string) => void;

  // Nodes
  setNodes: (nodesOrUpdater: CanvasNode[] | ((prev: CanvasNode[]) => CanvasNode[])) => void;
  addNode: (type: NodeType, position: { x: number; y: number }, data?: Partial<NodeData>) => string;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;
  duplicateNodes: (ids: string[]) => void;

  // Edges
  setEdges: (edgesOrUpdater: CanvasEdge[] | ((prev: CanvasEdge[]) => CanvasEdge[])) => void;
  addEdge: (edge: CanvasEdge) => void;
  removeEdge: (id: string) => void;

  // Insert node on edge
  insertNodeOnEdge: (edgeId: string, nodeType: NodeType, position: { x: number; y: number }) => string;

  // Selection
  selectNodes: (ids: string[]) => void;
  selectAllNodes: () => void;
  clearSelection: () => void;

  // Clipboard
  copyNodes: (ids: string[]) => void;
  pasteNodes: () => void;

  // Canvas data
  loadCanvas: (projectId: string, name: string, nodes: CanvasNode[], edges: CanvasEdge[]) => void;
}

const createDefaultNodeData = (type: NodeType): NodeData => {
  const t = (key: string) => i18n.t(key);
  switch (type) {
    case 'image':
      return { label: t('nodeDefaults.newImage'), imageUrl: null, width: 512, height: 512, format: 'png', prompt: '', model: 'midjourney' as const, resolutionPreset: '512x512' as const, samplingSteps: 20, cfgScale: 7, seed: -1, progress: 0, showComparison: false };
    case 'image-editor':
      return { label: t('nodeDefaults.imageEditor'), imageUrl: null, width: 512, height: 512, format: 'png', prompt: '', brightness: 100, contrast: 100, saturation: 100, blur: 0, activeFilter: 'none' };
    case 'doodle-image':
      return { label: t('nodeDefaults.doodleToImage'), imageUrl: null, doodleDataUrl: null, width: 512, height: 512, format: 'png', prompt: '', brushSize: 4, brushColor: '#ffffff' };
    case 'video':
      return { label: t('nodeDefaults.newVideo'), videoUrl: null, thumbnailUrl: null, duration: 5, prompt: '', model: 'sora' as const, fps: 24, resolution: '1080p', cameraMotion: 'none' as const, progress: 0 };
    case 'doodle-video':
      return { label: t('nodeDefaults.doodleToImage'), videoUrl: null, thumbnailUrl: null, duration: 0, prompt: '' };
    case 'text':
      return { label: t('nodeDefaults.newText'), content: '', prompt: '' };
    case 'audio':
      return { label: t('nodeDefaults.newAudio'), audioUrl: null, duration: 0, prompt: '' };
    case 'compare':
      return { label: t('nodeDefaults.compare'), imageUrlA: null, imageUrlB: null, labelA: t('properties.before'), labelB: t('properties.after'), splitPosition: 50, prompt: '' };
    case 'novel-input':
      return { label: t('nodeDefaults.novelInput'), content: '', prompt: '', wordCount: 0 };
    case 'video-analyze':
      return { label: t('nodeDefaults.videoAnalyze'), videoUrl: null, scenes: [], keyframes: [], analysisStatus: 'idle', prompt: '' };
    case 'extract-characters-scenes':
      return { label: t('nodeDefaults.extractCharactersScenes'), sourceText: '', characters: [], scenes: [], prompt: '' };
    case 'character-description':
      return { label: t('nodeDefaults.characterDescription'), character: null, description: '', prompt: '' };
    case 'scene-description':
      return { label: t('nodeDefaults.sceneDescription'), scene: null, description: '', prompt: '' };
    case 'gen-image':
      return { label: t('nodeDefaults.aiImage'), imageUrl: null, width: 1024, height: 1024, format: 'png', prompt: '', model: 'jimeng-4.5' as const, progress: 0 };
    case 'gen-video':
      return { label: t('nodeDefaults.aiVideo'), videoUrl: null, thumbnailUrl: null, duration: 5, prompt: '', model: 'jimeng-video-3.5' as const, progress: 0 };
    case 'generate-character-image':
      return { label: t('nodeDefaults.characterImage'), character: null, imageUrl: null, prompt: '', model: 'midjourney' as const, progress: 0 };
    case 'generate-character-video':
      return { label: t('nodeDefaults.characterVideo'), character: null, videoUrl: null, prompt: '', model: 'sora' as const, duration: 5, progress: 0 };
    case 'generate-scene-image':
      return { label: t('nodeDefaults.sceneImage'), scene: null, imageUrl: null, prompt: '', model: 'midjourney' as const, progress: 0 };
    case 'generate-scene-video':
      return { label: t('nodeDefaults.sceneVideo'), scene: null, videoUrl: null, prompt: '', model: 'sora' as const, duration: 5, progress: 0 };
    case 'create-character':
      return { label: t('nodeDefaults.createCharacter'), character: null, referenceImages: [], notes: '', prompt: '' };
    case 'create-scene':
      return { label: t('nodeDefaults.createScene'), scene: null, referenceImages: [], notes: '', prompt: '' };
    case 'storyboard-node':
      return { label: t('nodeDefaults.storyboard'), shots: [], prompt: '' };
    case 'preview':
      return { label: t('nodeDefaults.preview'), mediaUrl: null, mediaType: 'image' as const, prompt: '' };
    case 'local-save':
      return { label: t('nodeDefaults.localSave'), savePath: '', format: 'png', autoSave: false, lastSavedAt: null, prompt: '' };
    case 'mask-editor':
      return { label: t('nodeDefaults.maskEditor'), imageUrl: null, maskDataUrl: null, brushSize: 20, prompt: '', width: 512, height: 512 };
    case 'group':
      return { label: t('nodeDefaults.group'), content: '', prompt: '' };
    default:
      return { label: t('nodeDefaults.newNode'), content: '', prompt: '' };
  }
};

const DUPLICATE_OFFSET = 30;

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector(temporal((set) => ({
    projectId: null,
    projectName: '',
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    clipboard: [],

    setProject: (id, name) => set({ projectId: id, projectName: name }),
    setProjectName: (name) => set({ projectName: name }),

    setNodes: (nodesOrUpdater) =>
      set((state) => ({
        nodes: typeof nodesOrUpdater === 'function' ? nodesOrUpdater(state.nodes) : nodesOrUpdater,
      })),
    addNode: (type, position, data) => {
      const id = generateId();
      const newNode: CanvasNode = {
        id,
        type,
        position,
        data: { ...createDefaultNodeData(type), ...data } as NodeData,
        status: 'idle',
      };
      set((state) => ({ nodes: [...state.nodes, newNode] }));
      return id;
    },
    updateNode: (id, data) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...data } as NodeData } : n
        ),
      })),
    removeNode: (id) =>
      set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== id),
        edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        selectedNodeIds: state.selectedNodeIds.filter((nid) => nid !== id),
      })),
    setNodeStatus: (id, status) =>
      set((state) => ({
        nodes: state.nodes.map((n) =>
          n.id === id ? { ...n, status } : n
        ),
      })),

    duplicateNodes: (ids) =>
      set((state) => {
        const idSet = new Set(ids);
        const nodesToDuplicate = state.nodes.filter((n) => idSet.has(n.id));
        if (nodesToDuplicate.length === 0) return state;

        const idMap = new Map<string, string>();
        nodesToDuplicate.forEach((n) => {
          idMap.set(n.id, generateId());
        });

        const newNodes: CanvasNode[] = nodesToDuplicate.map((n) => ({
          ...n,
          id: idMap.get(n.id)!,
          position: {
            x: n.position.x + DUPLICATE_OFFSET,
            y: n.position.y + DUPLICATE_OFFSET,
          },
          data: { ...n.data } as NodeData,
          status: 'idle' as NodeStatus,
        }));

        const newEdges: CanvasEdge[] = state.edges
          .filter((e) => idSet.has(e.source) && idSet.has(e.target))
          .map((e) => ({
            ...e,
            id: generateId(),
            source: idMap.get(e.source)!,
            target: idMap.get(e.target)!,
          }));

        return {
          nodes: [...state.nodes, ...newNodes],
          edges: [...state.edges, ...newEdges],
          selectedNodeIds: newNodes.map((n) => n.id),
        };
      }),

    setEdges: (edgesOrUpdater) =>
      set((state) => ({
        edges: typeof edgesOrUpdater === 'function' ? edgesOrUpdater(state.edges) : edgesOrUpdater,
      })),
    addEdge: (edge) => set((state) => ({ edges: [...state.edges, edge] })),
    removeEdge: (id) =>
      set((state) => ({
        edges: state.edges.filter((e) => e.id !== id),
      })),

    insertNodeOnEdge: (edgeId, nodeType, position) => {
      const state = useCanvasStore.getState();
      const edge = state.edges.find((e) => e.id === edgeId);
      if (!edge) return '';

      const newNodeId = generateId();
      const newNode: CanvasNode = {
        id: newNodeId,
        type: nodeType,
        position,
        data: { ...createDefaultNodeData(nodeType) } as NodeData,
        status: 'idle',
      };

      const newEdge1: CanvasEdge = {
        id: `${edge.source}-${newNodeId}`,
        source: edge.source,
        target: newNodeId,
        type: 'process',
      };
      const newEdge2: CanvasEdge = {
        id: `${newNodeId}-${edge.target}`,
        source: newNodeId,
        target: edge.target,
        type: 'process',
      };

      set((s) => ({
        nodes: [...s.nodes, newNode],
        edges: [...s.edges.filter((e) => e.id !== edgeId), newEdge1, newEdge2],
      }));

      return newNodeId;
    },

    selectNodes: (ids) => set({ selectedNodeIds: ids }),
    selectAllNodes: () =>
      set((state) => ({
        selectedNodeIds: state.nodes.map((n) => n.id),
      })),
    clearSelection: () => set({ selectedNodeIds: [] }),

    copyNodes: (ids) =>
      set((state) => {
        const idSet = new Set(ids);
        const nodesToCopy = state.nodes.filter((n) => idSet.has(n.id));
        return { clipboard: nodesToCopy.map((n) => ({ ...n, data: { ...n.data } as NodeData })) };
      }),

    pasteNodes: () =>
      set((state) => {
        if (state.clipboard.length === 0) return state;

        const idMap = new Map<string, string>();
        state.clipboard.forEach((n) => {
          idMap.set(n.id, generateId());
        });

        const clipboardIdSet = new Set(state.clipboard.map((n) => n.id));

        const newNodes: CanvasNode[] = state.clipboard.map((n) => ({
          ...n,
          id: idMap.get(n.id)!,
          position: {
            x: n.position.x + DUPLICATE_OFFSET,
            y: n.position.y + DUPLICATE_OFFSET,
          },
          data: { ...n.data } as NodeData,
          status: 'idle' as NodeStatus,
        }));

        const newEdges: CanvasEdge[] = state.edges
          .filter((e) => clipboardIdSet.has(e.source) && clipboardIdSet.has(e.target))
          .map((e) => ({
            ...e,
            id: generateId(),
            source: idMap.get(e.source)!,
            target: idMap.get(e.target)!,
          }));

        // Update clipboard positions so subsequent pastes keep offsetting
        const updatedClipboard: CanvasNode[] = state.clipboard.map((n) => ({
          ...n,
          position: {
            x: n.position.x + DUPLICATE_OFFSET,
            y: n.position.y + DUPLICATE_OFFSET,
          },
          data: { ...n.data } as NodeData,
        }));

        return {
          nodes: [...state.nodes, ...newNodes],
          edges: [...state.edges, ...newEdges],
          selectedNodeIds: newNodes.map((n) => n.id),
          clipboard: updatedClipboard,
        };
      }),

    loadCanvas: (projectId, name, nodes, edges) =>
      set({ projectId, projectName: name, nodes, edges, selectedNodeIds: [] }),
  }), {
    partialize: (state) => ({
      nodes: state.nodes,
      edges: state.edges,
    }),
    limit: 100,
  }))
);

export const useCanvasTemporalStore = <T>(
  selector: (state: TemporalState<Pick<CanvasState, 'nodes' | 'edges'>>) => T,
) => useStoreZustand(useCanvasStore.temporal, selector);
