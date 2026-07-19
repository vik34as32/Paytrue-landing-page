"use client";

import { motion } from "framer-motion";
import { Landmark, ArrowRightLeft } from "lucide-react";
import BankDetailsPanel from "@/src/components/fundRequests/retailer/BankDetailsPanel";

export default function BankDetailsPage() {
  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-[0_8px_28px_rgba(11,31,58,0.08)]"
      >
        <div className="bg-gradient-to-r from-[#0b2a4a] via-[#0e3a63] to-[#1565d8] px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-start gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100/90">
                Fund deposit · Company accounts
              </p>
              <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Bank Details
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-blue-100/85">
                Transfer funds only to these official PayTrue accounts. Match the
                bank logo, copy account number / IFSC, then raise a fund request
                with payment proof.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-white/15">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              NEFT / IMPS / RTGS
            </div>
          </div>
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="rounded-2xl border border-slate-200/80 bg-[#f4f7fb] p-3.5 shadow-sm sm:p-5"
      >
        <BankDetailsPanel />
      </motion.div>
    </div>
  );
}
