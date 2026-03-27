import { useState, useCallback } from 'react';
import {
  Settings,
  Key,
  Users,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  Check,
  Loader2,
  ChevronDown,
  Moon,
  Languages,
  Save,
  UserPlus,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIModelStore } from '@/stores/aiModelStore';
import { testConnection } from '@/api/ai-service';
import type { ConnectionTestResult, ProviderConfig } from '@/types/ai-models';

type SettingsTab = 'general' | 'api' | 'users';

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('general');

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-1">Settings</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">
        Manage your workspace preferences and configuration
      </p>

      <div className="flex gap-8">
        {/* Sidebar */}
        <nav className="w-52 flex-shrink-0 space-y-1">
          <NavItem
            icon={Settings}
            label="General"
            active={tab === 'general'}
            onClick={() => setTab('general')}
          />
          <NavItem
            icon={Key}
            label="API Configuration"
            active={tab === 'api'}
            onClick={() => setTab('api')}
          />
          <NavItem
            icon={Users}
            label="User Management"
            active={tab === 'users'}
            onClick={() => setTab('users')}
          />
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'general' && <GeneralSection />}
          {tab === 'api' && <ApiConfigurationSection />}
          {tab === 'users' && <UserManagementSection />}
        </div>
      </div>
    </div>
  );
}

/* --- Sidebar Nav Item --- */

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer border-none text-left',
        active
          ? 'bg-white/10 text-[var(--foreground)] font-medium'
          : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-white/5 bg-transparent',
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </button>
  );
}

/* --- Toggle Switch --- */

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors cursor-pointer border-none',
        checked ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]',
        disabled && 'opacity-40 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ml-0.5',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
}

/* --- Section Card Wrapper --- */

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      {children}
    </div>
  );
}

/* --- Section Header --- */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium text-[var(--foreground)]">{title}</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
    </div>
  );
}

/* --- Field Wrapper --- */

function FieldRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8 py-4 border-b border-[var(--border)] last:border-none">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

/* ============================================================================
   General Section
   ============================================================================ */

function GeneralSection() {
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div>
      <SectionHeader
        title="General"
        description="Basic workspace settings and preferences"
      />

      <SectionCard>
        <FieldRow
          label="Application Name"
          description="The name displayed across the workspace"
        >
          <span className="text-sm text-[var(--foreground)] bg-white/5 px-3 py-1.5 rounded-lg">
            AI Visual Workspace
          </span>
        </FieldRow>

        <FieldRow
          label="Theme"
          description="Interface color scheme. Additional themes coming soon."
        >
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />
            <select
              disabled
              className="h-9 w-36 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] appearance-none cursor-not-allowed opacity-60"
              defaultValue="dark"
            >
              <option value="dark">Dark</option>
            </select>
          </div>
        </FieldRow>

        <FieldRow
          label="Language"
          description="Display language for the interface"
        >
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-[var(--muted-foreground)]" />
            <div className="relative">
              <select
                className="h-9 w-36 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 pr-8 text-sm text-[var(--foreground)] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                defaultValue="en"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>
        </FieldRow>

        <FieldRow
          label="Auto-save"
          description="Automatically save changes to your workflows"
        >
          <Toggle checked={autoSave} onChange={setAutoSave} />
        </FieldRow>
      </SectionCard>
    </div>
  );
}

/* ============================================================================
   API Configuration Section (wired to aiModelStore)
   ============================================================================ */

function ApiConfigurationSection() {
  const providers = useAIModelStore((s) => s.providers);
  const models = useAIModelStore((s) => s.models);
  const selectedChatModelId = useAIModelStore((s) => s.selectedChatModelId);
  const setSelectedChatModel = useAIModelStore((s) => s.setSelectedChatModel);

  return (
    <div>
      <SectionHeader
        title="API Configuration"
        description="Configure your AI service providers and credentials. API keys are stored locally and never sent to our servers."
      />

      {/* Default chat model selection */}
      <SectionCard>
        <div className="mb-5">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Default Chat Model
          </label>
          <p className="text-xs text-[var(--muted-foreground)] mb-2">
            Select the default AI model for chat interactions
          </p>
          <div className="relative">
            <select
              value={selectedChatModelId}
              onChange={(e) => setSelectedChatModel(e.target.value)}
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 pr-8 text-sm text-[var(--foreground)] appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {models
                .filter((m) => m.capabilities.includes('text-generation') && m.enabled)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider})
                  </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
          </div>
        </div>
      </SectionCard>

      {/* Provider cards */}
      <div className="mt-6 space-y-4">
        {providers.map((provider) => (
          <ProviderCard key={provider.provider} config={provider} />
        ))}
      </div>
    </div>
  );
}

/* --- Provider Card --- */

function ProviderCard({ config }: { config: ProviderConfig }) {
  const updateProvider = useAIModelStore((s) => s.updateProvider);
  const addApiKey = useAIModelStore((s) => s.addApiKey);
  const removeApiKey = useAIModelStore((s) => s.removeApiKey);

  const [expanded, setExpanded] = useState(config.apiKeys.length > 0 || config.provider === 'openai');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [baseUrl, setBaseUrl] = useState(config.baseUrl);

  const handleAddKey = () => {
    if (!newKeyValue.trim()) return;
    addApiKey(config.provider, newKeyValue.trim(), newKeyLabel.trim() || `Key ${config.apiKeys.length + 1}`);
    setNewKeyValue('');
    setNewKeyLabel('');
  };

  const handleTestConnection = useCallback(async () => {
    // Save base URL first
    if (baseUrl !== config.baseUrl) {
      updateProvider(config.provider, { baseUrl });
    }
    setTestStatus('testing');
    setTestResult(null);
    try {
      const result = await testConnection(config.provider);
      setTestResult(result);
      setTestStatus(result.success ? 'success' : 'error');
      // Reset status after a delay
      setTimeout(() => setTestStatus('idle'), 5000);
    } catch {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 5000);
    }
  }, [config.provider, config.baseUrl, baseUrl, updateProvider]);

  const handleSaveBaseUrl = () => {
    updateProvider(config.provider, { baseUrl });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '********';
    return key.slice(0, 4) + '...' + key.slice(-4);
  };

  return (
    <SectionCard>
      {/* Provider header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-3 cursor-pointer bg-transparent border-none text-left flex-1"
        >
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-sm font-medium text-[var(--foreground)]">{config.displayName}</h3>
          </div>
          {config.apiKeys.length > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
              {config.apiKeys.filter((k) => !k.disabled).length} key(s)
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 text-[var(--muted-foreground)] transition-transform ml-auto',
              expanded && 'rotate-180',
            )}
          />
        </button>
        <Toggle
          checked={config.enabled}
          onChange={(val) => updateProvider(config.provider, { enabled: val })}
        />
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Base URL */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
                className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
              {baseUrl !== config.baseUrl && (
                <button
                  onClick={handleSaveBaseUrl}
                  className="h-9 px-3 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer border-none flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Existing keys */}
          {config.apiKeys.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-2">
                API Keys ({config.apiKeys.length})
              </label>
              <div className="space-y-2">
                {config.apiKeys.map((keyEntry, idx) => (
                  <div
                    key={keyEntry.id}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border',
                      keyEntry.disabled
                        ? 'border-red-500/30 bg-red-500/5'
                        : idx === config.activeKeyIndex
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : 'border-[var(--border)] bg-white/[0.02]',
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-[var(--foreground)]">
                          {keyEntry.label}
                        </span>
                        {idx === config.activeKeyIndex && !keyEntry.disabled && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                            active
                          </span>
                        )}
                        {keyEntry.disabled && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                            disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--muted-foreground)] font-mono mt-0.5">
                        {showKeys[keyEntry.id] ? keyEntry.key : maskKey(keyEntry.key)}
                      </p>
                      {keyEntry.lastUsedAt && (
                        <p className="text-[9px] text-[var(--muted-foreground)] mt-0.5">
                          Last used: {new Date(keyEntry.lastUsedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleKeyVisibility(keyEntry.id)}
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors bg-transparent border-none cursor-pointer"
                    >
                      {showKeys[keyEntry.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => removeApiKey(config.provider, keyEntry.id)}
                      className="p-1 rounded text-[var(--muted-foreground)] hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer"
                      title="Remove key"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add new key */}
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Add API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyLabel}
                onChange={(e) => setNewKeyLabel(e.target.value)}
                placeholder="Label (optional)"
                className="h-9 w-28 rounded-lg border border-[var(--border)] bg-[var(--input)] px-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <input
                type="password"
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
                placeholder="sk-..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddKey(); }}
                className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] font-mono placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <button
                onClick={handleAddKey}
                disabled={!newKeyValue.trim()}
                className="h-9 px-3 rounded-lg bg-white/5 text-[var(--foreground)] text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer border-none flex items-center gap-1 disabled:opacity-30"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          {/* Test connection + result */}
          <div className="border-t border-[var(--border)] pt-4 flex items-center gap-3 flex-wrap">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className={cn(
                'flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer border-none',
                testStatus === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : testStatus === 'error'
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-[var(--primary)] text-white hover:opacity-90',
                testStatus === 'testing' && 'opacity-70 cursor-not-allowed',
              )}
            >
              {testStatus === 'testing' && <Loader2 className="h-4 w-4 animate-spin" />}
              {testStatus === 'success' && <Check className="h-4 w-4" />}
              {testStatus === 'error' && <AlertCircle className="h-4 w-4" />}
              {testStatus === 'idle' && <Zap className="h-4 w-4" />}
              {testStatus === 'testing'
                ? 'Testing...'
                : testStatus === 'success'
                  ? 'Connected'
                  : testStatus === 'error'
                    ? 'Failed'
                    : 'Test Connection'}
            </button>

            {testResult && (
              <div className="text-xs text-[var(--muted-foreground)]">
                {testResult.success ? (
                  <span>
                    {testResult.modelName && `Model: ${testResult.modelName} | `}
                    Latency: {testResult.latencyMs}ms
                  </span>
                ) : (
                  <span className="text-red-400">{testResult.error}</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/* ============================================================================
   User Management Section
   ============================================================================ */

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  avatarColor: string;
}

const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    avatarColor: 'bg-violet-500/20 text-violet-400',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'editor',
    status: 'active',
    avatarColor: 'bg-sky-500/20 text-sky-400',
  },
  {
    id: '3',
    name: 'Marcus Williams',
    email: 'marcus.w@example.com',
    role: 'viewer',
    status: 'inactive',
    avatarColor: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: '4',
    name: 'Emily Park',
    email: 'emily.park@example.com',
    role: 'editor',
    status: 'pending',
    avatarColor: 'bg-emerald-500/20 text-emerald-400',
  },
];

const roleBadgeStyles: Record<MockUser['role'], string> = {
  admin: 'bg-violet-500/15 text-violet-400',
  editor: 'bg-sky-500/15 text-sky-400',
  viewer: 'bg-zinc-500/15 text-zinc-400',
};

const statusStyles: Record<MockUser['status'], { dot: string; text: string }> = {
  active: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  inactive: { dot: 'bg-zinc-500', text: 'text-zinc-400' },
  pending: { dot: 'bg-amber-400', text: 'text-amber-400' },
};

function UserManagementSection() {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-[var(--foreground)]">User Management</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Manage workspace members and their permissions
          </p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer border-none">
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)] bg-white/[0.02]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                User
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Role
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[var(--border)] last:border-none hover:bg-white/[0.02] transition-colors"
              >
                {/* User cell */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                        user.avatarColor,
                      )}
                    >
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Role cell */}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded-full capitalize',
                      roleBadgeStyles[user.role],
                    )}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Status cell */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full flex-shrink-0',
                        statusStyles[user.status].dot,
                      )}
                    />
                    <span
                      className={cn(
                        'text-xs capitalize',
                        statusStyles[user.status].text,
                      )}
                    >
                      {user.status}
                    </span>
                  </div>
                </td>

                {/* Actions cell */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeUser(user.id)}
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                    title="Remove user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-[var(--muted-foreground)]">
                  No users found. Invite someone to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
