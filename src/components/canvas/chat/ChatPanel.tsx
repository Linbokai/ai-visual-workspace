import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Send, Mic, Paperclip, Image, Video, Type, Music, Wand2, Eye, Check, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePanelStore } from '@/stores/usePanelStore';
import { useChatStore } from '@/stores/useChatStore';
import { useCanvasStore } from '@/stores/useCanvasStore';
import { WelcomeMessage } from './WelcomeMessage';
import { ModelSelector } from './ModelSelector';
import { ContextPreview } from './ContextPreview';
import { useChat, rawActionsMap, executeAction } from '@/hooks/useChat';
import type { AIAction } from '@/lib/ai-actions';
import type { ChatMessageAction } from '@/types';

const nodeTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Video,
  text: Type,
  audio: Music,
};

export function ChatPanel() {
  const setChatOpen = usePanelStore((s) => s.setChatPanelOpen);
  const messages = useChatStore((s) => s.messages);
  const clearChat = useChatStore((s) => s.clearChat);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('default');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const { sendMessage, cancelStream } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleApplyAction = useCallback(
    (msgId: string, actionIndex: number, action: AIAction) => {
      const nodeId = executeAction(action);
      if (nodeId) {
        useCanvasStore.getState().selectNodes([nodeId]);
      }
      const state = useChatStore.getState();
      const msg = state.messages.find((m) => m.id === msgId);
      if (msg?.actions) {
        const updated = [...msg.actions];
        updated[actionIndex] = { ...updated[actionIndex], applied: true, nodeId: nodeId || undefined };
        state.updateMessage(msgId, { actions: updated });
      }
    },
    [],
  );

  const handleViewOnCanvas = useCallback((nodeId: string | undefined) => {
    if (!nodeId) return;
    useCanvasStore.getState().selectNodes([nodeId]);
  }, []);

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content || isStreaming) return;
    setInput('');
    sendMessage(content);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="w-[380px] h-full border-l border-[var(--border)] bg-[var(--chat-background)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-[var(--foreground)]">{t('canvas.aiChat')}</h2>
          {isStreaming && (
            <span className="text-[10px] text-[var(--primary)] animate-pulse">{t('canvas.streaming')}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            title={t('canvas.newChat')}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setChatOpen(false)}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <WelcomeMessage onQuickAction={(prompt) => handleSend(prompt)} />
        )}

        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.15) }}
            className={
              msg.role === 'user'
                ? 'flex justify-end'
                : 'flex justify-start'
            }
          >
            <div
              className={
                msg.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 bg-[var(--primary)] text-white text-sm'
                  : 'max-w-[85%] rounded-2xl rounded-bl-md px-3 py-2 bg-[var(--hover-overlay)] text-[var(--foreground)] text-sm'
              }
            >
              {msg.content}
              {msg.status === 'streaming' && (
                <span className="inline-block w-1.5 h-4 bg-[var(--primary)] ml-0.5 animate-pulse rounded-sm" />
              )}
              {msg.status === 'error' && (
                <span className="inline-block text-[10px] text-red-400 ml-1">{t('canvas.error')}</span>
              )}

              {/* Action cards */}
              {msg.role === 'assistant' &&
                msg.status === 'done' &&
                msg.actions &&
                msg.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.actions.map((actionCard: ChatMessageAction, idx: number) => {
                      const Icon = nodeTypeIcons[actionCard.nodeType || ''] || Wand2;
                      const rawActions = rawActionsMap.get(msg.id);
                      const rawAction = rawActions?.[idx];

                      return (
                        <div
                          key={idx}
                          className="rounded-xl border border-[var(--border)] bg-[var(--hover-overlay)] p-2.5"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                              <Icon className="h-3.5 w-3.5 text-[var(--primary)]" />
                            </div>
                            <p className="text-xs text-[var(--foreground)] leading-tight">
                              {actionCard.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {actionCard.applied ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                                <Check className="h-3 w-3" />
                                {t('common.applied')}
                              </span>
                            ) : (
                              rawAction && (
                                <button
                                  onClick={() => handleApplyAction(msg.id, idx, rawAction)}
                                  className="text-[10px] px-2.5 py-1 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity cursor-pointer border-none"
                                >
                                  {t('canvas.applyToCanvas')}
                                </button>
                              )
                            )}
                            {actionCard.applied && actionCard.nodeId && (
                              <button
                                onClick={() => handleViewOnCanvas(actionCard.nodeId)}
                                className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-[var(--hover-overlay)] text-[var(--foreground)] hover:bg-white/10 transition-colors cursor-pointer border border-[var(--border)]"
                              >
                                <Eye className="h-3 w-3" />
                                {t('canvas.viewOnCanvas')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Context preview */}
      <ContextPreview />

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--hover-overlay)] p-2">
          <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none flex-shrink-0">
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('canvas.describePlaceholder')}
            rows={1}
            className="flex-1 bg-transparent border-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none resize-none min-h-[24px] max-h-[120px]"
          />
          <ModelSelector value={model} onChange={setModel} />
          <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer bg-transparent border-none flex-shrink-0">
            <Mic className="h-4 w-4" />
          </button>
          {isStreaming ? (
            <button
              onClick={cancelStream}
              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer border-none flex-shrink-0"
              title={t('canvas.stopGenerating')}
            >
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="p-1.5 rounded-lg bg-[var(--primary)] text-white disabled:opacity-30 transition-opacity cursor-pointer border-none flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
