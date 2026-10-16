"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  keepPreviousData,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, History, Landmark, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { aepsSettlementErrorMessage, AEPS_SETTLEMENTS_QUERY_KEY, fetchAepsSettlements } from "../api";
import AepsSettlementStatusBadge from "../components/AepsSettlementStatusBadge";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "SUCCESS", label: "Success" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
];

const PAGE_SIZES = [10, 20, 50];

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function money(value: number | null): string {
  return value == null ? "—" : formatCurrency(value);
}

function AepsSettlementsContent() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");

  const query = useQuery({
    queryKey: [...AEPS_SETTLEMENTS_QUERY_KEY, { page, limit, status }],
    queryFn: () => fetchAepsSettlements({ page, limit, status }),
    placeholderData: keepPreviousData,
  });

  const data = query.data;
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="min-w-0 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1565d8] to-[#0b4fb3] text-white shadow-lg">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001F5B] dark:text-white">AEPS Settlements</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Every AEPS wallet transfer to your own bank account, with wallet balance before and after.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/rt/retailer/aeps">
              <ArrowLeft className="h-4 w-4" />
              AEPS
            </Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="rounded-xl"
          >
            <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value || "all"}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              status === filter.value
                ? "bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#1565d8]"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">To Account</th>
                <th className="px-4 py-3">UTR</th>
                <th className="px-4 py-3 text-right">Opening</th>
                <th className="px-4 py-3 text-right">Closing</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading settlements...
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <p className="text-sm text-red-600">{aepsSettlementErrorMessage(query.error)}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void query.refetch()}
                      className="mt-3 rounded-xl"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-14 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Landmark className="h-6 w-6" />
                    </span>
                    <p className="font-semibold text-slate-700">No settlements found</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Use &quot;To Bank&quot; on the AEPS dashboard to transfer your AEPS balance.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id || row.externalRef} className="border-t border-slate-100 align-top hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.externalRef}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-red-600">
                      -{formatCurrency(row.amount)}
                      {row.walletReversed ? (
                        <p className="text-[11px] font-medium text-emerald-600">Refunded</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{row.transferMode}</td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs text-slate-800">{row.accountNumberMasked || "—"}</p>
                      <p className="text-[11px] text-slate-500">
                        {[row.payeeName, row.ifscCode].filter(Boolean).join(" · ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{row.txnReferenceId || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">{money(row.openingBalance)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-800">{money(row.closingBalance)}</td>
                    <td className="px-4 py-3">
                      <AepsSettlementStatusBadge status={row.status} />
                      {row.status !== "SUCCESS" && (row.message || row.providerMessage) ? (
                        <p className="mt-1 max-w-[200px] text-[11px] text-slate-500">
                          {row.message || row.providerMessage}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-slate-400">· {data?.total ?? 0} total</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages || query.isFetching}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AepsSettlementsPage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AepsSettlementsContent />
    </QueryClientProvider>
  );
}
