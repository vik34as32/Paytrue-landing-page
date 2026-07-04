"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STYLES = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  unverified: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function DmtStatusBadge({
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
    <Badge variant="outline" className={cn("capitalize", style, className)}>
      {label}
    </Badge>
  );
}
