import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Sparkles, Zap, Brain, Globe, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useAIModelStore } from '@/stores/aiModelStore';

interface ModelOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const providerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  openai: Sparkles,
  anthropic: Brain,
  stability: Zap,
  replicate: Globe,
  local: Cpu,
  custom: Globe,
};

// Fallback models are built dynamically to pick up current language
function getFallbackModels(t: (key: string) => string): ModelOption[] {
  return [
    { id: 'default', name: t('modelSelector.auto'), icon: Sparkles, description: t('modelSelector.autoDesc') },
    { id: 'fast', name: t('modelSelector.fast'), icon: Zap, description: t('modelSelector.fastDesc') },
    { id: 'quality', name: t('modelSelector.quality'), icon: Brain, description: t('modelSelector.qualityDesc') },
  ];
}

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const models = useAIModelStore((s) => s.models);
  const providers = useAIModelStore((s) => s.providers);
  const setSelectedChatModel = useAIModelStore((s) => s.setSelectedChatModel);

  // Build model options from the AI model store
  const modelOptions: ModelOption[] = useMemo(() => {
    const enabledProviders = new Set(
      providers.filter((p) => p.enabled).map((p) => p.provider),
    );
    // Always include local provider if enabled
    const localProvider = providers.find((p) => p.provider === 'local');
    if (localProvider?.enabled) enabledProviders.add('local');

    const chatModels = models.filter(
      (m) =>
        m.capabilities.includes('text-generation') &&
        m.enabled &&
        enabledProviders.has(m.provider),
    );

    if (chatModels.length === 0) return getFallbackModels(t);

    // Prepend "Auto" option
    const options: ModelOption[] = [
      { id: 'default', name: t('modelSelector.auto'), icon: Sparkles, description: t('modelSelector.autoDesc') },
    ];

    for (const m of chatModels) {
      options.push({
        id: m.id,
        name: m.name,
        icon: providerIcons[m.provider] || Globe,
        description: m.description,
      });
    }

    return options;
  }, [models, providers]);

  const selected = modelOptions.find((m) => m.id === value) || modelOptions[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    // Also update the global store if a specific model is selected
    if (modelId !== 'default' && modelId !== 'fast' && modelId !== 'quality') {
      setSelectedChatModel(modelId);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
      >
        <selected.icon className="h-3.5 w-3.5" />
        {selected.name}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 z-50 min-w-[200px] rounded-xl border border-[var(--border)] bg-[var(--popover)] p-1 shadow-lg max-h-[300px] overflow-y-auto">
          {modelOptions.map((model) => (
            <button
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors cursor-pointer bg-transparent border-none text-left',
                model.id === value
                  ? 'bg-white/5 text-[var(--foreground)]'
                  : 'text-[var(--popover-foreground)] hover:bg-white/5'
              )}
            >
              <model.icon className="h-4 w-4 flex-shrink-0" />
              <div>
                <p className="text-sm">{model.name}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">{model.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
