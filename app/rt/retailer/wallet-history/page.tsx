"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import RetailerWalletHistoryTable from "@/src/components/wallet/retailer/RetailerWalletHistoryTable";

export default function WalletHistoryPage() {
  return (
    <div className="min-w-0 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start gap-4"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#001F5B] dark:text-white">
            Wallet History
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Track all wallet credits and debits. Use Add Balance to submit a fund
            request and top up your retailer wallet.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="min-w-0"
      >
        <RetailerWalletHistoryTable />
      </motion.div>
    </div>
  );
}
