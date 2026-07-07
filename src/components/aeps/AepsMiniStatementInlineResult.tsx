"use client";

import { ListOrdered } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AepsMiniStatementTable from "@/src/components/aeps/AepsMiniStatementTable";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface AepsMiniStatementInlineResultProps {
  result: AepsTransactionResult;
}

export default function AepsMiniStatementInlineResult({
  result,
}: AepsMiniStatementInlineResultProps) {
  const rows = result.miniStatement ?? [];
  const bankBalance = result.bankAccountBalance ?? result.balance;

  return (
    <div className="overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/80 to-white">
      <div className="flex items-start justify-between gap-3 border-b border-blue-100 px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <ListOrdered className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Mini Statement
            </p>
            {result.bankName ? (
              <p className="truncate text-sm font-medium text-slate-800">{result.bankName}</p>
            ) : null}
            {result.accountNumber ? (
              <p className="text-xs text-slate-600">A/c {result.accountNumber}</p>
            ) : null}
          </div>
        </div>
        {bankBalance != null ? (
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
              Balance
            </p>
            <p className="text-xl font-bold leading-tight text-blue-950">
              {formatCurrency(bankBalance)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="max-h-[260px] overflow-y-auto px-3 py-3">
        <AepsMiniStatementTable rows={rows} compact />
      </div>

      {result.referenceId ? (
        <p className="border-t border-blue-100 px-4 py-2 text-center text-[10px] text-slate-400">
          Ref: {result.referenceId}
        </p>
      ) : null}
    </div>
  );
}
