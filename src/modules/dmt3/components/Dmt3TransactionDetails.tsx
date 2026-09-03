"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dmt3Transaction } from "../types/dmt3.types";
import {
  formatDmt3Date,
  formatDmt3Inr,
  isPendingLikeStatus,
} from "../utils/dmt3.utils";
import { Dmt3TxnStatusBadge } from "./Dmt3StatusBadge";

interface Dmt3TransactionDetailsProps {
  transaction: Dmt3Transaction;
  loading?: boolean;
  onEnquire?: () => void;
}

export default function Dmt3TransactionDetails({
  transaction,
  loading,
  onEnquire,
}: Dmt3TransactionDetailsProps) {
  const pending = isPendingLikeStatus(transaction.status);

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#0b1f3a]">Transaction Details</h3>
          <p className="mt-1 font-mono text-xs text-slate-500">{transaction.id}</p>
        </div>
        <Dmt3TxnStatusBadge status={transaction.status} />
      </div>

      <div className="mt-5 grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Detail label="Beneficiary" value={transaction.beneficiaryName} />
        <Detail label="Amount" value={formatDmt3Inr(transaction.amount)} />
        <Detail label="Transfer Mode" value={transaction.transferMode} />
        <Detail label="Total Debit" value={formatDmt3Inr(transaction.totalDebit ?? 0)} />
        <Detail label="Commission" value={formatDmt3Inr(transaction.commission ?? 0)} />
        <Detail label="Charges" value={formatDmt3Inr(transaction.charges ?? 0)} />
        <Detail label="UTR" value={transaction.utr || "—"} mono />
        <Detail label="Client Txn ID" value={transaction.clientTxnId || "—"} mono />
        <Detail label="Created" value={formatDmt3Date(transaction.createdAt)} />
        {transaction.updatedAt ? (
          <Detail label="Updated" value={formatDmt3Date(transaction.updatedAt)} />
        ) : null}
        {transaction.remarks ? (
          <Detail label="Remarks" value={transaction.remarks} />
        ) : null}
        {transaction.failureReason ? (
          <Detail label="Failure Reason" value={transaction.failureReason} />
        ) : null}
      </div>

      {pending && onEnquire && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={onEnquire} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Enquire Status
          </Button>
          <p className="text-xs text-amber-700">
            Pending transactions are verified via enquiry only — never resubmitted.
          </p>
        </div>
      )}
    </div>
  );
}

function Detail({
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
      <p
        className={`mt-1 text-sm font-semibold text-[#0b1f3a] ${mono ? "break-all font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
