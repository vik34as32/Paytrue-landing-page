"use client";

import { useMemo, useState, type ComponentType } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/src/components/common/StatusBadge";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import { formatCurrency, cn } from "@/lib/utils";
import {
  exportWalletSummaryCsv,
  exportWalletSummaryExcel,
  exportWalletSummaryPdf,
  formatWalletSummaryAmount,
  formatWalletSummaryDate,
  printWalletSummary,
  WALLET_SUMMARY_STATUS_FILTERS,
  WALLET_SUMMARY_TYPE_FILTERS,
} from "@/src/lib/walletSummaryUtils";
import type {
  WalletSummaryStatusFilter,
  WalletSummaryTransaction,
  WalletSummaryTypeFilter,
  WalletSummaryUser,
  WalletSummaryWallet,
} from "@/src/types/walletSummary";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 25, 50, 100];

function StackedHeader({ lines }: { lines: string[] }) {
  return (
    <span className="inline-flex flex-col items-center justify-center text-[11px] font-bold uppercase tracking-wide leading-[1.2]">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

function AmountCell({
  value,
  tone,
}: {
  value: number;
  tone: "credit" | "deduct" | "neutral" | "balance";
}) {
  if (!value && tone !== "balance") {
    return <span className="text-slate-300">—</span>;
  }

  return (
    <span
      className={cn(
        "font-bold tabular-nums tracking-tight",
        tone === "credit" && "text-emerald-700",
        tone === "deduct" && "text-red-600",
        tone === "balance" && "text-[#001F5B]",
        tone === "neutral" && "text-slate-600"
      )}
    >
      {tone === "credit" ? "+" : tone === "deduct" ? "−" : ""}
      {formatCurrency(value)}
    </span>
  );
}

function ExportButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-semibold text-slate-600 hover:bg-white hover:text-[#001F5B]"
      disabled={disabled}
      onClick={onClick}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </Button>
  );
}

function MobileSummaryCard({ row }: { row: WalletSummaryTransaction }) {
  const isCredit = row.type === "CREDIT";

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-4",
        isCredit ? "border-l-4 border-l-emerald-500 border-slate-200" : "border-l-4 border-l-red-500 border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#001F5B]">
            {row.performedBy?.name || "—"}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#1565d8]">
            {row.performedBy?.roleLabel || row.performedBy?.role || "—"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {row.date && row.time ? `${row.date} · ${row.time}` : formatWalletSummaryDate(row.createdAt)}
          </p>
        </div>
        <StatusBadge status={row.status} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Previous</p>
          <p className="mt-1 text-xs font-bold text-slate-700 tabular-nums">
            {formatWalletSummaryAmount(row.openingBalance)}
          </p>
        </div>
        <div>
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider",
              isCredit ? "text-emerald-600" : "text-red-600"
            )}
          >
            {isCredit ? "Credit" : "Deduct"}
          </p>
          <p
            className={cn(
              "mt-1 text-xs font-bold tabular-nums",
              isCredit ? "text-emerald-700" : "text-red-700"
            )}
          >
            {formatWalletSummaryAmount(row.amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#001F5B]/60">Updated</p>
          <p className="mt-1 text-xs font-bold text-[#001F5B] tabular-nums">
            {formatWalletSummaryAmount(row.updatedBalance)}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatStatementPeriod(dateFrom: string, dateTo: string) {
  if (dateFrom && dateTo) return `${dateFrom} to ${dateTo}`;
  if (dateFrom) return `From ${dateFrom}`;
  if (dateTo) return `Until ${dateTo}`;
  return "All transactions";
}

interface WalletSummaryTableProps {
  transactions: WalletSummaryTransaction[];
  wallet?: WalletSummaryWallet | null;
  user?: WalletSummaryUser | null;
  total?: number;
  page?: number;
  limit?: number;
  search?: string;
  typeFilter?: WalletSummaryTypeFilter;
  statusFilter?: WalletSummaryStatusFilter;
  dateFrom?: string;
  dateTo?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onSearchChange?: (value: string) => void;
  onTypeFilterChange?: (value: WalletSummaryTypeFilter) => void;
  onStatusFilterChange?: (value: WalletSummaryStatusFilter) => void;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function WalletSummaryTable({
  transactions,
  wallet,
  user,
  total = 0,
  page = 1,
  limit = 20,
  search = "",
  typeFilter = "ALL",
  statusFilter = "All",
  dateFrom = "",
  dateTo = "",
  loading = false,
  onRefresh,
  onSearchChange,
  onTypeFilterChange,
  onStatusFilterChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onLimitChange,
}: WalletSummaryTableProps) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const exportDisabled = loading || transactions.length === 0;

  const hasActiveFilters =
    Boolean(search.trim()) ||
    typeFilter !== "ALL" ||
    statusFilter !== "All" ||
    Boolean(dateFrom) ||
    Boolean(dateTo);

  const clearFilters = () => {
    onSearchChange?.("");
    onTypeFilterChange?.("ALL");
    onStatusFilterChange?.("All");
    onDateFromChange?.("");
    onDateToChange?.("");
    onPageChange?.(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const statementPeriod = formatStatementPeriod(dateFrom, dateTo);
  const generatedAt = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const columns = useMemo<TableColumn<WalletSummaryTransaction>[]>(
    () => [
      {
        name: <StackedHeader lines={["Txn", "Date"]} />,
        minWidth: "108px",
        cell: (row) => (
          <div className="py-0.5">
            <p className="text-xs font-bold text-[#001F5B]">
              {row.date || formatWalletSummaryDate(row.createdAt).split(",")[0]}
            </p>
            <p className="text-[11px] text-slate-500">{row.time || "—"}</p>
          </div>
        ),
      },
      {
        name: <StackedHeader lines={["Performed", "By"]} />,
        minWidth: "140px",
        cell: (row) => (
          <div>
            <p className="text-sm font-bold text-[#001F5B]">
              {row.performedBy?.name || "—"}
            </p>
            {row.performedBy?.userCode ? (
              <p className="text-[11px] text-slate-500">{row.performedBy.userCode}</p>
            ) : null}
          </div>
        ),
      },
      {
        name: <StackedHeader lines={["User", "Type"]} />,
        minWidth: "108px",
        cell: (row) => (
          <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
            {row.performedBy?.roleLabel || row.performedBy?.role || "—"}
          </span>
        ),
      },
      {
        name: <StackedHeader lines={["Previous", "Balance"]} />,
        minWidth: "118px",
        right: true,
        cell: (row) => <AmountCell value={row.openingBalance} tone="neutral" />,
      },
      {
        name: <StackedHeader lines={["Credit", "Amt."]} />,
        minWidth: "108px",
        right: true,
        cell: (row) => (
          <AmountCell value={row.type === "CREDIT" ? row.amount : 0} tone="credit" />
        ),
      },
      {
        name: <StackedHeader lines={["Deduct", "Amt."]} />,
        minWidth: "108px",
        right: true,
        cell: (row) => (
          <AmountCell value={row.type === "DEDUCT" ? row.amount : 0} tone="deduct" />
        ),
      },
      {
        name: <StackedHeader lines={["Updated", "Balance"]} />,
        minWidth: "118px",
        right: true,
        cell: (row) => <AmountCell value={row.updatedBalance} tone="balance" />,
      },
      {
        name: "Status",
        minWidth: "96px",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        name: "Reference / Narration",
        minWidth: "200px",
        grow: 2,
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-slate-600">
              {row.reference || "—"}
            </p>
            {row.message ? (
              <p className="truncate text-[11px] text-slate-400">{row.message}</p>
            ) : null}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Bank statement header */}
      <div className="border-b border-[#001F5B]/10 bg-gradient-to-r from-[#001F5B] via-[#003380] to-[#0057D9] px-4 py-5 text-white md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
                Paytrue Wallet
              </p>
              <h2 className="text-xl font-bold tracking-tight">Account Statement</h2>
              <p className="mt-1 text-sm text-white/80">
                {user?.roleLabel || "Account Holder"}
                {user?.role ? ` · ${user.role.replace(/_/g, " ")}` : ""}
              </p>
            </div>
          </div>

          <div className="grid gap-1 text-sm lg:text-right">
            <p>
              <span className="text-white/60">Period:</span>{" "}
              <span className="font-semibold">{statementPeriod}</span>
            </p>
            <p>
              <span className="text-white/60">Generated:</span>{" "}
              <span className="font-semibold">{generatedAt}</span>
            </p>
            <p>
              <span className="text-white/60">Entries:</span>{" "}
              <span className="font-semibold">
                {from}–{to} of {total}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Balance strip */}
      {wallet ? (
        <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 bg-slate-50/80 md:grid-cols-4">
          <div className="px-4 py-3 md:px-5 md:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Available Balance
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-emerald-700 md:text-2xl">
              {formatCurrency(wallet.balance)}
            </p>
          </div>
          <div className="px-4 py-3 md:px-5 md:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hold Amount
            </p>
            <p className="mt-1 text-xl font-black tabular-nums text-amber-700 md:text-2xl">
              {formatCurrency(wallet.holdAmount)}
            </p>
          </div>
          <div className="px-4 py-3 md:px-5 md:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Account Status
            </p>
            <p className="mt-1 text-lg font-black uppercase tracking-wide text-[#001F5B]">
              {wallet.status || "—"}
            </p>
          </div>
          <div className="col-span-2 px-4 py-3 md:col-span-1 md:px-5 md:py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Statement Type
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              Wallet Credit &amp; Deduction Ledger
            </p>
          </div>
        </div>
      ) : null}

      {/* Toolbar: filters + exports aligned */}
      <div className="space-y-3 border-b border-slate-100 bg-white px-4 py-4 md:px-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-end gap-2">
            <div className="w-full sm:w-52">
              <Label htmlFor="wallet-summary-search" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <Input
                  id="wallet-summary-search"
                  placeholder="Name, ref, role..."
                  value={search}
                  onChange={(event) => onSearchChange?.(event.target.value)}
                  className="h-9 rounded-lg border-slate-200 bg-white pl-8 text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="w-[132px]">
              <Label htmlFor="wallet-summary-from" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                From
              </Label>
              <Input
                id="wallet-summary-from"
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => onDateFromChange?.(event.target.value)}
                className="h-9 rounded-lg border-slate-200 text-sm"
                disabled={loading}
              />
            </div>

            <div className="w-[132px]">
              <Label htmlFor="wallet-summary-to" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                To
              </Label>
              <Input
                id="wallet-summary-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(event) => onDateToChange?.(event.target.value)}
                className="h-9 rounded-lg border-slate-200 text-sm"
                disabled={loading}
              />
            </div>

            <div className="w-[120px]">
              <Label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Status
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  onStatusFilterChange?.(value as WalletSummaryStatusFilter)
                }
                disabled={loading}
              >
                <SelectTrigger className="h-9 rounded-lg border-slate-200 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {WALLET_SUMMARY_STATUS_FILTERS.map((filter) => (
                    <SelectItem key={filter} value={filter}>
                      {filter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mb-0 h-9 gap-1 rounded-lg px-2.5 text-xs"
                onClick={clearFilters}
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </Button>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            <div className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              {WALLET_SUMMARY_TYPE_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => onTypeFilterChange?.(filter)}
                  className={cn(
                    "h-7 rounded-md px-3 text-xs font-bold transition-all",
                    typeFilter === filter
                      ? filter === "CREDIT"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : filter === "DEDUCT"
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-[#001F5B] text-white shadow-sm"
                      : "text-slate-500 hover:text-[#001F5B]"
                  )}
                >
                  {filter === "ALL" ? "All" : filter === "CREDIT" ? "Credit" : "Deduct"}
                </button>
              ))}
            </div>

            {onRefresh ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 rounded-lg px-3 text-xs"
                disabled={loading}
                onClick={onRefresh}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                Refresh
              </Button>
            ) : null}

            <div className="inline-flex items-center divide-x divide-slate-200 rounded-lg border border-slate-200 bg-slate-50">
              <ExportButton
                label="CSV"
                icon={Download}
                disabled={exportDisabled}
                onClick={() => exportWalletSummaryCsv(transactions)}
              />
              <ExportButton
                label="Excel"
                icon={FileSpreadsheet}
                disabled={exportDisabled}
                onClick={() => exportWalletSummaryExcel(transactions)}
              />
              <ExportButton
                label="PDF"
                icon={FileText}
                disabled={exportDisabled}
                loading={exportingPdf}
                onClick={async () => {
                  setExportingPdf(true);
                  try {
                    await exportWalletSummaryPdf(transactions);
                  } finally {
                    setExportingPdf(false);
                  }
                }}
              />
              <ExportButton
                label="Print"
                icon={Printer}
                disabled={exportDisabled}
                onClick={() => printWalletSummary(transactions)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger table */}
      <div className="hidden border-b border-slate-100 md:block">
        <DataTable
          columns={columns}
          data={transactions}
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading statement...
            </div>
          }
          noDataComponent={
            <div className="py-16 text-center text-sm text-slate-500">
              No wallet entries found for the selected period.
            </div>
          }
          customStyles={{
            ...cyanDataTableStyles,
            table: {
              style: {
                borderCollapse: "separate",
                borderSpacing: 0,
              },
            },
            headRow: {
              style: {
                backgroundColor: "#f8fafc",
                borderBottom: "2px solid #e2e8f0",
                minHeight: "48px",
              },
            },
            rows: {
              style: {
                minHeight: "52px",
                borderBottom: "1px solid #f1f5f9",
                fontSize: "13px",
              },
              highlightOnHoverStyle: {
                backgroundColor: "#f8fbff",
                transition: "background 0.15s ease",
              },
            },
          }}
          sortIcon={<CyanDataTableSortIcon />}
          dense
          highlightOnHover
          responsive
          pagination={false}
        />
      </div>

      <div className="space-y-3 p-4 md:hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">
            No wallet entries found.
          </div>
        ) : (
          transactions.map((row) => <MobileSummaryCard key={row.id} row={row} />)
        )}
      </div>

      {/* Footer pagination */}
      <div className="flex flex-col gap-3 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-5">
        <p className="text-xs font-medium text-slate-500">
          Statement entries {from}–{to} of {total}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={limit}
            onChange={(event) => onLimitChange?.(Number(event.target.value))}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium"
            disabled={loading}
          >
            {ROWS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} rows
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={loading || page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[68px] text-center text-xs font-bold text-slate-600">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
