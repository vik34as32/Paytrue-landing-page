"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

interface CompanyBankDetailCardProps {
  account: CompanyBankAccount;
}

const DETAIL_ROWS = [
  { key: "bankName", label: "Bank Name", field: "bankName" as const },
  { key: "accountNumber", label: "Account Number", field: "accountNumber" as const },
  { key: "ifscCode", label: "IFSC Code", field: "ifscCode" as const },
];

async function copyValue(label: string, value: string) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Failed to copy ${label.toLowerCase()}`);
  }
}

export default function CompanyBankDetailCard({
  account,
}: CompanyBankDetailCardProps) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="bg-[#E67E22] px-4 py-3 text-center">
        <h3 className="text-sm font-bold uppercase leading-snug tracking-wide text-white sm:text-[15px]">
          {account.accountHolderName}
        </h3>
      </header>

      <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
        {DETAIL_ROWS.map((row) => {
          const value = account[row.field] || "—";
          const canCopy = Boolean(account[row.field]);

          return (
            <div
              key={row.key}
              className="grid grid-cols-[minmax(120px,38%)_1fr] text-sm sm:grid-cols-[minmax(140px,34%)_1fr]"
            >
              <div className="border-r border-slate-200/80 bg-[#E8E0F5] px-3 py-2.5 font-semibold text-[#1E1B4B] dark:border-slate-800 dark:bg-violet-950/40 dark:text-violet-100">
                {row.label}
              </div>
              <div className="flex items-center justify-between gap-2 bg-[#EEF2FF] px-3 py-2.5 font-semibold text-[#1E1B4B] dark:bg-indigo-950/30 dark:text-indigo-100">
                <span className="break-all font-mono text-[13px] leading-snug sm:text-sm">
                  {value}
                </span>
                {canCopy && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-slate-500 hover:text-[#1565d8]"
                    onClick={() => void copyValue(row.label, String(account[row.field]))}
                    aria-label={`Copy ${row.label}`}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
