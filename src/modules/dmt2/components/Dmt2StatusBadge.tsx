"use client";

import { cn } from "@/lib/utils";

const STYLES = {
  success: "bg-violet-50 text-violet-800 border-violet-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  failed: "bg-rose-50 text-rose-700 border-rose-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
  reversed: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function Dmt2StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const key = status?.toLowerCase() as keyof typeof STYLES;
  const style = STYLES[key] ?? STYLES.pending;
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
