"use client";

import { Building2, ShieldCheck } from "lucide-react";
import { resolveDisplayBankAccounts } from "@/src/constants/demoCompanyBankAccounts";
import { useCompanyBankAccounts } from "@/src/hooks/useRetailerFundRequests";
import CompanyBankDetailCard from "./CompanyBankDetailCard";
import ErrorState from "./ErrorState";

function BankDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-3 w-28 rounded bg-slate-100" />
            </div>
          </div>
          <div className="space-y-3 p-5">
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
            <div className="h-10 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BankDetailsPanel() {
  const {
    data: bankAccounts = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCompanyBankAccounts();

  const accounts = resolveDisplayBankAccounts(bankAccounts, isLoading);

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  if (isLoading) {
    return <BankDetailsSkeleton />;
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center">
        <Building2 className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">
          No company bank accounts available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Deposit account details will appear here once configured by admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5">
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#0b2a4a]">
          <ShieldCheck className="h-4 w-4 text-[#1565d8]" />
          Verified PayTrue company accounts — identify bank by logo before deposit
        </p>
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
          {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {accounts.map((account) => (
          <CompanyBankDetailCard key={account.id} account={account} />
        ))}
      </div>
    </div>
  );
}
