"use client";

import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maskAccountNumber } from "@/src/lib/fundRequestUtils";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

interface SelectedBankSummaryProps {
  account: CompanyBankAccount | null;
  onChangeAccount: () => void;
}

export default function SelectedBankSummary({
  account,
  onChangeAccount,
}: SelectedBankSummaryProps) {
  if (!account) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
          No bank account selected
        </p>
        <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">
          Go to Bank Details and select a company account before submitting a fund request.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3 border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200"
          onClick={onChangeAccount}
        >
          Select Account
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#1565d8]/25 bg-gradient-to-br from-blue-50/80 to-white p-4 shadow-sm dark:border-blue-800/40 dark:from-blue-950/30 dark:to-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1565d8] text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#1565d8]">
              Selected Account
            </p>
            <p className="mt-0.5 text-sm font-bold uppercase text-[#001F5B] dark:text-white">
              {account.accountHolderName}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {account.bankName}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
              <span className="font-mono font-semibold">
                {maskAccountNumber(account.accountNumber)}
              </span>
              <span>
                IFSC{" "}
                <span className="font-mono font-semibold">{account.ifscCode}</span>
              </span>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 self-start border-[#1565d8]/30 text-[#1565d8] hover:bg-blue-50"
          onClick={onChangeAccount}
        >
          Change Account
        </Button>
      </div>
    </div>
  );
}
