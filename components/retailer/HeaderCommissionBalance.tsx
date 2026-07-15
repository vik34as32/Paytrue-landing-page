"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchCommissionWallet } from "@/src/services/commissionService";
import { commissionLedgerPath } from "@/src/lib/commissionUtils";

export const COMMISSION_UPDATED_EVENT = "paytrue:commission-updated";

export function notifyCommissionUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COMMISSION_UPDATED_EVENT));
}

export default function HeaderCommissionBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const wallet = await fetchCommissionWallet();
      setBalance(wallet.availableBalance ?? wallet.balance ?? 0);
    } catch {
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const onUpdate = () => {
      void load();
    };
    const onFocus = () => {
      void load();
    };

    window.addEventListener(COMMISSION_UPDATED_EVENT, onUpdate);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(COMMISSION_UPDATED_EVENT, onUpdate);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const displayAmount =
    loading && balance == null
      ? null
      : balance == null
        ? "—"
        : formatCurrency(balance);

  return (
    <Link
      href={commissionLedgerPath("rt")}
      className="flex h-10 min-w-0 max-w-[140px] items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-teal-50 px-2 shadow-sm transition hover:border-emerald-300 hover:shadow-md sm:max-w-none sm:gap-2 sm:px-2.5"
      title="View commission ledger"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <IndianRupee className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="hidden text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80 sm:block">
          Commission
        </p>
        {loading && balance == null ? (
          <div className="mt-0.5 h-3.5 w-14 animate-pulse rounded bg-emerald-100 sm:w-16" />
        ) : (
          <p className="truncate text-[11px] font-bold leading-tight text-emerald-800 sm:text-xs">
            {displayAmount ?? formatCurrency(0)}
          </p>
        )}
      </div>
    </Link>
  );
}
