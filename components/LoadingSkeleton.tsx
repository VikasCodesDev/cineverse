// components/LoadingSkeleton.tsx
// Loading skeleton animations for better UX
'use client';

export function SeriesCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      {/* Poster skeleton */}
      <div className="relative aspect-[2/3] skeleton" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-6 skeleton rounded" />
        <div className="h-4 skeleton rounded w-3/4" />
        <div className="h-4 skeleton rounded w-1/2" />
      </div>
    </div>
  );
}

export function SeriesGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SeriesCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero section skeleton */}
      <div className="relative">
        <div className="h-[500px] skeleton rounded-2xl" />
      </div>

      {/* Content skeleton */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-12 skeleton rounded w-3/4" />
        <div className="h-6 skeleton rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-4 skeleton rounded" />
          <div className="h-4 skeleton rounded" />
          <div className="h-4 skeleton rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}
