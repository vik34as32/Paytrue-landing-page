"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function KycBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-orange-50/80 to-amber-50"
      style={{ boxShadow: "0 4px 20px rgba(245, 124, 0, 0.1)" }}
    >
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-300/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3.5">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-200">
            <ShieldAlert className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              !
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-amber-900">
                KYC Verification Required
              </h3>
              <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Action Needed
              </span>
            </div>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-amber-800/80">
              Complete your KYC to unlock ₹2,00,000 daily limit, instant
              settlements, and all premium banking services.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-amber-700/70">
              <AlertTriangle className="h-3.5 w-3.5" />
              Current limit: ₹50,000/day without KYC
            </div>
          </div>
        </div>

        <Button
          asChild
          className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 shadow-lg shadow-orange-200/50 transition hover:shadow-xl hover:brightness-105"
        >
          <Link href="/rt/retailer/profile">
            Complete KYC Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
