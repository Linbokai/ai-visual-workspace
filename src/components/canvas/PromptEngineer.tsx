import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wand2,
  Languages,
  Star,
  Copy,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  Trash2,
  RotateCcw,
  Plus,
  X,
  Search,
} from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import {
  PROMPT_SUBJECTS,
  PROMPT_STYLES,
  PROMPT_LIGHTING,
  PROMPT_CAMERA_ANGLES,
  PROMPT_COLOR_PALETTES,
  PROMPT_MOODS,
  PROMPT_QUALITY_TAGS,
  CATEGORY_INFO,
  buildPromptFromTemplate,
  getAllCategories,
  getTemplatesByCategory,
  type PromptTemplate,
  type PromptCategory,
} from '@/lib/prompt-templates';

type TabMode = 'builder' | 'templates' | 'translate' | 'history';

interface SavedPrompt {
  id: string;
  prompt: string;
  timestamp: number;
  isFavorite: boolean;
}

// Simple CN<->EN word map for common prompt terms
const TRANSLATION_MAP: Array<[string, string]> = [
  ['杰作', 'masterpiece'],
  ['最佳质量', 'best quality'],
  ['高度详细', 'highly detailed'],
  ['超高清', 'ultra HD'],
  ['写实', 'photorealistic'],
  ['数字艺术', 'digital art'],
  ['油画', 'oil painting'],
  ['水彩画', 'watercolor'],
  ['工作室灯光', 'studio lighting'],
  ['自然光', 'natural light'],
  ['黄金时刻', 'golden hour'],
  ['戏剧性灯光', 'dramatic lighting'],
  ['背光', 'backlit'],
  ['柔和', 'soft'],
  ['鲜艳', 'vibrant'],
  ['暗调', 'dark and moody'],
  ['赛博朋克', 'cyberpunk'],
  ['蒸汽朋克', 'steampunk'],
  ['动漫风格', 'anime style'],
  ['宫崎骏风格', 'Studio Ghibli style'],
  ['新海诚风格', 'Makoto Shinkai style'],
  ['人像', 'portrait'],
  ['风景', 'landscape'],
  ['城市景观', 'cityscape'],
  ['静物', 'still life'],
  ['近景', 'close-up'],
  ['广角', 'wide angle'],
  ['鸟瞰', "bird's eye view"],
  ['低角度', 'low angle'],
  ['高角度', 'high angle'],
  ['散景', 'bokeh'],
  ['景深', 'depth of field'],
  ['暖色调', 'warm tones'],
  ['冷色调', 'cool tones'],
  ['单色', 'monochrome'],
  ['复古', 'retro'],
  ['极简主义', 'minimalist'],
  ['神秘', 'mysterious'],
  ['浪漫', 'romantic'],
  ['史诗', 'epic'],
  ['梦幻', 'dreamy'],
  ['3D渲染', '3D render'],
  ['虚幻引擎', 'Unreal Engine'],
  ['辛烷值渲染', 'Octane render'],
  ['概念艺术', 'concept art'],
];

function translatePrompt(text: string, direction: 'cn2en' | 'en2cn'): string {
  let result = text;
  for (const [cn, en] of TRANSLATION_MAP) {
    if (direction === 'cn2en') {
      result = result.replace(new RegExp(cn, 'g'), en);
    } else {
      result = result.replace(new RegExp(en, 'gi'), cn);
    }
  }
  return result;
}

const BUILDER_CATEGORIES_KEYS = [
  { key: 'subject', labelKey: 'promptEng.subject', items: PROMPT_SUBJECTS },
  { key: 'style', labelKey: 'promptEng.style', items: PROMPT_STYLES },
  { key: 'lighting', labelKey: 'promptEng.lighting', items: PROMPT_LIGHTING },
  { key: 'camera', labelKey: 'promptEng.camera', items: PROMPT_CAMERA_ANGLES },
  { key: 'color', labelKey: 'promptEng.colorPalette', items: PROMPT_COLOR_PALETTES },
  { key: 'mood', labelKey: 'promptEng.mood', items: PROMPT_MOODS },
  { key: 'quality', labelKey: 'promptEng.quality', items: PROMPT_QUALITY_TAGS },
] as const;

interface PromptEngineerProps {
  initialPrompt?: string;
  onApplyPrompt?: (prompt: string) => void;
  onClose?: () => void;
  floating?: boolean;
}

export function PromptEngineer({ initialPrompt = '', onApplyPrompt, onClose, floating = false }: PromptEngineerProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabMode>('builder');
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
  const [customSubject, setCustomSubject] = useState(initialPrompt);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['subject']));

  // Templates
  const [activeTemplateCategory, setActiveTemplateCategory] = useState<PromptCategory>('photography');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({});

  // Translation
  const [translateInput, setTranslateInput] = useState('');
  const [translateOutput, setTranslateOutput] = useState('');
  const [translateDirection, setTranslateDirection] = useState<'cn2en' | 'en2cn'>('cn2en');

  // History
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('prompt-history') || '[]');
    } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Translated builder categories
  const builderCategories = useMemo(() =>
    BUILDER_CATEGORIES_KEYS.map((cat) => ({
      key: cat.key,
      label: t(cat.labelKey),
      items: cat.items,
    })),
  [t]);

  // Build prompt from selected tags
  const builtPrompt = useMemo(() => {
    const parts: string[] = [];
    if (customSubject.trim()) parts.push(customSubject.trim());

    for (const cat of builderCategories) {
      const tags = selectedTags[cat.key] || [];
      if (tags.length > 0) parts.push(tags.join(', '));
    }

    return parts.join(', ');
  }, [selectedTags, customSubject, builderCategories]);

  // Toggle tag
  const toggleTag = useCallback((category: string, tag: string) => {
    setSelectedTags((prev) => {
      const current = prev[category] || [];
      const next = current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag];
      return { ...prev, [category]: next };
    });
  }, []);

  // Toggle category expansion
  const toggleCategory = useCallback((key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // Copy prompt
  const handleCopy = useCallback((prompt: string) => {
    navigator.clipboard.writeText(prompt);
  }, []);

  // Save to history
  const handleSavePrompt = useCallback((prompt: string) => {
    if (!prompt.trim()) return;
    const newEntry: SavedPrompt = {
      id: generateId(),
      prompt: prompt.trim(),
      timestamp: Date.now(),
      isFavorite: false,
    };
    setSavedPrompts((prev) => {
      const next = [newEntry, ...prev].slice(0, 50);
      localStorage.setItem('prompt-history', JSON.stringify(next));
      return next;
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setSavedPrompts((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p);
      localStorage.setItem('prompt-history', JSON.stringify(next));
      return next;
    });
  }, []);

  // Delete from history
  const deletePrompt = useCallback((id: string) => {
    setSavedPrompts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      localStorage.setItem('prompt-history', JSON.stringify(next));
      return next;
    });
  }, []);

  // Apply prompt
  const handleApply = useCallback((prompt: string) => {
    onApplyPrompt?.(prompt);
    handleSavePrompt(prompt);
  }, [onApplyPrompt, handleSavePrompt]);

  // Handle translation
  const handleTranslate = useCallback(() => {
    setTranslateOutput(translatePrompt(translateInput, translateDirection));
  }, [translateInput, translateDirection]);

  // Build prompt from template
  const templatePrompt = useMemo(() => {
    if (!selectedTemplate) return '';
    return buildPromptFromTemplate(selectedTemplate, templateParams);
  }, [selectedTemplate, templateParams]);

  // Filtered history
  const filteredHistory = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return savedPrompts.filter((p) =>
      !query || p.prompt.toLowerCase().includes(query)
    );
  }, [savedPrompts, searchQuery]);

  const containerClass = floating
    ? 'fixed right-4 top-20 w-[380px] max-h-[calc(100vh-120px)] rounded-xl border border-[var(--border)] bg-[var(--sidebar)] shadow-2xl z-50 flex flex-col overflow-hidden'
    : 'space-y-4';

  return (
    <div className={containerClass}>
      {/* Header (floating mode) */}
      {floating && (
        <div className="flex items-center justify-between px-4 h-11 border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[var(--primary)]" />
            <h2 className="text-sm font-medium text-[var(--foreground)]">{t('promptEng.title')}</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className={cn(floating ? 'flex-1 overflow-y-auto p-4 space-y-4' : 'space-y-4')}>
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--muted)]">
          {([
            { mode: 'builder' as TabMode, label: t('promptEng.builder') },
            { mode: 'templates' as TabMode, label: t('promptEng.templates') },
            { mode: 'translate' as TabMode, label: t('promptEng.translate') },
            { mode: 'history' as TabMode, label: t('promptEng.history') },
          ]).map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setActiveTab(mode)}
              className={cn(
                'flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border-none',
                activeTab === mode
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Builder Tab */}
        {activeTab === 'builder' && (
          <div className="space-y-3">
            {/* Subject Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--foreground)]">{t('promptEng.subjectDesc')}</label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder={t('promptEng.describeSubject')}
                className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
              />
            </div>

            {/* Tag Categories */}
            {builderCategories.map((cat) => {
              const isExpanded = expandedCategories.has(cat.key);
              const selected = selectedTags[cat.key] || [];

              return (
                <div key={cat.key} className="border border-[var(--border)] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.key)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-[var(--muted)] hover:bg-white/5 transition-colors cursor-pointer border-none text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[var(--foreground)]">{cat.label}</span>
                      {selected.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[var(--primary)]/20 text-[9px] text-[var(--primary)]">
                          {selected.length}
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="h-3 w-3 text-[var(--muted-foreground)]" /> : <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)]" />}
                  </button>

                  {isExpanded && (
                    <div className="p-2 flex flex-wrap gap-1.5">
                      {cat.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => toggleTag(cat.key, item)}
                          className={cn(
                            'px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer border',
                            selected.includes(item)
                              ? 'bg-[var(--primary)]/20 border-[var(--primary)] text-[var(--primary)]'
                              : 'bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--muted-foreground)]'
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Built Prompt Preview */}
            {builtPrompt && (
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-[var(--primary)]">{t('promptEng.generatedPrompt')}</h3>
                <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--foreground)] whitespace-pre-wrap">{builtPrompt}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(builtPrompt)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs hover:bg-white/10 cursor-pointer border border-[var(--border)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {t('common.copy')}
                  </button>
                  {onApplyPrompt && (
                    <button
                      onClick={() => handleApply(builtPrompt)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 cursor-pointer border-none"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      {t('common.apply')}
                    </button>
                  )}
                  <button
                    onClick={() => handleSavePrompt(builtPrompt)}
                    className="flex items-center justify-center px-2 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/10 cursor-pointer border border-[var(--border)]"
                    title={t('promptEng.saveToHistory')}
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setSelectedTags({});
                    setCustomSubject('');
                  }}
                  className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-transparent border-none"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t('promptEng.resetAll')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {getAllCategories().map((cat) => {
                const info = CATEGORY_INFO[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveTemplateCategory(cat);
                      setSelectedTemplate(null);
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border',
                      activeTemplateCategory === cat
                        ? 'text-white border-transparent'
                        : 'bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                    style={activeTemplateCategory === cat ? { backgroundColor: info.color } : undefined}
                  >
                    {info.label}
                  </button>
                );
              })}
            </div>

            {/* Template List */}
            {!selectedTemplate ? (
              <div className="space-y-2">
                {getTemplatesByCategory(activeTemplateCategory).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template);
                      const defaults: Record<string, string> = {};
                      template.parameters.forEach((p) => { defaults[p.name] = p.default; });
                      setTemplateParams(defaults);
                    }}
                    className="w-full text-left p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/30 hover:bg-white/5 transition-colors cursor-pointer bg-transparent"
                  >
                    <p className="text-sm font-medium text-[var(--foreground)]">{template.name}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{template.nameCn}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded bg-[var(--muted)] text-[9px] text-[var(--muted-foreground)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Template Detail */
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-transparent border-none"
                >
                  <ChevronDown className="h-3 w-3 rotate-90" />
                  {t('promptEng.backToTemplates')}
                </button>

                <div>
                  <h3 className="text-sm font-medium text-[var(--foreground)]">{selectedTemplate.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{selectedTemplate.description}</p>
                </div>

                {/* Parameters */}
                <div className="space-y-3">
                  {selectedTemplate.parameters.map((param) => (
                    <div key={param.name} className="space-y-1">
                      <label className="text-xs font-medium text-[var(--foreground)]">{param.label}</label>
                      {param.type === 'select' && param.options ? (
                        <select
                          value={templateParams[param.name] || param.default}
                          onChange={(e) => setTemplateParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                        >
                          {param.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={templateParams[param.name] || param.default}
                          onChange={(e) => setTemplateParams((prev) => ({ ...prev, [param.name]: e.target.value }))}
                          className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                  <p className="text-[10px] text-[var(--muted-foreground)] mb-1">{t('common.preview')}:</p>
                  <p className="text-xs text-[var(--foreground)]">{templatePrompt}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(templatePrompt)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs hover:bg-white/10 cursor-pointer border border-[var(--border)]"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {t('common.copy')}
                  </button>
                  {onApplyPrompt && (
                    <button
                      onClick={() => handleApply(templatePrompt)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 cursor-pointer border-none"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      {t('common.apply')}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Translate Tab */}
        {activeTab === 'translate' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                {t('promptEng.promptTranslation')}
              </h3>
              <button
                onClick={() => setTranslateDirection(translateDirection === 'cn2en' ? 'en2cn' : 'cn2en')}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--muted)] hover:bg-white/10 cursor-pointer border-none"
              >
                <Languages className="h-3.5 w-3.5" />
                {translateDirection === 'cn2en' ? 'CN -> EN' : 'EN -> CN'}
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                value={translateInput}
                onChange={(e) => setTranslateInput(e.target.value)}
                placeholder={translateDirection === 'cn2en'
                  ? t('promptEng.cnToEn')
                  : t('promptEng.enToCn')
                }
                className="w-full h-[100px] px-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)] resize-none"
              />

              <button
                onClick={handleTranslate}
                disabled={!translateInput.trim()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-30 cursor-pointer border-none"
              >
                <Languages className="h-4 w-4" />
                {t('promptEng.translateBtn')}
              </button>

              {translateOutput && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[var(--muted)] border border-[var(--border)]">
                    <p className="text-xs text-[var(--foreground)]">{translateOutput}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(translateOutput)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-xs hover:bg-white/10 cursor-pointer border border-[var(--border)]"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {t('common.copy')}
                    </button>
                    {onApplyPrompt && (
                      <button
                        onClick={() => handleApply(translateOutput)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 cursor-pointer border-none"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        {t('common.apply')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Common prompt terms reference */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{t('promptEng.quickReference')}</p>
                <div className="grid grid-cols-2 gap-1 max-h-[200px] overflow-y-auto">
                  {TRANSLATION_MAP.slice(0, 20).map(([cn, en]) => (
                    <button
                      key={cn}
                      onClick={() => {
                        const term = translateDirection === 'cn2en' ? cn : en;
                        setTranslateInput((prev) => prev ? `${prev}, ${term}` : term);
                      }}
                      className="px-2 py-1 rounded text-[10px] text-left text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 cursor-pointer bg-transparent border-none"
                    >
                      <span className="text-[var(--foreground)]">{cn}</span>
                      <span className="mx-1 text-[var(--border)]">/</span>
                      <span>{en}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('promptEng.searchSavedPrompts')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[var(--muted)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
              />
            </div>

            {filteredHistory.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)] text-center py-6">
                {t('promptEng.noSavedPrompts')}
              </p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors"
                  >
                    <p className="text-xs text-[var(--foreground)] line-clamp-3 mb-2">{item.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-[var(--muted-foreground)]">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-yellow-400 cursor-pointer bg-transparent border-none"
                          title={t('promptEng.toggleFavorite')}
                        >
                          {item.isFavorite
                            ? <BookmarkCheck className="h-3.5 w-3.5 text-yellow-400" />
                            : <Star className="h-3.5 w-3.5" />
                          }
                        </button>
                        <button
                          onClick={() => handleCopy(item.prompt)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-transparent border-none"
                          title={t('common.copy')}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {onApplyPrompt && (
                          <button
                            onClick={() => handleApply(item.prompt)}
                            className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--primary)] cursor-pointer bg-transparent border-none"
                            title={t('common.apply')}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => deletePrompt(item.id)}
                          className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-400 cursor-pointer bg-transparent border-none"
                          title={t('common.delete')}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
