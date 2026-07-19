"use client";

import { motion } from "framer-motion";
import { Building2, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { BankLogo } from "@/components/retailer/BankLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { maskAccountNumber } from "@/src/lib/fundRequestUtils";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

interface CompanyBankCardsProps {
  accounts: CompanyBankAccount[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: boolean;
}

async function copyText(label: string, value: string) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Failed to copy ${label.toLowerCase()}`);
  }
}

function BankCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="h-5 w-48 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function CompanyBankCards({
  accounts,
  selectedId,
  onSelect,
  loading = false,
  error = false,
}: CompanyBankCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <BankCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error || accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
        <Building2 className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          No company bank accounts available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Active deposit accounts will appear here once configured by admin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {accounts.map((account) => {
        const selected = selectedId === account.id;

        return (
          <motion.div
            key={account.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "relative rounded-2xl border p-5 shadow-sm transition-all duration-200",
              selected
                ? "border-[#1565d8] bg-blue-50/70 ring-2 ring-[#1565d8]/15 dark:border-blue-500 dark:bg-blue-950/25"
                : "border-slate-200 bg-white hover:border-[#1565d8]/30 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            )}
          >
            {selected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#1565d8] text-white shadow-sm"
              >
                <Check className="h-3.5 w-3.5" />
              </motion.span>
            )}

            <div className="flex items-start gap-3 pr-8">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <BankLogo
                  bank={{
                    name: account.bankName,
                    ifscPrefix: account.ifscCode?.slice(0, 4) || "",
                  }}
                  size={36}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {account.bankName || "Bank"}
                </p>
                <p className="mt-0.5 text-sm font-bold uppercase leading-snug text-[#001F5B] dark:text-white">
                  {account.accountHolderName}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Bank Name
                </p>
                <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                  {account.bankName}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Account Number
                </p>
                <p className="mt-0.5 font-mono text-base font-semibold tracking-wide text-slate-800 dark:text-slate-100">
                  {maskAccountNumber(account.accountNumber)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    IFSC
                  </p>
                  <p className="mt-0.5 font-mono font-semibold text-slate-700 dark:text-slate-200">
                    {account.ifscCode}
                  </p>
                </div>
                {account.branch && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Branch
                    </p>
                    <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                      {account.branch}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => void copyText("Account number", account.accountNumber)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Account Number
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => void copyText("IFSC", account.ifscCode)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy IFSC
              </Button>
              <Button
                type="button"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 text-xs",
                  selected
                    ? "bg-[#1565d8] hover:bg-[#1256b8]"
                    : "bg-slate-800 hover:bg-slate-700 dark:bg-[#1565d8]"
                )}
                onClick={() => onSelect(account.id)}
              >
                {selected ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Selected
                  </>
                ) : (
                  "Select Account"
                )}
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
