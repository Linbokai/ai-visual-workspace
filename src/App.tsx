import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MainLayout } from '@/components/layout/MainLayout';
import { CanvasLayout } from '@/components/layout/CanvasLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { PageSkeleton, CanvasSkeleton } from '@/components/ui/Skeleton';

// Lazy load pages with code splitting
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const CanvasPage = lazy(() => import('@/pages/CanvasPage').then(m => ({ default: m.CanvasPage })));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage').then(m => ({ default: m.TemplatesPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// Preload canvas page when user is on projects page (likely next navigation)
export function preloadCanvasPage() {
  import('@/pages/CanvasPage');
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// LoadingFallback kept as a named export for potential external use
export function LoadingFallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[var(--background)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-[var(--muted-foreground)]">加载中...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <HashRouter>
          <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AuthGuard />}>
                <Route element={<MainLayout />}>
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route element={<CanvasLayout />}>
                  <Route path="/canvas/:projectId" element={
                    <Suspense fallback={<CanvasSkeleton />}>
                      <CanvasPage />
                    </Suspense>
                  } />
                </Route>
                <Route path="/" element={<Navigate to="/projects" replace />} />
              </Route>
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </HashRouter>
        <ToastContainer />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
