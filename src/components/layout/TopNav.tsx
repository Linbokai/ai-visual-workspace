import { Link, useLocation } from 'react-router-dom';
import { Sparkles, LayoutGrid, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { path: '/projects', label: 'Projects', icon: LayoutGrid },
  { path: '/templates', label: 'Templates', icon: Sparkles },
  { path: '/settings', label: 'Settings', icon: Settings },
] as const;

export function TopNav() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-6 border-b border-[var(--topbar-border)]"
      style={{
        backdropFilter: 'blur(24px)',
        background: 'var(--topbar-bg)',
      }}
    >
      {/* Logo */}
      <Link to="/projects" className="flex items-center gap-2 text-[var(--foreground)] no-underline" aria-label="AI Workspace - Go to projects">
        <Sparkles className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
        <span className="font-semibold text-base">AI Workspace</span>
      </Link>

      {/* Nav Links */}
      <nav className="flex items-center gap-1" aria-label="Main navigation">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            aria-current={location.pathname === path ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm no-underline transition-colors',
              location.pathname === path
                ? 'bg-[var(--active-overlay)] text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)]'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-[var(--muted-foreground)]" aria-label={`Logged in as ${user?.name || 'User'}`}>
          {user?.name || 'User'}
        </span>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--hover-overlay)] transition-colors cursor-pointer bg-transparent border-none"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
