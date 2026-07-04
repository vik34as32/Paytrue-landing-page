"use client";

import { Building2 } from "lucide-react";
import { resolveDisplayBankAccounts } from "@/src/constants/demoCompanyBankAccounts";
import { useCompanyBankAccounts } from "@/src/hooks/useRetailerFundRequests";
import CompanyBankDetailCard from "./CompanyBankDetailCard";
import ErrorState from "./ErrorState";

function BankDetailsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="h-12 bg-orange-200/70 dark:bg-orange-900/40" />
          <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2">
                <div className="h-11 bg-violet-100/80 dark:bg-violet-950/30" />
                <div className="h-11 bg-indigo-50 dark:bg-indigo-950/20" />
              </div>
            ))}
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
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-10 text-center dark:border-slate-700 dark:bg-slate-900/50">
        <Building2 className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          No company bank accounts available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Deposit account details will appear here once configured by admin.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {accounts.map((account) => (
        <CompanyBankDetailCard key={account.id} account={account} />
      ))}
    </div>
  );
}
