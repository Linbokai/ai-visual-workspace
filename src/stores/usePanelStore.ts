import { create } from 'zustand';

export type LeftPanelType = 'none' | 'add' | 'assets' | 'templates' | 'history' | 'characters' | 'advanced' | 'video-analysis' | 'storyboard' | 'prompt-engineer' | 'batch';
export type RightPanelTab = 'chat' | 'properties';

interface PanelState {
  activeLeftPanel: LeftPanelType;
  chatPanelOpen: boolean;
  propertiesPanelOpen: boolean;
  activeRightTab: RightPanelTab;
  showMinimap: boolean;
  showGrid: boolean;
  zoomLevel: number;

  toggleLeftPanel: (panel: LeftPanelType) => void;
  closeLeftPanel: () => void;
  toggleChatPanel: () => void;
  setChatPanelOpen: (open: boolean) => void;
  setPropertiesPanelOpen: (open: boolean) => void;
  setActiveRightTab: (tab: RightPanelTab) => void;
  toggleMinimap: () => void;
  toggleGrid: () => void;
  setZoomLevel: (zoom: number) => void;
}

export const usePanelStore = create<PanelState>((set) => ({
  activeLeftPanel: 'none',
  chatPanelOpen: false,
  propertiesPanelOpen: false,
  activeRightTab: 'chat',
  showMinimap: true,
  showGrid: true,
  zoomLevel: 1,

  toggleLeftPanel: (panel) =>
    set((state) => ({
      activeLeftPanel: state.activeLeftPanel === panel ? 'none' : panel,
    })),
  closeLeftPanel: () => set({ activeLeftPanel: 'none' }),
  toggleChatPanel: () =>
    set((state) => ({ chatPanelOpen: !state.chatPanelOpen })),
  setChatPanelOpen: (open) => set({ chatPanelOpen: open }),
  setPropertiesPanelOpen: (open) => set({ propertiesPanelOpen: open }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  toggleMinimap: () => set((state) => ({ showMinimap: !state.showMinimap })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
}));
