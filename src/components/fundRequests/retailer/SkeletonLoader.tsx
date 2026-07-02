"use client";

interface SkeletonLoaderProps {
  rows?: number;
}

export default function SkeletonLoader({ rows = 5 }: SkeletonLoaderProps) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 h-14 w-56 rounded-xl bg-slate-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-11 rounded-xl bg-slate-100" />
          <div className="h-11 rounded-xl bg-slate-100 md:col-span-2" />
          <div className="h-24 rounded-xl bg-slate-100 md:col-span-2" />
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-6 w-48 rounded-lg bg-slate-100" />
          <div className="h-10 w-full max-w-xs rounded-xl bg-slate-100" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
