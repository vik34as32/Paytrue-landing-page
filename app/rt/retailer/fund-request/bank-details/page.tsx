"use client";

import { motion } from "framer-motion";
import { Landmark } from "lucide-react";
import BankDetailsPanel from "@/src/components/fundRequests/retailer/BankDetailsPanel";

export default function BankDetailsPage() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start gap-4"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E67E22] to-[#D35400] text-white shadow-lg">
          <Landmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#001F5B] dark:text-white">
            Bank Details
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Use these official company accounts to deposit funds. Transfer to any
            account below, then submit a fund request with payment proof.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <BankDetailsPanel />
      </motion.div>
    </div>
  );
}
