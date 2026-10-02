"use client";

import { BadgeCheck, ShieldAlert } from "lucide-react";
import { BankLogo } from "@/components/retailer/BankLogo";
import { cn } from "@/lib/utils";
import { formatAccountNumber, ifscPrefix, resolveDmt2BankName } from "../lib/dmt2-bank";
import type { Dmt2Beneficiary } from "../types";

interface Dmt2BeneficiaryCardProps {
  beneficiary: Dmt2Beneficiary;
  className?: string;
}

export default function Dmt2BeneficiaryCard({ beneficiary, className }: Dmt2BeneficiaryCardProps) {
  const bankName = resolveDmt2BankName(beneficiary);
  const accountNumber = beneficiary.accountNumber || beneficiary.accountMasked || "";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1f3a] via-[#1a2f6b] to-[#4c1d95] p-5 text-white shadow-[0_18px_40px_-18px_rgba(30,27,75,0.75)] sm:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-violet-400/20 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md ring-1 ring-white/40">
            <BankLogo
              bank={{ name: bankName, ifscPrefix: ifscPrefix(beneficiary.ifsc) }}
              size={36}
            />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight">{bankName}</p>
            <p className="mt-0.5 font-mono text-[11px] tracking-wider text-white/60">
              IFSC · {beneficiary.ifsc || "—"}
            </p>
          </div>
        </div>
        {beneficiary.verified ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-300/40">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-300/40">
            <ShieldAlert className="h-3.5 w-3.5" />
            Unverified
          </span>
        )}
      </div>

      <div className="relative mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Account Number
        </p>
        <p className="mt-1 break-all font-mono text-lg font-semibold tracking-[0.12em] sm:text-xl">
          {formatAccountNumber(accountNumber)}
        </p>
      </div>

      <div className="relative mt-5 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Account Holder
          </p>
          <p className="mt-1 truncate text-base font-bold uppercase tracking-wide">
            {beneficiary.name || "—"}
          </p>
        </div>
        {beneficiary.mobile ? (
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Mobile
            </p>
            <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{beneficiary.mobile}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
