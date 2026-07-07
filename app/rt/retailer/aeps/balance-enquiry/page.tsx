"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import { useAepsBalanceEnquiry } from "@/src/hooks/useAeps";
import type { AepsTransactionResult } from "@/src/types/aeps";

export default function AepsBalanceEnquiryPage() {
  const enquiry = useAepsBalanceEnquiry();
  const [balanceResult, setBalanceResult] = useState<AepsTransactionResult | null>(
    null
  );

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Balance Enquiry"
        description="Check customer account balance using Aadhaar authentication"
      />

      {balanceResult?.balance != null ? (
        <div className="overflow-hidden rounded-xl border border-emerald-200/80 bg-emerald-50 shadow-sm">
          <div className="flex items-start gap-4 px-5 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100">
              <Wallet className="h-5 w-5 text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-emerald-900">Available Balance</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-950">
                {formatCurrency(balanceResult.balance)}
              </p>
              {balanceResult.customerName ? (
                <p className="mt-2 text-sm text-emerald-800">
                  Account holder: {balanceResult.customerName}
                </p>
              ) : null}
              {balanceResult.message ? (
                <p className="mt-1 text-sm text-emerald-700/90">{balanceResult.message}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <AepsTransactionForm
        title="Balance Enquiry"
        description="Capture fingerprint to fetch account balance"
        submitLabel="Check Balance"
        onSubmit={(payload) => {
          setBalanceResult(null);
          return enquiry.mutateAsync(payload);
        }}
        onSuccess={setBalanceResult}
      />
    </div>
  );
}
