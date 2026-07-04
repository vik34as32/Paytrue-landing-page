"use client";

interface SkeletonLoaderProps {
  rows?: number;
}

export default function SkeletonLoader({ rows = 5 }: SkeletonLoaderProps) {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="space-y-4 border-b border-slate-100 p-6 dark:border-slate-800">
        <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-10 w-full max-w-sm rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="space-y-3 p-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
