"use client";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReceiptViewModel } from "@/types/statementReceipt";

interface SuccessCardProps {
  receipt: ReceiptViewModel;
}

export default function SuccessCard({ receipt }: SuccessCardProps) {
  const isSuccess = receipt.status === "success";
  const isPending = receipt.status === "pending";

  const StatusIcon = isSuccess ? CheckCircle2 : isPending ? Clock3 : XCircle;

  const cardStyles = isSuccess
    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
    : isPending
      ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
      : "border-red-200 bg-gradient-to-br from-red-50 to-white";

  const iconStyles = isSuccess
    ? "bg-emerald-100 text-[#16A34A]"
    : isPending
      ? "bg-amber-100 text-amber-600"
      : "bg-red-100 text-red-600";

  const subtitle = isSuccess
    ? "Your transaction has been successfully completed."
    : isPending
      ? "Your transaction is being processed. Please check back shortly."
      : "Your transaction could not be completed. Contact support if debited.";

  return (
    <section
      className={cn(
        "receipt-success-card receipt-no-print rounded-2xl border px-5 py-5 text-center shadow-sm",
        cardStyles
      )}
    >
      <div
        className={cn(
          "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full",
          iconStyles
        )}
      >
        <StatusIcon className="h-7 w-7" strokeWidth={2.25} />
      </div>
      <h2
        className={cn(
          "text-lg font-bold sm:text-xl",
          isSuccess && "text-[#16A34A]",
          isPending && "text-amber-700",
          !isSuccess && !isPending && "text-red-600"
        )}
      >
        {receipt.statusLabel}
      </h2>
      <p className="mx-auto mt-1 max-w-md text-xs text-slate-600 sm:text-sm">
        {subtitle}
      </p>
      <p className="mt-3 bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-2xl font-extrabold tabular-nums text-transparent sm:text-3xl">
        {formatCurrency(receipt.amount)}
      </p>
    </section>
  );
}
