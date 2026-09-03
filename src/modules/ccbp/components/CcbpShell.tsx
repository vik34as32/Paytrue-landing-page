"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, History, ShieldCheck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRetailerWallet } from "@/features/retailer/hooks/useRetailerWallet";
import { formatInr } from "../lib/ccbp-normalizers";

const NAV = [
  { label: "Pay bill", href: "/rt/retailer/credit-card", icon: CreditCard },
  { label: "History", href: "/rt/retailer/credit-card/history", icon: History },
];

export default function CcbpShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const { balance, loading } = useRetailerWallet();

  return (
    <div className="space-y-5">
      <header className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[#071427] text-white shadow-[0_18px_40px_-24px_rgba(7,20,39,0.8)]">
        <div className="relative px-5 py-5 sm:px-6">
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-indigo-500/20 blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-56 bg-amber-400/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
                  Bill payments
                </p>
                <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                  Credit Card Bill
                </h1>
                <p className="mt-1 max-w-xl text-xs text-slate-300 sm:text-sm">
                  Structured, MPIN-secured settlement. Wallet debit is instant on successful pay.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
                NiFi CCBP
              </div>
            </div>
          </div>
          <nav className="relative mt-4 flex gap-1 border-t border-white/10 pt-3">
            {NAV.map((item) => {
              const active =
                item.href === "/rt/retailer/credit-card"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "bg-white text-[#0b1f3a] shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
