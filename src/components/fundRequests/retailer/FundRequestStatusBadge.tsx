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
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    pulse: true,
  },
  processing: {
    bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    pulse: true,
  },
  approved: {
    bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  rejected: {
    bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  cancelled: {
    bg: "bg-slate-100 border-slate-200 dark:bg-slate-800 dark:border-slate-700",
    text: "text-slate-600 dark:text-slate-300",
    dot: "bg-slate-400",
  },
};

function formatStatusLabel(status: string) {
  if (status === "pending") return "Pending";
  if (status === "processing") return "Processing";
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Declined";
  if (status === "cancelled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
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
      {formatStatusLabel(normalized)}
    </motion.span>
  );
}
