"use client";

import Link from "next/link";
import { ArrowRight, IndianRupee, Loader2, Sparkles } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import type { CommissionWallet } from "@/src/types/commission";
import { commissionLedgerPath } from "@/src/lib/commissionUtils";

interface CommissionBalanceCardProps {
  role: "rt" | "dd" | "md";
  wallet?: CommissionWallet | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

export default function CommissionBalanceCard({
  role,
  wallet,
  loading = false,
  error = null,
  onRetry,
  className,
}: CommissionBalanceCardProps) {
  const href = commissionLedgerPath(role);
  const balance = wallet?.availableBalance ?? wallet?.balance ?? 0;

  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_12px_30px_rgba(16,185,129,0.18)]",
        className
      )}
    >
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-200/40 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
            <IndianRupee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700/80">
              Commission Wallet
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Tap to view full ledger</p>
          </div>
        </div>
        <Sparkles className="h-4 w-4 text-emerald-500 opacity-70" />
      </div>

      <div className="relative mt-5">
        {loading && !wallet ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading commission...
          </div>
        ) : error && !wallet ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-red-600">{error}</p>
            {onRetry ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRetry();
                }}
                className="text-xs font-semibold text-emerald-700 underline"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-3xl font-extrabold tracking-tight text-[#0b1f3a]">
            {formatCurrency(balance)}
          </p>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-between text-sm font-semibold text-emerald-700">
        <span>View ledger & top-up</span>
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
