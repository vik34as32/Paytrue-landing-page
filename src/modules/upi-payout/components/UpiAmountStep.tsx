"use client";

import { motion } from "framer-motion";
import { IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatInr,
  UPI_PAYOUT_MAX_AMOUNT,
  UPI_PAYOUT_MIN_AMOUNT,
} from "../lib/upi-payout-normalizers";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 25000];

export default function UpiAmountStep({
  amount,
  onAmount,
  walletBalance,
  error,
}: {
  amount: string;
  onAmount: (value: string) => void;
  walletBalance: number;
  error: string;
}) {
  const value = Number(amount) || 0;
  const usage = walletBalance > 0 ? Math.min(100, (value / walletBalance) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0a1630]">How much to send?</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          {formatInr(UPI_PAYOUT_MIN_AMOUNT)} – {formatInr(UPI_PAYOUT_MAX_AMOUNT)} per transfer. Debited from your wallet.
        </p>
      </div>

      <div
        className={cn(
          "rounded-3xl border bg-gradient-to-b from-slate-50 to-white px-5 py-6 text-center transition",
          error ? "border-rose-300" : "border-slate-200"
        )}
      >
        <div className="flex items-center justify-center gap-1">
          <IndianRupee className="h-8 w-8 text-slate-400" strokeWidth={2.5} />
          <input
            value={amount}
            inputMode="decimal"
            autoFocus
            onChange={(event) => {
              const next = event.target.value.replace(/[^\d.]/g, "");
              if (/^\d{0,6}(\.\d{0,2})?$/.test(next)) onAmount(next);
            }}
            placeholder="0"
            aria-label="Amount"
            className="w-full max-w-[260px] bg-transparent text-center text-5xl font-extrabold tabular-nums tracking-tight text-[#0a1630] outline-none placeholder:text-slate-300"
          />
        </div>
        <div className="mx-auto mt-4 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className={cn(
              "h-full rounded-full",
              usage >= 100 ? "bg-rose-500" : usage > 75 ? "bg-amber-500" : "bg-gradient-to-r from-emerald-400 to-violet-500"
            )}
            animate={{ width: `${usage}%` }}
            transition={{ type: "spring", stiffness: 160, damping: 22 }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Wallet balance <span className="font-semibold tabular-nums text-slate-700">{formatInr(walletBalance)}</span>
        </p>
        {error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm font-medium text-rose-600"
          >
            {error}
          </motion.p>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {QUICK_AMOUNTS.map((quick, index) => {
          const active = value === quick;
          return (
            <motion.button
              key={quick}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAmount(String(quick))}
              className={cn(
                "rounded-xl px-2 py-2.5 text-sm font-bold tabular-nums ring-1 transition-colors",
                active
                  ? "bg-[#0a1630] text-white ring-[#0a1630]"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-violet-300"
              )}
            >
              ₹{quick.toLocaleString("en-IN")}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
