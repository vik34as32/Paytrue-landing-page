"use client";

import { cn } from "@/lib/utils";
import type { CcbpStatus } from "../types";

const STYLES: Record<CcbpStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  PROCESSING: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  FAILED: "bg-rose-50 text-rose-800 ring-rose-200",
  REFUNDED: "bg-slate-100 text-slate-700 ring-slate-200",
  REVERSED: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function CcbpStatusBadge({ status }: { status: CcbpStatus | string }) {
  const key = (status || "PENDING").toUpperCase() as CcbpStatus;
  const style = STYLES[key] ?? STYLES.PENDING;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        style
      )}
    >
      {key}
    </span>
  );
}
