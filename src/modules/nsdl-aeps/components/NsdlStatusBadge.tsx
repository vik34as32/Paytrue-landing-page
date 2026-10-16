import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PROCESSING: "bg-amber-50 text-amber-700 ring-amber-200",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-200",
  REFUNDED: "bg-sky-50 text-sky-700 ring-sky-200",
};

export default function NsdlStatusBadge({ status }: { status: string }) {
  const key = String(status || "").toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ring-1",
        STYLES[key] ?? "bg-slate-100 text-slate-600 ring-slate-200"
      )}
    >
      {key || "UNKNOWN"}
    </span>
  );
}
