"use client";

import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dmt3Transaction } from "../types/dmt3.types";
import { formatDmt3Date, formatDmt3Inr, isPendingLikeStatus } from "../utils/dmt3.utils";
import { Dmt3TxnStatusBadge } from "./Dmt3StatusBadge";

interface Dmt3TransactionStatusProps {
  transaction: Dmt3Transaction;
  loading?: boolean;
  onEnquire?: () => void;
  onNewTransfer: () => void;
}

export default function Dmt3TransactionStatus({
  transaction,
  loading,
  onEnquire,
  onNewTransfer,
}: Dmt3TransactionStatusProps) {
  const pending = isPendingLikeStatus(transaction.status);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#0b1f3a]">Transaction Status</h3>
          <p className="mt-1 text-xs text-slate-500">
            {formatDmt3Date(transaction.createdAt)}
          </p>
        </div>
        <Dmt3TxnStatusBadge status={transaction.status} />
      </div>

      <div className="mt-5 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Transaction ID" value={transaction.id} mono />
        <Info label="Beneficiary" value={transaction.beneficiaryName} />
        <Info label="Amount" value={formatDmt3Inr(transaction.amount)} />
        <Info label="Mode" value={transaction.transferMode} />
        <Info label="UTR" value={transaction.utr || "—"} mono />
        {transaction.failureReason ? (
          <Info label="Reason" value={transaction.failureReason} />
        ) : null}
      </div>

      {pending && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Transaction is pending. Use status enquiry — do not resubmit the payout.
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {pending && onEnquire && (
          <Button variant="outline" onClick={onEnquire} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Check Status
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href={`/rt/retailer/dmt3/transactions/${encodeURIComponent(transaction.id)}`}>
            View Details
          </Link>
        </Button>
        <Button onClick={onNewTransfer}>New Transfer</Button>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-sm font-semibold text-[#0b1f3a] ${mono ? "font-mono text-xs break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}
