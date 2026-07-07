"use client";

import { CheckCircle2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface AepsBalanceResultCardProps {
  result: AepsTransactionResult;
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className="break-all text-sm font-medium text-slate-800">{value}</span>
    </div>
  );
}

export default function AepsBalanceResultCard({ result }: AepsBalanceResultCardProps) {
  const bankBalance = result.bankAccountBalance ?? result.balance;

  if (bankBalance == null) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
      <div className="border-b border-emerald-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-emerald-900">
              Balance Enquiry Successful
            </p>
            <p className="mt-0.5 text-sm text-emerald-700/90">
              {result.message || "Customer bank account balance fetched successfully."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="rounded-xl border border-emerald-300/80 bg-white px-5 py-4 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80">
            Bank Account Balance
          </p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-emerald-950">
            {formatCurrency(bankBalance)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Wallet className="h-4 w-4 text-[#1565d8]" />
            Account Details
          </div>
          <div className="space-y-2.5">
            {result.bankName ? <DetailRow label="Bank" value={result.bankName} /> : null}
            {result.accountNumber ? (
              <DetailRow label="Account Number" value={result.accountNumber} />
            ) : null}
            {result.aadhaarNumber ? (
              <DetailRow label="Aadhaar" value={result.aadhaarNumber} />
            ) : null}
            {result.referenceId ? (
              <DetailRow label="Reference ID" value={result.referenceId} />
            ) : null}
            {result.transactionId ? (
              <DetailRow label="Transaction ID" value={result.transactionId} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
