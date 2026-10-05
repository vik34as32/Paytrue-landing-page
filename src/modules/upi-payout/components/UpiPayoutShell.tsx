"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { History, SendHorizontal, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetailerWallet } from "@/features/retailer/hooks/useRetailerWallet";
import { formatInr } from "../lib/upi-payout-normalizers";

const BASE = "/rt/retailer/upi-payout";

const NAV = [
  { label: "Send money", href: BASE, icon: SendHorizontal },
  { label: "History", href: `${BASE}/history`, icon: History },
];

function FlowAnimation() {
  return (
    <div className="relative hidden h-16 w-56 items-center justify-between md:flex">
      <div className="z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
        <Wallet className="h-5 w-5 text-emerald-200" />
      </div>
      <div className="absolute inset-x-12 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-emerald-300/40 via-white/30 to-violet-300/40" />
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="absolute left-12 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]"
          animate={{ x: [0, 136], opacity: [0, 1, 1, 0], scale: [0.6, 1, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.6, ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20"
        animate={{ boxShadow: ["0 0 0 0 rgba(167,139,250,0)", "0 0 0 8px rgba(167,139,250,0.15)", "0 0 0 0 rgba(167,139,250,0)"] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        <Smartphone className="h-5 w-5 text-violet-200" />
      </motion.div>
    </div>
  );
}

export default function UpiPayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { balance, loading } = useRetailerWallet();

  return (
    <div className="space-y-5">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[#0a1630] text-white shadow-[0_18px_40px_-24px_rgba(10,22,48,0.85)]"
      >
        <div className="relative px-5 py-5 sm:px-6">
          <motion.div
            className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-violet-500/25 blur-3xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-10 left-1/4 h-28 w-64 rounded-full bg-emerald-400/15 blur-3xl"
            animate={{ x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-violet-600 shadow-lg shadow-violet-900/40">
                <SendHorizontal className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                  Money transfer
                </p>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">UPI Payout</h1>
                <p className="mt-1 max-w-xl text-xs text-slate-300 sm:text-sm">
                  Send wallet balance to any UPI ID in seconds — verified payee, MPIN secured.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FlowAnimation />
              <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/10">
                <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                  <Wallet className="h-3 w-3" />
                  Wallet
                </p>
                <p className="text-sm font-bold tabular-nums">
                  {loading ? "…" : formatInr(Number(balance) || 0)}
                </p>
              </div>
              <div className="hidden items-center gap-1.5 rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 ring-1 ring-emerald-400/20 sm:flex">
                <ShieldCheck className="h-3.5 w-3.5" />
                NPCI UPI
              </div>
            </div>
          </div>
          <nav className="relative mt-4 flex gap-1 border-t border-white/10 pt-3">
            {NAV.map((item) => {
              const active =
                item.href === BASE
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    active ? "text-[#0a1630]" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="upi-payout-nav"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <Icon className="relative h-3.5 w-3.5" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </motion.header>
      {children}
    </div>
  );
}
