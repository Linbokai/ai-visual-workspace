import { useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { useAIModelStore } from '@/stores/aiModelStore';
import {
  streamChatCompletion,
  buildSystemPrompt,
  parseAIResponseActions,
  AIServiceError,
} from '@/api/ai-service';
import { parseMockResponse } from '@/lib/ai-actions';
import type { AIAction } from '@/lib/ai-actions';
import type { ChatMessage, ChatMessageAction } from '@/types';
import type { ChatCompletionMessage } from '@/types/ai-models';

// ---------------------------------------------------------------------------
// Map parsed action JSON to the existing AIAction type
// ---------------------------------------------------------------------------

function jsonToAIAction(raw: Record<string, unknown>): AIAction | null {
  const type = raw.type as string;
  switch (type) {
    case 'create_node':
      return {
        type: 'create_node',
        nodeType: (raw.nodeType as string) || 'image',
        data: (raw.data as Record<string, unknown>) || {},
      } as AIAction;
    case 'update_node':
      return {
        type: 'update_node',
        nodeId: raw.nodeId as string,
        data: (raw.data as Record<string, unknown>) || {},
      } as AIAction;
    case 'generate_image':
      return {
        type: 'generate_image',
        prompt: raw.prompt as string,
        width: (raw.width as number) ?? 1024,
        height: (raw.height as number) ?? 1024,
      } as AIAction;
    case 'generate_video':
      return {
        type: 'generate_video',
        prompt: raw.prompt as string,
        duration: (raw.duration as number) ?? 5,
      } as AIAction;
    case 'modify_prompt':
      return {
        type: 'modify_prompt',
        nodeId: raw.nodeId as string,
        prompt: raw.prompt as string,
      } as AIAction;
    default:
      return null;
  }
}

function actionToDescription(action: AIAction): string {
  switch (action.type) {
    case 'create_node': {
      const d = action.data as Record<string, unknown>;
      return `Create ${action.nodeType} node: "${(d.prompt as string) || (d.label as string) || action.nodeType}"`;
    }
    case 'update_node':
      return `Update node ${action.nodeId.slice(0, 8)}...`;
    case 'generate_image':
      return `Generate image: "${action.prompt}"`;
    case 'generate_video':
      return `Generate video: "${action.prompt}"`;
    case 'modify_prompt':
      return `Modify prompt for node ${action.nodeId.slice(0, 8)}...`;
    default:
      return 'Unknown action';
  }
}

// ---------------------------------------------------------------------------
// Exported hook
// ---------------------------------------------------------------------------

/** Store for raw actions keyed by message ID, referenced by ChatPanel for action cards */
export const rawActionsMap = new Map<string, AIAction[]>();

export function useChat() {
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const abortRef = useRef<AbortController | null>(null);

  /**
   * Determine if a real AI provider is configured and available.
   */
  const isRealAIAvailable = useCallback((): boolean => {
    const store = useAIModelStore.getState();
    const chatModel = store.getSelectedChatModel();
    if (!chatModel) return false;
    const provider = store.getProvider(chatModel.provider);
    if (!provider?.enabled) return false;
    if (chatModel.provider === 'local') return true;
    return (provider.apiKeys.length > 0 && provider.apiKeys.some((k) => !k.disabled));
  }, []);

  /**
   * Build conversation history from existing messages for context.
   */
  const buildHistory = useCallback((): ChatCompletionMessage[] => {
    const messages = useChatStore.getState().messages;
    // Take last 20 messages for context window efficiency
    return messages.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
  }, []);

  /**
   * Send a message with streaming AI response.
   * Falls back to mock responses if no AI provider is configured.
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      const selectedNodeIds = useCanvasStore.getState().selectedNodeIds;

      // 1. Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        context_nodes: selectedNodeIds,
        created_at: new Date().toISOString(),
        status: 'done',
      };
      addMessage(userMsg);

      // 2. Create assistant placeholder
      const aiMsgId = crypto.randomUUID();
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        status: 'streaming',
      };
      addMessage(aiMsg);
      setStreaming(true);

      // 3. Check if real AI is available
      if (!isRealAIAvailable()) {
        // Fallback to mock
        await sendMockResponse(content, selectedNodeIds, aiMsgId);
        setStreaming(false);
        return;
      }

      // 4. Real AI streaming
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const store = useAIModelStore.getState();
        const chatModel = store.getSelectedChatModel();
        if (!chatModel) throw new Error('No chat model selected');

        // Build context from selected nodes
        const canvasStore = useCanvasStore.getState();
        const contextNodes = canvasStore.nodes
          .filter((n) => selectedNodeIds.includes(n.id))
          .map((n) => ({
            id: n.id,
            type: n.type || 'unknown',
            data: n.data as Record<string, unknown>,
          }));

        const systemPrompt = buildSystemPrompt(contextNodes);
        const history = buildHistory();

        // Add the new user message
        history.push({ role: 'user', content });

        let fullContent = '';

        const result = await streamChatCompletion(
          {
            model: chatModel.id,
            messages: history,
            systemPrompt,
            temperature: 0.7,
            maxTokens: 4096,
            stream: true,
          },
          {
            onContent: (text) => {
              fullContent += text;
              useChatStore.getState().updateMessage(aiMsgId, {
                content: fullContent,
              });
            },
            onError: (error) => {
              useChatStore.getState().updateMessage(aiMsgId, {
                content: fullContent + `\n\n[Error: ${error}]`,
                status: 'error',
              });
            },
            onDone: () => {
              // Will be handled after promise resolves
            },
          },
          controller.signal,
        );

        // Parse actions from the completed response
        const parsed = parseAIResponseActions(result);
        const aiActions: AIAction[] = [];
        for (const rawAction of parsed.actions) {
          const action = jsonToAIAction(rawAction);
          if (action) aiActions.push(action);
        }

        // Build action cards
        const actionCards: ChatMessageAction[] = aiActions.map((a) => ({
          type: a.type,
          description: actionToDescription(a),
          nodeType: a.type === 'create_node' ? a.nodeType : undefined,
          nodeId:
            a.type === 'update_node' ? a.nodeId
              : a.type === 'modify_prompt' ? a.nodeId
                : undefined,
          applied: false,
        }));

        // Store raw actions
        rawActionsMap.set(aiMsgId, aiActions);

        // Update message with cleaned content (without ACTION: lines) and actions
        useChatStore.getState().updateMessage(aiMsgId, {
          content: parsed.message,
          actions: actionCards.length > 0 ? actionCards : undefined,
          status: 'done',
        });

        // Auto-execute update_node and modify_prompt actions
        for (const action of aiActions) {
          if (action.type === 'update_node' || action.type === 'modify_prompt') {
            executeAction(action);
          }
        }

        // Mark auto-executed actions as applied
        if (actionCards.length > 0) {
          const updatedCards = actionCards.map((card) =>
            card.type === 'update_node' || card.type === 'modify_prompt'
              ? { ...card, applied: true }
              : card,
          );
          useChatStore.getState().updateMessage(aiMsgId, { actions: updatedCards });
        }
      } catch (err) {
        if (controller.signal.aborted) {
          useChatStore.getState().updateMessage(aiMsgId, {
            status: 'done',
          });
        } else {
          const errorMessage =
            err instanceof AIServiceError
              ? err.message
              : err instanceof Error
                ? err.message
                : 'An unexpected error occurred';

          useChatStore.getState().updateMessage(aiMsgId, {
            content: `Sorry, I encountered an error: ${errorMessage}\n\nFalling back to offline mode.`,
            status: 'error',
          });

          // Fallback to mock on error
          // We already showed the error, so don't overwrite
        }
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [addMessage, setStreaming, isRealAIAvailable, buildHistory],
  );

  /**
   * Cancel the current streaming response.
   */
  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { sendMessage, cancelStream, isRealAIAvailable };
}

// ---------------------------------------------------------------------------
// Mock fallback (preserves original behavior)
// ---------------------------------------------------------------------------

async function sendMockResponse(
  content: string,
  selectedNodeIds: string[],
  aiMsgId: string,
) {
  const aiResponse = parseMockResponse(content, selectedNodeIds);

  // Build action cards
  const actionCards: ChatMessageAction[] = aiResponse.actions.map((a) => ({
    type: a.type,
    description: actionToDescription(a),
    nodeType: a.type === 'create_node' ? a.nodeType : undefined,
    nodeId:
      a.type === 'update_node' ? a.nodeId
        : a.type === 'modify_prompt' ? a.nodeId
          : undefined,
    applied: false,
  }));

  rawActionsMap.set(aiMsgId, aiResponse.actions);

  // Simulate streaming with interval
  const response = aiResponse.message;
  let i = 0;

  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      i += 3;
      if (i >= response.length) {
        useChatStore.getState().updateMessage(aiMsgId, {
          content: response,
          actions: actionCards.length > 0 ? actionCards : undefined,
          status: 'done',
        });
        clearInterval(interval);

        // Auto-execute update/modify actions
        for (const action of aiResponse.actions) {
          if (action.type === 'update_node' || action.type === 'modify_prompt') {
            executeAction(action);
          }
        }
        if (actionCards.length > 0) {
          const updatedCards = actionCards.map((card) =>
            card.type === 'update_node' || card.type === 'modify_prompt'
              ? { ...card, applied: true }
              : card,
          );
          useChatStore.getState().updateMessage(aiMsgId, { actions: updatedCards });
        }

        resolve();
      } else {
        useChatStore.getState().updateMessage(aiMsgId, {
          content: response.slice(0, i),
        });
      }
    }, 30);
  });
}

// ---------------------------------------------------------------------------
// Action executor (shared between real and mock flows)
// ---------------------------------------------------------------------------

function executeAction(action: AIAction): string | null {
  const store = useCanvasStore.getState();
  switch (action.type) {
    case 'create_node': {
      const selectedNodes = store.nodes.filter((n) =>
        store.selectedNodeIds.includes(n.id),
      );
      let position = { x: 400, y: 300 };
      if (selectedNodes.length > 0) {
        const ref = selectedNodes[selectedNodes.length - 1];
        position = { x: ref.position.x + 280, y: ref.position.y };
      }
      return store.addNode(action.nodeType, position, action.data);
    }
    case 'update_node':
      store.updateNode(action.nodeId, action.data);
      return action.nodeId;
    case 'modify_prompt':
      store.updateNode(action.nodeId, { prompt: action.prompt });
      return action.nodeId;
    case 'generate_image':
      return store.addNode('image', { x: 400, y: 300 }, {
        label: action.prompt.slice(0, 30),
        prompt: action.prompt,
        width: action.width ?? 512,
        height: action.height ?? 512,
        format: 'png',
        imageUrl: null,
      });
    case 'generate_video':
      return store.addNode('video', { x: 400, y: 300 }, {
        label: action.prompt.slice(0, 30),
        prompt: action.prompt,
        duration: action.duration ?? 5,
        videoUrl: null,
        thumbnailUrl: null,
      });
    default:
      return null;
  }
}

/** Execute a single action and return the created/updated node ID */
export { executeAction };
