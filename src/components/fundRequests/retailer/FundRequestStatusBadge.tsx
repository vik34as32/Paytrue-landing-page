"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { FundRequestStatus } from "@/src/types/fundRequest";

interface FundRequestStatusBadgeProps {
  status: FundRequestStatus | string;
  className?: string;
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string; pulse?: boolean }
> = {
  pending: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
    pulse: true,
  },
  approved: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  rejected: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  cancelled: {
    bg: "bg-slate-100 border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
};

export default function FundRequestStatusBadge({
  status,
  className,
}: FundRequestStatusBadgeProps) {
  const normalized = String(status || "pending").toLowerCase();
  const styles = STATUS_STYLES[normalized] ?? STATUS_STYLES.pending;

  return (
    <motion.span
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
        styles.bg,
        styles.text,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {styles.pulse && (
          <span
            className={cn(
              "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
              styles.dot
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", styles.dot)} />
      </span>
      {normalized}
    </motion.span>
  );
}
