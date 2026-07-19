"use client";

import { Copy, Check, Building2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BankLogo } from "@/components/retailer/BankLogo";
import { Button } from "@/components/ui/button";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

interface CompanyBankDetailCardProps {
  account: CompanyBankAccount;
}

async function copyValue(label: string, value: string) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Failed to copy ${label.toLowerCase()}`);
  }
}

function DetailRow({
  label,
  value,
  mono = false,
  emphasize = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasize?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(value && value !== "—");

  const handleCopy = async () => {
    await copyValue(label, value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p
          className={[
            "mt-1 break-all leading-snug text-[#0b1f3a]",
            mono ? "font-mono text-[14px] font-semibold tracking-wide sm:text-[15px]" : "text-sm font-semibold",
            emphasize ? "text-base font-extrabold sm:text-lg" : "",
          ].join(" ")}
        >
          {value || "—"}
        </p>
      </div>
      {canCopy ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-1.5 rounded-lg border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-600 hover:border-[#1565d8]/40 hover:bg-blue-50 hover:text-[#1565d8]"
          onClick={() => void handleCopy()}
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      ) : null}
    </div>
  );
}

export default function CompanyBankDetailCard({
  account,
}: CompanyBankDetailCardProps) {
  const bankForLogo = {
    name: account.bankName,
    ifscPrefix: account.ifscCode?.slice(0, 4) || "",
  };

  const handleCopyAll = async () => {
    const block = [
      `Bank: ${account.bankName}`,
      `Account Holder: ${account.accountHolderName}`,
      `Account Number: ${account.accountNumber}`,
      `IFSC: ${account.ifscCode}`,
      account.branch ? `Branch: ${account.branch}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(block);
      toast.success("Full bank details copied");
    } catch {
      toast.error("Failed to copy bank details");
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_20px_rgba(11,31,58,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(11,31,58,0.1)]">
      {/* Left bank accent */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#1565d8] to-[#0b2a4a]" />

      {/* Bank identity header */}
      <header className="flex items-center gap-3.5 border-b border-slate-100 bg-gradient-to-r from-[#f4f8fc] to-white px-4 py-4 pl-5 sm:px-5 sm:pl-6">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <BankLogo bank={bankForLogo} size={40} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[15px] font-extrabold tracking-tight text-[#0b1f3a] sm:text-base">
              {account.bankName || "Bank Account"}
            </h3>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
              Active
            </span>
          </div>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Official company deposit account
          </p>
        </div>
      </header>

      <div className="px-4 py-1 pl-5 sm:px-5 sm:pl-6">
        <div className="border-b border-slate-100 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Account holder
          </p>
          <p className="mt-1 text-sm font-bold uppercase leading-snug text-[#0b1f3a]">
            {account.accountHolderName || "—"}
          </p>
        </div>

        <DetailRow
          label="Account Number"
          value={account.accountNumber || "—"}
          mono
          emphasize
        />
        <DetailRow label="IFSC Code" value={account.ifscCode || "—"} mono />
        {account.branch ? (
          <div className="flex items-center gap-1.5 border-b border-slate-100 py-3 last:border-b-0">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Branch
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#0b1f3a]">
                {account.branch}
              </p>
            </div>
          </div>
        ) : null}
        {account.upiId ? (
          <DetailRow label="UPI ID" value={account.upiId} />
        ) : null}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#f8fafc] px-4 py-3 pl-5 sm:px-5 sm:pl-6">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <Building2 className="h-3.5 w-3.5 text-[#1565d8]" />
          Deposit only · Keep proof for fund request
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() => void handleCopyAll()}
          className="h-8 rounded-lg bg-[#0b2a4a] px-3 text-[11px] font-bold hover:bg-[#08325c]"
        >
          Copy all details
        </Button>
      </footer>
    </article>
  );
}
