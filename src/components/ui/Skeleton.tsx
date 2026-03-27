import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/** Base skeleton pulse block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--muted)]',
        className,
      )}
    />
  );
}

/** Full-page loading skeleton for lazy-loaded pages */
export function PageSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--background)] p-6">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-32 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-8 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="flex-1 grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Canvas page loading skeleton */
export function CanvasSkeleton() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--background)]">
      {/* Top bar */}
      <div className="h-14 border-b border-[var(--border)] flex items-center px-4 gap-4">
        <Skeleton className="w-6 h-6" />
        <Skeleton className="w-24 h-5" />
        <div className="flex-1" />
        <Skeleton className="w-48 h-8 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="w-16 h-5" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-16 border-r border-[var(--border)] flex flex-col items-center py-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-10 h-10 rounded-lg" />
          ))}
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[var(--muted-foreground)]">Loading canvas...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-12 border-t border-[var(--border)] flex items-center px-4 gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="w-12 h-4" />
      </div>
    </div>
  );
}

/** Project card skeleton for grid view */
export function ProjectCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-[var(--card)]">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/** Project list item skeleton */
export function ProjectListSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-xl bg-[var(--card)]">
      <Skeleton className="w-16 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
    </div>
  );
}

/** Node card skeleton for panel lists */
export function NodeCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <Skeleton className="h-1 w-full rounded-none" />
      <Skeleton className="w-full h-32 rounded-none" />
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-3.5 h-3.5 rounded" />
          <Skeleton className="w-20 h-3" />
        </div>
        <Skeleton className="w-16 h-2.5" />
      </div>
    </div>
  );
}

/** Chat message skeleton */
export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
      </div>
    </div>
  );
}

/** Properties panel skeleton */
export function PropertiesPanelSkeleton() {
  return (
    <div className="w-72 border-l border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
      <Skeleton className="w-32 h-5" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>
        ))}
      </div>
      <Skeleton className="w-full h-px" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-full h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
