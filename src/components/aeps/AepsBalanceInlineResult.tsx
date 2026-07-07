"use client";

import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface AepsBalanceInlineResultProps {
  result: AepsTransactionResult;
}

export default function AepsBalanceInlineResult({
  result,
}: AepsBalanceInlineResultProps) {
  const bankBalance = result.bankAccountBalance ?? result.balance;

  if (bankBalance == null) return null;

  return (
    <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Bank Account Balance
          </p>
          <p className="mt-1 text-3xl font-bold leading-none text-emerald-950 sm:text-4xl">
            {formatCurrency(bankBalance)}
          </p>
          <div className="mt-2 space-y-0.5 text-sm text-emerald-800">
            {result.bankName ? <p>{result.bankName}</p> : null}
            {result.accountNumber ? (
              <p className="text-emerald-700">A/c {result.accountNumber}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
