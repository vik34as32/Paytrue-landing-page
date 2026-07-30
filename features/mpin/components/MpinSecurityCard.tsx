"use client";

import Link from "next/link";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { useMpinStatus } from "../hooks/useMpin";
import { MpinQueryProvider } from "./MpinQueryProvider";

function MpinSecurityCardInner() {
  const { data, isLoading, isError, refetch, isFetching } = useMpinStatus();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#001F5B] dark:text-white">
            Security
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your MPIN for secure wallet authorizations
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Unable to load MPIN status.{" "}
          <button
            type="button"
            onClick={() => void refetch()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                MPIN Status
              </p>
              <p className="mt-0.5 text-sm font-semibold text-[#0b1f3a] dark:text-slate-100">
                {data?.isMpinCreated ? "MPIN Created" : "Not Created"}
              </p>
            </div>
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  data?.isMpinCreated
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
              >
                {data?.isMpinCreated ? "Active" : "Required"}
              </span>
            )}
          </div>

          {data?.isMpinCreated ? (
            <Link
              href="/rt/retailer/mpin/change"
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#1565d8]/40 hover:bg-blue-50/50 dark:border-slate-700 dark:hover:bg-slate-900"
            >
              <KeyRound className="h-4 w-4 text-[#1565d8]" />
              <div>
                <p className="text-sm font-semibold text-[#001F5B] dark:text-white">
                  Change MPIN
                </p>
                <p className="text-xs text-slate-500">Update your existing secure MPIN</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/rt/retailer/mpin/create"
              className="flex items-center gap-3 rounded-xl border border-[#1565d8]/30 bg-[#1565d8]/5 px-4 py-3 transition hover:bg-[#1565d8]/10"
            >
              <ShieldCheck className="h-4 w-4 text-[#1565d8]" />
              <div>
                <p className="text-sm font-semibold text-[#001F5B] dark:text-white">
                  Create MPIN
                </p>
                <p className="text-xs text-slate-500">
                  Set up your 4 digit MPIN now
                </p>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function MpinSecurityCard() {
  return (
    <MpinQueryProvider>
      <MpinSecurityCardInner />
    </MpinQueryProvider>
  );
}
