"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-600",
  PENDING: "bg-amber-50 text-amber-700",
  REFUNDED: "bg-sky-50 text-sky-700",
  REVERSED: "bg-violet-50 text-violet-700",
};

export function AepsLedgerStatusBadge({ status }: { status: string }) {
  const value = String(status || "").toUpperCase();
  const tone = STATUS_STYLES[value] || "bg-slate-100 text-slate-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        tone
      )}
    >
      {value || "—"}
    </span>
  );
}
