"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BankLogo } from "@/components/retailer/BankLogo";
import { maskAccountNumberDisplay } from "@/src/lib/fundRequestUtils";
import type { CompanyBankAccount } from "@/src/types/fundRequest";

interface SelectedDepositAccountCardProps {
  account: CompanyBankAccount;
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

export default function SelectedDepositAccountCard({
  account,
}: SelectedDepositAccountCardProps) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/50 px-3 py-2">
      <BankLogo bank={account.bankName} size={28} className="shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase text-[#001F5B]">
          {account.bankName}
        </p>
        <p className="truncate text-[10px] text-slate-500">{account.accountHolderName}</p>
        <p className="mt-0.5 font-mono text-[10px] font-medium text-slate-600">
          {maskAccountNumberDisplay(account.accountNumber)}
          <span className="mx-1.5 text-slate-300">·</span>
          {account.ifscCode}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 rounded-md border-slate-200 bg-white px-2 text-[10px] font-medium"
          onClick={() => void copyText("Account number", account.accountNumber)}
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 rounded-md border-slate-200 bg-white px-2 text-[10px] font-medium"
          onClick={() => void copyText("IFSC", account.ifscCode)}
          title="Copy IFSC"
        >
          IFSC
        </Button>
      </div>
    </div>
  );
}
