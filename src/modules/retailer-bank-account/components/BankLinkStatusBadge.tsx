import { CheckCircle2, Clock, Link2Off, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  LINKED: { label: "Linked", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", Icon: CheckCircle2 },
  PENDING: { label: "Pending confirmation", className: "bg-amber-50 text-amber-700 ring-amber-200", Icon: Clock },
  FAILED: { label: "Failed", className: "bg-red-50 text-red-700 ring-red-200", Icon: XCircle },
  NOT_LINKED: { label: "Not linked", className: "bg-slate-100 text-slate-600 ring-slate-200", Icon: Link2Off },
};

export default function BankLinkStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_LINKED;
  const { Icon } = config;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}
