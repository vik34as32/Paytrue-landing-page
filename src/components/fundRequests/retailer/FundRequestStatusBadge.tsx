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
  { bg: string; text: string; dot?: string; pulse?: boolean }
> = {
  pending: {
    bg: "bg-blue-600",
    text: "text-white",
  },
  processing: {
    bg: "bg-orange-500",
    text: "text-white",
  },
  approved: {
    bg: "bg-emerald-600",
    text: "text-white",
  },
  rejected: {
    bg: "bg-red-600",
    text: "text-white",
  },
  declined: {
    bg: "bg-red-600",
    text: "text-white",
  },
  cancelled: {
    bg: "bg-slate-500",
    text: "text-white",
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
        "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide shadow-sm",
        styles.bg,
        styles.text,
        className
      )}
    >
      {formatStatusLabel(normalized)}
    </motion.span>
  );
}
