"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Wallet } from "lucide-react";
import UpiAppMark from "./UpiAppMark";
import { detectUpiApp, formatInr } from "../lib/upi-payout-normalizers";

export default function UpiTransferCard({
  vpa,
  payeeName,
  verified,
  amount,
  walletBalance,
}: {
  vpa: string;
  payeeName: string;
  verified: boolean;
  amount: number;
  walletBalance: number;
}) {
  const app = vpa.includes("@") ? detectUpiApp(vpa) : null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1630] via-[#1b1f5c] to-[#3b1d6e] p-5 text-white shadow-[0_24px_50px_-28px_rgba(59,29,110,0.9)]">
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-400/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-200">
            UPI transfer
          </p>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-200 ring-1 ring-white/15">
            INSTANT
          </span>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <Wallet className="h-5 w-5 text-emerald-200" />
          </div>
          <div>
            <p className="text-[11px] text-slate-300">From retailer wallet</p>
            <p className="text-sm font-bold tabular-nums">{formatInr(walletBalance)}</p>
          </div>
        </div>

        <div className="relative my-3 ml-5 h-10 border-l border-dashed border-white/25">
          <motion.span
            className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]"
            animate={{ y: [0, 30], opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex items-center gap-3">
          {vpa.includes("@") ? (
            <UpiAppMark vpa={vpa} />
          ) : (
            <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/20" />
          )}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={payeeName || "placeholder"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1 truncate text-sm font-bold"
              >
                {payeeName || "Beneficiary"}
                {verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-300" /> : null}
              </motion.p>
            </AnimatePresence>
            <p className="truncate font-mono text-xs text-slate-300">{vpa || "name@upi"}</p>
            {app ? <p className="text-[10px] text-violet-200">{app.name}</p> : null}
          </div>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300">Sending</p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={amount}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="text-3xl font-extrabold tabular-nums tracking-tight"
            >
              {formatInr(amount)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
