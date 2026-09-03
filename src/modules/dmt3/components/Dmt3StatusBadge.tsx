"use client";

import { cn } from "@/lib/utils";
import type { Dmt3TxnStatus, Dmt3VerificationStatus } from "../types/dmt3.types";

const TXN_STYLES: Record<Dmt3TxnStatus, string> = {
  SUCCESS: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  PROCESSING: "bg-blue-50 text-blue-700 ring-blue-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  REFUNDED: "bg-violet-50 text-violet-700 ring-violet-200",
  REVERSED: "bg-slate-100 text-slate-700 ring-slate-200",
};

const VERIFY_STYLES: Record<Dmt3VerificationStatus, string> = {
  VERIFIED: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  UNVERIFIED: "bg-slate-100 text-slate-600",
  FAILED: "bg-red-50 text-red-700",
};

export function Dmt3TxnStatusBadge({ status }: { status: Dmt3TxnStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset",
        TXN_STYLES[status] ?? TXN_STYLES.PENDING
      )}
    >
      {status}
    </span>
  );
}

export function Dmt3VerifyStatusBadge({
  status,
}: {
  status: Dmt3VerificationStatus;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
        VERIFY_STYLES[status] ?? VERIFY_STYLES.PENDING
      )}
    >
      {status}
    </span>
  );
}
