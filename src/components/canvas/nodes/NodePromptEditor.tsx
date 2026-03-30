import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Video, Type, Music } from 'lucide-react';
import { useCanvasStore } from '@/stores/useCanvasStore';
import type { NodeType } from '@/types';

interface NodePromptEditorProps {
  nodeId: string;
  prompt: string;
  onChange: (prompt: string) => void;
}

interface MentionOption {
  id: string;
  label: string;
  type: NodeType;
}

const nodeTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Video,
  text: Type,
  audio: Music,
};

/** Parse prompt text into segments: plain text and @mentions */
function parsePrompt(text: string): Array<{ type: 'text' | 'mention'; value: string; nodeId?: string; label?: string }> {
  const segments: Array<{ type: 'text' | 'mention'; value: string; nodeId?: string; label?: string }> = [];
  const regex = /@\[([^\]:]+):([^\]]+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'mention', value: match[0], nodeId: match[1], label: match[2] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

export function NodePromptEditor({ nodeId, prompt, onChange }: NodePromptEditorProps) {
  const { t } = useTranslation();
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get connected nodes (via edges) + all other nodes as candidates
  const getConnectedNodes = useCallback((): MentionOption[] => {
    const connectedIds = new Set<string>();
    for (const edge of edges) {
      if (edge.source === nodeId) connectedIds.add(edge.target);
      if (edge.target === nodeId) connectedIds.add(edge.source);
    }

    // Connected nodes first, then others
    const connected: MentionOption[] = [];
    const others: MentionOption[] = [];

    for (const node of nodes) {
      if (node.id === nodeId) continue;
      const option: MentionOption = {
        id: node.id,
        label: (node.data as Record<string, unknown>).label as string || node.type || 'Node',
        type: (node.type || 'text') as NodeType,
      };
      if (connectedIds.has(node.id)) {
        connected.push(option);
      } else {
        others.push(option);
      }
    }

    return [...connected, ...others];
  }, [nodeId, nodes, edges]);

  const mentionOptions = getConnectedNodes().filter((n) =>
    mentionFilter === '' || n.label.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const startEditing = () => {
    // Convert @[id:label] back to display format for editing
    setEditText(prompt);
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const finishEditing = () => {
    setIsEditing(false);
    setShowMentionMenu(false);
    onChange(editText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionMenu) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, mentionOptions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionOptions[mentionIndex]) {
          insertMention(mentionOptions[mentionIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentionMenu(false);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setShowMentionMenu(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const pos = e.target.selectionStart;
    setEditText(value);
    setCursorPos(pos);

    // Check if we're typing an @ mention
    const textBeforeCursor = value.slice(0, pos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(atIndex + 1);
      // Only show menu if @ is at start or after whitespace, and no space in the filter
      const charBeforeAt = atIndex > 0 ? value[atIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || charBeforeAt === '\n' || atIndex === 0) && !textAfterAt.includes('[')) {
        setMentionFilter(textAfterAt);
        setShowMentionMenu(true);
        setMentionIndex(0);
        return;
      }
    }

    setShowMentionMenu(false);
  };

  const insertMention = (option: MentionOption) => {
    const textBeforeCursor = editText.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const before = editText.slice(0, atIndex);
    const after = editText.slice(cursorPos);
    const mention = `@[${option.id}:${option.label}]`;
    const newText = before + mention + ' ' + after;
    setEditText(newText);
    setShowMentionMenu(false);

    // Restore focus and cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = before.length + mention.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editText, isEditing]);

  // Render the display view with styled @ mentions
  const segments = parsePrompt(prompt);

  const getNodeType = (nId: string): NodeType => {
    const node = nodes.find((n) => n.id === nId);
    return (node?.type || 'text') as NodeType;
  };

  return (
    <div className="px-3 py-2 border-t border-[var(--border)] nodrag nowheel">
      {isEditing ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={editText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay to allow menu click
              setTimeout(() => {
                if (!menuRef.current?.contains(document.activeElement)) {
                  finishEditing();
                }
              }, 150);
            }}
            placeholder={t('properties.nodePromptPlaceholder')}
            className="w-full bg-transparent text-xs text-[var(--foreground)] resize-none outline-none placeholder:text-[var(--muted-foreground)]/50 min-h-[40px] border-none p-0"
            rows={2}
          />
          {showMentionMenu && mentionOptions.length > 0 && (
            <div
              ref={menuRef}
              className="absolute left-0 bottom-full mb-1 w-full max-h-[160px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-xl z-50"
            >
              {mentionOptions.map((option, i) => {
                const Icon = nodeTypeIcons[option.type] || Type;
                return (
                  <button
                    key={option.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertMention(option);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left cursor-pointer bg-transparent border-none transition-colors ${
                      i === mentionIndex ? 'bg-white/10 text-[var(--foreground)]' : 'text-[var(--muted-foreground)] hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-[var(--primary)] flex-shrink-0" />
                    <span className="truncate">{option.label}</span>
                    <span className="ml-auto text-[10px] opacity-50">{option.type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={startEditing}
          className="min-h-[28px] cursor-text"
        >
          {segments.length === 0 || (segments.length === 1 && segments[0].value === '') ? (
            <p className="text-[11px] text-[var(--muted-foreground)]/40 italic">
              {t('properties.clickToAddPrompt')}
            </p>
          ) : (
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap break-words">
              {segments.map((seg, i) => {
                if (seg.type === 'mention') {
                  const nType = getNodeType(seg.nodeId || '');
                  const Icon = nodeTypeIcons[nType] || Type;
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 mx-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] text-[10px] font-medium align-middle"
                    >
                      <Icon className="h-3 w-3" />
                      {seg.label}
                    </span>
                  );
                }
                return <span key={i}>{seg.value}</span>;
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
