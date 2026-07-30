"use client";

import { Loader2, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAepsWalletBalance } from "@/src/hooks/useAepsWalletBalance";

/** Compact live AEPS wallet balance — shown on AEPS transaction pages. */
export default function AepsWalletBalanceChip() {
  const { balance, loading, isFetching } = useAepsWalletBalance();

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1565d8]/10 text-[#1565d8]">
        <Wallet className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          AEPS Wallet
        </p>
        {loading ? (
          <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-slate-400" />
        ) : (
          <p className="text-sm font-bold tabular-nums text-[#0b1f3a]">
            {formatCurrency(balance ?? 0)}
            {isFetching ? (
              <Loader2 className="ml-1.5 inline h-3 w-3 animate-spin text-slate-400" />
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}
