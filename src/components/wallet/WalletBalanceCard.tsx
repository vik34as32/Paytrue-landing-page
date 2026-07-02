"use client";

import { memo } from "react";
import { Wallet, Lock, CircleDollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { WalletRoleState } from "@/types/wallet";

interface WalletBalanceCardProps {
  wallet: WalletRoleState;
  userName?: string;
  userId?: string;
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN");
}

function WalletBalanceCard({ wallet, userName, userId }: WalletBalanceCardProps) {
  const loading = wallet.loading;

  const stats = [
    {
      label: "Current Balance",
      value: wallet.currentBalance,
      icon: Wallet,
      accent: "from-[#18335D] to-[#1F6BFF]",
    },
    {
      label: "Available Balance",
      value: wallet.availableBalance,
      icon: CircleDollarSign,
      accent: "from-emerald-600 to-emerald-500",
    },
    {
      label: "Hold Balance",
      value: wallet.holdBalance,
      icon: Lock,
      accent: "from-amber-500 to-orange-500",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0b1f3a] via-[#18335D] to-[#1565d8] p-6 text-white shadow-xl sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
              PayTrue Wallet
            </p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{userName || "Account"}</h2>
            {userId && <p className="mt-1 text-sm text-white/70">ID: {userId}</p>}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/80">
            <Clock className="h-3.5 w-3.5" />
            Last updated: {loading ? "Refreshing..." : formatDateTime(wallet.lastUpdated)}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent} shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                      {stat.label}
                    </p>
                    <p className="truncate text-lg font-bold sm:text-xl">
                      {loading ? (
                        <span className="inline-block h-6 w-24 animate-pulse rounded bg-white/20" />
                      ) : (
                        formatCurrency(stat.value)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(WalletBalanceCard);
