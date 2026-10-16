"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import { useDebounce } from "@/src/hooks/useDebounce";
import NsdlStatusBadge from "../components/NsdlStatusBadge";
import { reconcileNsdlTransaction } from "../lib/nsdl-aeps-api";
import { useNsdlLedger } from "../lib/nsdl-aeps-hooks";
import { NSDL_SERVICE_LABELS, nsdlServiceLabel } from "../lib/nsdl-aeps-normalizers";
import type { NsdlLedgerQuery } from "../types";

const PAGE_SIZES = [10, 20, 50, 100];
const STATUSES = ["SUCCESS", "PENDING", "FAILED", "REFUNDED"];
const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100";

function dayStart(date: string): string | undefined {
  return date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
}

function dayEnd(date: string): string | undefined {
  return date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined;
}

function money(value: number | null): string {
  return value == null ? "—" : formatCurrency(value);
}

export default function NsdlLedgerPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [serviceType, setServiceType] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const query = useMemo<NsdlLedgerQuery>(
    () => ({
      page,
      limit,
      serviceType: serviceType || undefined,
      status: status || undefined,
      startDate: dayStart(fromDate),
      endDate: dayEnd(toDate),
      transactionId: debouncedSearch.trim() || undefined,
    }),
    [page, limit, serviceType, status, fromDate, toDate, debouncedSearch]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useNsdlLedger(query);
  const rows = data?.rows ?? [];
  const totalPages = data?.totalPages ?? 1;

  const resetTo = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const onRefreshRow = async (transactionId: string) => {
    setRefreshingId(transactionId);
    try {
      const updated = await reconcileNsdlTransaction(transactionId);
      toast.success(`Status: ${updated.status}`);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to refresh status.");
    } finally {
      setRefreshingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="NSDL AEPS Ledger"
        description="All NSDL AEPS transactions with wallet credit, debit and balances"
        actions={
          <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Opening Balance", value: data?.openingBalance, tone: "text-slate-800" },
          { label: "Total Credit", value: data?.totalCredit, tone: "text-emerald-600" },
          { label: "Total Debit", value: data?.totalDebit, tone: "text-rose-600" },
          { label: "Closing Balance", value: data?.closingBalance, tone: "text-[#4F46E5]" },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className={card.tone}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-slate-400" /> : formatCurrency(card.value ?? 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>{data ? `${data.total} records` : "Loading records..."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5 lg:col-span-1">
              <Label htmlFor="nsdl-ledger-search">Reference</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="nsdl-ledger-search"
                  value={search}
                  onChange={(event) => resetTo(setSearch)(event.target.value)}
                  placeholder="Txn ID / reference"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nsdl-ledger-service">Service</Label>
              <select
                id="nsdl-ledger-service"
                className={SELECT_CLASS}
                value={serviceType}
                onChange={(event) => resetTo(setServiceType)(event.target.value)}
              >
                <option value="">All Services</option>
                {Object.entries(NSDL_SERVICE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nsdl-ledger-status">Status</Label>
              <select
                id="nsdl-ledger-status"
                className={SELECT_CLASS}
                value={status}
                onChange={(event) => resetTo(setStatus)(event.target.value)}
              >
                <option value="">All Status</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value.charAt(0) + value.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nsdl-ledger-from">From</Label>
              <Input
                id="nsdl-ledger-from"
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => resetTo(setFromDate)(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nsdl-ledger-to">To</Label>
              <Input
                id="nsdl-ledger-to"
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => resetTo(setToDate)(event.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Reference</th>
                  <th className="px-3 py-3">Service</th>
                  <th className="px-3 py-3">Aadhaar</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                  <th className="px-3 py-3 text-right">Charges</th>
                  <th className="px-3 py-3 text-right">Commission</th>
                  <th className="px-3 py-3 text-right">Credit</th>
                  <th className="px-3 py-3 text-right">Debit</th>
                  <th className="px-3 py-3 text-right">Closing Bal.</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Bank RRN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-10 text-center text-slate-500">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-10 text-center text-rose-600">
                      {error instanceof Error ? error.message : "Unable to load NSDL AEPS ledger."}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-3 py-10 text-center text-slate-500">
                      No NSDL AEPS transactions found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.transactionId || row.reference} className="hover:bg-violet-50/40">
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                        {row.createdAt ? new Date(row.createdAt).toLocaleString("en-IN") : "—"}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-700">{row.reference || "—"}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-800">
                        {nsdlServiceLabel(row.serviceType)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-600">{row.aadhaarMasked || "—"}</td>
                      <td className="px-3 py-3 text-right font-semibold">{formatCurrency(row.amount)}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(row.charges)}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(row.commission)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-emerald-600">
                        {row.credit ? formatCurrency(row.credit) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-rose-600">
                        {row.debit ? formatCurrency(row.debit) : "—"}
                      </td>
                      <td className="px-3 py-3 text-right">{money(row.closingBalance)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <NsdlStatusBadge status={row.status} />
                          {row.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              disabled={refreshingId !== null}
                              onClick={() => void onRefreshRow(row.reference || row.transactionId)}
                              title={row.providerMessage || "Refresh status"}
                            >
                              {refreshingId === (row.reference || row.transactionId) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-slate-600">{row.bankReference || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span>Rows</span>
              <select
                className={`${SELECT_CLASS} h-9 w-20`}
                value={limit}
                onChange={(event) => resetTo(setLimit)(Number(event.target.value))}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
