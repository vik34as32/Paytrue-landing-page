"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_VARIANTS = {
  active: "success",
  inactive: "secondary",
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  success: "success",
  failed: "destructive",
};

export default function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const variant = STATUS_VARIANTS[normalized] || "secondary";
  const label =
    normalized === "success"
      ? "Success"
      : normalized === "pending"
        ? "Pending"
        : normalized === "failed"
          ? "Failed"
          : status || "—";

  return (
    <Badge variant={variant} className="shrink-0 whitespace-nowrap capitalize">
      {label}
    </Badge>
  );
}
