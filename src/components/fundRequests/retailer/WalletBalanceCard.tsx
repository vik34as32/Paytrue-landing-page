"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface WalletBalanceCardProps {
  balance: number;
  loading?: boolean;
  className?: string;
}

export default function WalletBalanceCard({
  balance,
  loading = false,
  className,
}: WalletBalanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 shadow-sm",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-200">
        <Wallet className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700/80">
          Wallet Balance
        </p>
        {loading ? (
          <div className="mt-1 h-6 w-28 animate-pulse rounded-md bg-emerald-200/60" />
        ) : (
          <p className="text-lg font-bold tabular-nums text-emerald-700">
            {formatCurrency(balance)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
