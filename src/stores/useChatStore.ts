import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  contextNodeIds: string[];

  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setContextNodes: (ids: string[]) => void;
  clearChat: () => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  contextNodeIds: [],

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  setContextNodes: (ids) => set({ contextNodeIds: ids }),
  clearChat: () => set({ messages: [], contextNodeIds: [] }),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
