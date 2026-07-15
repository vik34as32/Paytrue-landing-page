"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchCommissionWallet } from "@/src/services/commissionService";
import type { CommissionWallet } from "@/src/types/commission";

const COMMISSION_UPDATED_EVENT = "paytrue:commission-updated";

interface PortalCommissionBalanceProps {
  href: string;
  compact?: boolean;
  className?: string;
}

export default function PortalCommissionBalance({
  href,
  compact = false,
  className = "",
}: PortalCommissionBalanceProps) {
  const [wallet, setWallet] = useState<CommissionWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchCommissionWallet();
      setWallet(data);
    } catch (err) {
      setError(
        (err as { message?: string })?.message || "Failed to load commission"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void load();

    const onUpdate = () => {
      void load();
    };

    window.addEventListener(COMMISSION_UPDATED_EVENT, onUpdate);
    window.addEventListener("focus", onUpdate);
    return () => {
      window.removeEventListener(COMMISSION_UPDATED_EVENT, onUpdate);
      window.removeEventListener("focus", onUpdate);
    };
  }, [load]);

  const balance = wallet?.availableBalance ?? wallet?.balance ?? 0;

  if (compact) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/80 px-3 py-2 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 ${className}`}
        title="View commission ledger"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80">
            Commission
          </p>
          {loading && !wallet ? (
            <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-emerald-600" />
          ) : (
            <p className="truncate text-sm font-bold text-emerald-800">
              {error && !wallet ? "—" : formatCurrency(balance)}
            </p>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`mt-2 block rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-2.5 transition hover:border-emerald-200 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80">
        Commission Wallet
      </p>
      {loading && !wallet ? (
        <div className="mt-1 flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <span className="text-xs text-slate-400">Loading...</span>
        </div>
      ) : (
        <p className="mt-0.5 text-base font-bold text-emerald-700">
          {error && !wallet ? "—" : formatCurrency(balance)}
        </p>
      )}
      <p className="mt-0.5 text-[10px] font-medium text-emerald-600/80">
        Tap for ledger & top-up
      </p>
    </Link>
  );
}
