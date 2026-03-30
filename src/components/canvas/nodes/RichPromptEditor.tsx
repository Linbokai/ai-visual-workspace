import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanvasStore } from '@/stores/useCanvasStore';

/* ── types ──────────────────────────────────────────────── */

interface RefImage {
  nodeId: string;
  label: string;
  imageUrl: string;
  index: number;
}

interface RichPromptEditorProps {
  nodeId: string;
  prompt: string;
  onChange: (prompt: string) => void;
  refImages: RefImage[];
  onInsertRef: (ref: RefImage) => void;
  placeholder?: string;
  accentColor?: string;
}

interface MentionOption {
  id: string;
  label: string;
  imageUrl?: string;
  type: string;
}

/* ── helpers ─────────────────────────────────────────────── */

const TAG_RE = /@\[([^\]:]+):([^\]]+)\]/g;

function escHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/** Raw prompt → HTML with styled pill tags */
function rawToHtml(text: string, refImages: RefImage[], accentColor: string): string {
  if (!text) return '';
  const re = new RegExp(TAG_RE.source, 'g');
  let html = '';
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) html += escHtml(text.slice(last, m.index));

    const ref = refImages.find((r) => r.nodeId === m![1]);
    const display = ref ? `Image ${ref.index}` : m[2];
    const thumb = ref?.imageUrl;
    const raw = m[0];

    // Atomic pill: contenteditable=false makes it behave as a single unit
    // data-raw stores the original tag text for extraction
    html += `<span contenteditable="false" data-raw="${raw.replace(/"/g, '&quot;')}" class="rich-ref-tag" style="--ref-color:${accentColor}">`;
    if (thumb) {
      html += `<img src="${thumb}" class="rich-ref-thumb"/>`;
    } else {
      html += `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rich-ref-icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
    }
    html += `<span class="rich-ref-label">${escHtml(display)}</span></span>`;

    last = re.lastIndex;
  }

  if (last < text.length) html += escHtml(text.slice(last));
  return html;
}

/** Extract raw prompt text from contentEditable DOM */
function domToRaw(el: HTMLElement): string {
  let result = '';
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const htmlEl = node as HTMLElement;
      const raw = htmlEl.getAttribute('data-raw');
      if (raw) {
        // This is a pill tag – use the stored raw text
        result += raw;
      } else if (htmlEl.tagName === 'BR') {
        result += '\n';
      } else {
        // Recurse into other elements (e.g. <div> from Enter key)
        result += domToRaw(htmlEl);
        // Browsers wrap lines in divs; add newline after block elements
        if (htmlEl.tagName === 'DIV' || htmlEl.tagName === 'P') {
          result += '\n';
        }
      }
    }
  }
  return result;
}

/* ── component ───────────────────────────────────────────── */

export function RichPromptEditor({
  nodeId,
  prompt,
  onChange,
  refImages,
  onInsertRef,
  placeholder,
  accentColor = 'rgb(59, 130, 246)',
}: RichPromptEditorProps) {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Track the last raw value WE set, to distinguish external vs internal changes
  const lastRawRef = useRef(prompt);
  const isComposing = useRef(false);
  const isFocusedRef = useRef(false);

  const [showMention, setShowMention] = useState(false);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [mentionFilter, setMentionFilter] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const placeholderText =
    placeholder || t('properties.nodePromptPlaceholder', '描述你想生成的内容...');

  // Connected nodes only
  const edges = useCanvasStore((s) => s.edges);
  const allNodes = useCanvasStore((s) => s.nodes);

  const connectedOptions = useMemo((): MentionOption[] => {
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.source === nodeId) ids.add(e.target);
      if (e.target === nodeId) ids.add(e.source);
    }
    return allNodes
      .filter((n) => ids.has(n.id))
      .map((n) => {
        const nd = n.data as Record<string, any>;
        return {
          id: n.id,
          label: nd.label || n.type || 'Node',
          imageUrl: nd.imageUrl,
          type: n.type || 'text',
        };
      });
  }, [nodeId, edges, allNodes]);

  const filtered = mentionFilter
    ? connectedOptions.filter((o) =>
        o.label.toLowerCase().includes(mentionFilter.toLowerCase()),
      )
    : connectedOptions;

  /* ── Sync prompt → DOM only when changed externally ────── */
  useEffect(() => {
    if (!editorRef.current) return;
    // NEVER rewrite DOM while user is editing — this causes cursor jump
    if (isFocusedRef.current) return;
    if (prompt !== lastRawRef.current) {
      lastRawRef.current = prompt;
      editorRef.current.innerHTML = rawToHtml(prompt, refImages, accentColor);
    }
  }, [prompt, refImages, accentColor]);

  // Initial render
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = rawToHtml(prompt, refImages, accentColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Extract raw text from DOM and notify parent ────────── */
  const syncToParent = useCallback(() => {
    if (!editorRef.current || isComposing.current) return;
    const raw = domToRaw(editorRef.current);
    // Clean up: collapse multiple trailing newlines
    const cleaned = raw.replace(/\n+$/, '');
    lastRawRef.current = cleaned;
    onChange(cleaned);
  }, [onChange]);

  /* ── @ mention detection ───────────────────────────────── */
  const checkMention = useCallback(() => {
    if (!editorRef.current) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) { setShowMention(false); return; }

    // Get text before cursor by creating a range from start of editor to cursor
    const range = sel.getRangeAt(0).cloneRange();
    range.setStart(editorRef.current, 0);
    const textBefore = range.toString();

    // Find last bare '@' not inside a tag
    const stripped = textBefore.replace(/@\[[^\]]*\]/g, (m) => '_'.repeat(m.length));
    const atIdx = stripped.lastIndexOf('@');
    if (atIdx === -1) { setShowMention(false); return; }

    const charBefore = atIdx > 0 ? stripped[atIdx - 1] : ' ';
    if (charBefore !== ' ' && charBefore !== '\n' && atIdx !== 0) {
      setShowMention(false);
      return;
    }

    const filterText = stripped.slice(atIdx + 1);
    if (filterText.includes(' ') || filterText.includes('[')) {
      setShowMention(false);
      return;
    }

    setMentionFilter(filterText);
    setMentionIdx(0);
    setShowMention(true);
  }, []);

  /* ── Insert a mention tag at cursor ────────────────────── */
  const insertMention = useCallback(
    (opt: MentionOption) => {
      if (!editorRef.current) return;

      // Delete the "@filter" text
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0).cloneRange();
      range.setStart(editorRef.current, 0);
      const textBefore = range.toString();
      const stripped = textBefore.replace(/@\[[^\]]*\]/g, (m) => '_'.repeat(m.length));
      const atIdx = stripped.lastIndexOf('@');
      const charsToDelete = textBefore.length - atIdx;

      // Move selection back by charsToDelete
      for (let i = 0; i < charsToDelete; i++) {
        sel.modify('extend', 'backward', 'character');
      }
      sel.deleteFromDocument();

      // Insert pill HTML
      const raw = `@[${opt.id}:${opt.label}]`;
      const ref = refImages.find((r) => r.nodeId === opt.id);
      const display = ref ? `Image ${ref.index}` : opt.label;
      const thumb = opt.imageUrl;

      let tagHtml = `<span contenteditable="false" data-raw="${raw.replace(/"/g, '&quot;')}" class="rich-ref-tag" style="--ref-color:${accentColor}">`;
      if (thumb) {
        tagHtml += `<img src="${thumb}" class="rich-ref-thumb"/>`;
      } else {
        tagHtml += `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rich-ref-icon"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
      }
      tagHtml += `<span class="rich-ref-label">${display}</span></span>&nbsp;`;

      document.execCommand('insertHTML', false, tagHtml);
      setShowMention(false);

      // Sync after insertion
      setTimeout(syncToParent, 0);
    },
    [accentColor, refImages, syncToParent],
  );

  /* ── Event handlers ─────────────────────────────────────── */

  const handleInput = useCallback(() => {
    syncToParent();
    checkMention();
  }, [syncToParent, checkMention]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showMention && filtered.length > 0) {
        if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIdx((i) => Math.min(i + 1, filtered.length - 1)); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIdx((i) => Math.max(i - 1, 0)); return; }
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(filtered[mentionIdx]); return; }
        if (e.key === 'Escape') { e.preventDefault(); setShowMention(false); return; }
      }
      if (e.key === 'Escape') editorRef.current?.blur();
    },
    [showMention, filtered, mentionIdx, insertMention],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    },
    [],
  );

  const isEmpty = !prompt;

  return (
    <div className="border-t border-[var(--border)]">
      {/* Reference thumbnails */}
      {refImages.length > 0 && (
        <div className="px-3 py-2 flex items-center gap-2 flex-wrap border-b border-[var(--border)]">
          {refImages.map((ref) => (
            <button
              key={ref.nodeId}
              onClick={() => onInsertRef(ref)}
              className="group/ref flex items-center gap-1 pl-0.5 pr-2 py-0.5 rounded-md bg-[var(--muted)] hover:bg-blue-500/10 border border-[var(--border)] hover:border-blue-500/30 transition-colors cursor-pointer"
              title={t('nodes.insertRef', '点击插入引用')}
            >
              <img src={ref.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />
              <span className="text-[10px] text-[var(--muted-foreground)] group-hover/ref:text-blue-400">
                Image {ref.index}
              </span>
            </button>
          ))}
          <button className="w-6 h-6 rounded-md border border-dashed border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)] transition-colors cursor-pointer bg-transparent text-sm leading-none">
            +
          </button>
        </div>
      )}

      {/* Editable prompt area */}
      <div className="px-3 py-2 nodrag nowheel relative">
        {isEmpty && !isFocused && (
          <div
            className="absolute inset-0 px-3 py-2 text-[11px] text-[var(--muted-foreground)]/40 italic pointer-events-none"
          >
            {placeholderText}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => { isFocusedRef.current = true; setIsFocused(true); }}
          onBlur={() => {
            setTimeout(() => {
              if (!menuRef.current?.contains(document.activeElement)) {
                isFocusedRef.current = false;
                setIsFocused(false);
                setShowMention(false);
                syncToParent();
                // Re-render DOM with latest prompt now that editing is done
                if (editorRef.current) {
                  const raw = domToRaw(editorRef.current);
                  const cleaned = raw.replace(/\n+$/, '');
                  editorRef.current.innerHTML = rawToHtml(cleaned, refImages, accentColor);
                }
              }
            }, 150);
          }}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => {
            isComposing.current = false;
            handleInput();
          }}
          className="min-h-[36px] max-h-[120px] overflow-y-auto text-xs text-[var(--foreground)] leading-relaxed outline-none whitespace-pre-wrap break-words"
          style={{ wordBreak: 'break-word' }}
          spellCheck={false}
        />

        {/* @ mention dropdown */}
        {showMention && filtered.length > 0 && (
          <div
            ref={menuRef}
            className="absolute left-0 bottom-full mb-1 w-full max-h-[160px] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-xl z-50"
          >
            {filtered.map((opt, i) => (
              <button
                key={opt.id}
                onMouseDown={(e) => { e.preventDefault(); insertMention(opt); }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left cursor-pointer bg-transparent border-none transition-colors ${
                  i === mentionIdx
                    ? 'bg-white/10 text-[var(--foreground)]'
                    : 'text-[var(--muted-foreground)] hover:bg-white/5'
                }`}
              >
                {opt.imageUrl ? (
                  <img src={opt.imageUrl} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded bg-[var(--muted)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] text-[var(--muted-foreground)]">{opt.type[0]?.toUpperCase()}</span>
                  </div>
                )}
                <span className="truncate">{opt.label}</span>
                <span className="ml-auto text-[10px] opacity-50">{opt.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
