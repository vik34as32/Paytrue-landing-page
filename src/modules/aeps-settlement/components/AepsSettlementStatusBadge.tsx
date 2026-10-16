import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  SUCCESS: { label: "Success", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: CheckCircle2 },
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-200", Icon: Clock },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-700 ring-red-200", Icon: XCircle },
};

export default function AepsSettlementStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const { Icon } = config;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {STATUS_CONFIG[status] ? config.label : status || config.label}
    </span>
  );
}
