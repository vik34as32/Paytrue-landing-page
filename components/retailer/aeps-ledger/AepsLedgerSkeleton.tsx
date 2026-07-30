"use client";

export function AepsLedgerSkeleton() {
  return (
    <div className="space-y-3 px-4 py-6 md:px-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
        >
          <div className="h-4 w-8 rounded bg-slate-200" />
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="h-4 flex-1 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 w-24 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
