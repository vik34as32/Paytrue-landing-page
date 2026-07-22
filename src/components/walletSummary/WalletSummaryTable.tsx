"use client";

import { useMemo, useState, type ComponentType, type ReactNode } from "react";
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
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import { cn } from "@/lib/utils";
import {
  exportWalletSummaryCsv,
  exportWalletSummaryExcel,
  exportWalletSummaryPdf,
  formatWalletSummaryAmount,
  formatWalletSummaryDateTime,
  printWalletSummary,
} from "@/src/lib/walletSummaryUtils";
import type {
  WalletSummaryTransaction,
  WalletSummaryUser,
  WalletSummaryWallet,
} from "@/src/types/walletSummary";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 25, 50, 100];
const TABLE_MIN_WIDTH = "1680px";

function HeaderLabel({ children }: { children: ReactNode }) {
  return (
    <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

function MoneyCell({
  value,
  tone = "neutral",
}: {
  value: number;
  tone?: "credit" | "debit" | "neutral" | "balance";
}) {
  const amount = Number(value ?? 0);
  if (!amount && tone !== "balance" && tone !== "neutral") {
    return <span className="text-slate-300">0.00</span>;
  }

  return (
    <span
      className={cn(
        "font-semibold tabular-nums tracking-tight",
        tone === "credit" && "text-emerald-700",
        tone === "debit" && "text-red-600",
        tone === "balance" && "font-bold text-[#001F5B]",
        tone === "neutral" && "text-slate-700"
      )}
    >
      {formatWalletSummaryAmount(amount)}
    </span>
  );
}

function StatusCell({ status }: { status: string }) {
  const value = String(status || "").toUpperCase();
  const isSuccess = value === "SUCCESS";
  const isFailed = value === "FAILED";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        isSuccess && "bg-emerald-50 text-emerald-700",
        isFailed && "bg-red-50 text-red-600",
        !isSuccess && !isFailed && "bg-slate-100 text-slate-600"
      )}
    >
      <span aria-hidden>{isSuccess ? "✅" : isFailed ? "❌" : "•"}</span>
      {isSuccess ? "Success" : isFailed ? "Failed" : value || "—"}
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
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </Button>
  );
}

interface WalletSummaryTableProps {
  transactions: WalletSummaryTransaction[];
  wallet?: WalletSummaryWallet | null;
  user?: WalletSummaryUser | null;
  total?: number;
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onSearchChange?: (value: string) => void;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export default function WalletSummaryTable({
  transactions,
  wallet,
  total = 0,
  page = 1,
  limit = 20,
  search = "",
  dateFrom = "",
  dateTo = "",
  loading = false,
  onRefresh,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onLimitChange,
}: WalletSummaryTableProps) {
  const [pdfLoading, setPdfLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const exportDisabled = loading || transactions.length === 0;

  const columns = useMemo<TableColumn<WalletSummaryTransaction>[]>(
    () => [
      {
        id: "rowNumber",
        name: <HeaderLabel>#</HeaderLabel>,
        selector: (row) => row.rowNumber,
        sortable: true,
        width: "72px",
        cell: (row) => (
          <span className="text-xs font-semibold text-slate-500">
            {row.rowNumber}
          </span>
        ),
      },
      {
        id: "dateTime",
        name: <HeaderLabel>Date & Time</HeaderLabel>,
        selector: (row) => row.createdAt || `${row.date} ${row.time}`,
        sortable: true,
        minWidth: "168px",
        cell: (row) => (
          <span className="whitespace-nowrap text-xs font-semibold text-[#0b1f3a]">
            {formatWalletSummaryDateTime(row.date, row.time, row.createdAt)}
          </span>
        ),
      },
      {
        id: "ledgerNo",
        name: <HeaderLabel>Ledger No</HeaderLabel>,
        selector: (row) => row.ledgerNo,
        sortable: true,
        minWidth: "190px",
        cell: (row) => (
          <span
            className="block max-w-[200px] truncate font-mono text-[11px] font-medium text-slate-700"
            title={row.ledgerNo}
          >
            {row.ledgerNo || "—"}
          </span>
        ),
      },
      {
        id: "service",
        name: <HeaderLabel>Service</HeaderLabel>,
        selector: (row) => row.serviceLabel,
        sortable: true,
        minWidth: "140px",
        cell: (row) => (
          <span className="text-xs font-semibold text-[#001F5B]">
            {row.serviceLabel || "—"}
          </span>
        ),
      },
      {
        id: "description",
        name: <HeaderLabel>Description</HeaderLabel>,
        selector: (row) => row.description,
        sortable: true,
        minWidth: "180px",
        grow: 1,
        cell: (row) => (
          <span
            className="line-clamp-2 max-w-[220px] text-xs text-slate-600"
            title={row.description}
          >
            {row.description || "—"}
          </span>
        ),
      },
      {
        id: "status",
        name: <HeaderLabel>Status</HeaderLabel>,
        selector: (row) => row.status,
        sortable: true,
        minWidth: "120px",
        cell: (row) => <StatusCell status={row.status} />,
      },
      {
        id: "openingBalance",
        name: <HeaderLabel>Opening Balance</HeaderLabel>,
        selector: (row) => row.openingBalance,
        sortable: true,
        minWidth: "150px",
        cell: (row) => <MoneyCell value={row.openingBalance} />,
      },
      {
        id: "transactionAmount",
        name: <HeaderLabel>Txn Amount</HeaderLabel>,
        selector: (row) => row.transactionAmount,
        sortable: true,
        minWidth: "120px",
        cell: (row) => <MoneyCell value={row.transactionAmount} />,
      },
      {
        id: "charge",
        name: <HeaderLabel>Charge</HeaderLabel>,
        selector: (row) => row.charge,
        sortable: true,
        minWidth: "100px",
        cell: (row) => <MoneyCell value={row.charge} />,
      },
      {
        id: "commission",
        name: <HeaderLabel>Comm.</HeaderLabel>,
        selector: (row) => row.commission,
        sortable: true,
        minWidth: "100px",
        cell: (row) => <MoneyCell value={row.commission} />,
      },
      {
        id: "tds",
        name: <HeaderLabel>TDS</HeaderLabel>,
        selector: (row) => row.tds,
        sortable: true,
        minWidth: "90px",
        cell: (row) => <MoneyCell value={row.tds} />,
      },
      {
        id: "amountCr",
        name: <HeaderLabel>Credit (Cr)</HeaderLabel>,
        selector: (row) => row.amountCr,
        sortable: true,
        minWidth: "130px",
        cell: (row) => <MoneyCell value={row.amountCr} tone="credit" />,
      },
      {
        id: "amountDr",
        name: <HeaderLabel>Debit (Dr)</HeaderLabel>,
        selector: (row) => row.amountDr,
        sortable: true,
        minWidth: "130px",
        cell: (row) => <MoneyCell value={row.amountDr} tone="debit" />,
      },
      {
        id: "closingBalance",
        name: <HeaderLabel>Closing Balance</HeaderLabel>,
        selector: (row) => row.closingBalance,
        sortable: true,
        minWidth: "150px",
        cell: (row) => <MoneyCell value={row.closingBalance} tone="balance" />,
      },
    ],
    []
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#001F5B]">
                Wallet Ledger
              </h2>
              <p className="text-xs text-slate-500">
                Pending &amp; commission hidden · {total} total records
                {wallet?.balance != null && Number(wallet.balance) > 0
                  ? ` · Balance ₹${formatWalletSummaryAmount(wallet.balance)}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
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
              loading={pdfLoading}
              onClick={async () => {
                setPdfLoading(true);
                try {
                  await exportWalletSummaryPdf(transactions);
                } finally {
                  setPdfLoading(false);
                }
              }}
            />
            <ExportButton
              label="Print"
              icon={Printer}
              disabled={exportDisabled}
              onClick={() => printWalletSummary(transactions)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 rounded-md px-2.5 text-xs font-semibold"
              disabled={loading}
              onClick={() => onRefresh?.()}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-100 px-4 py-3 md:grid-cols-[1fr_auto] md:px-6">
        <div className="relative">
          <Label htmlFor="wallet-summary-search" className="sr-only">
            Search
          </Label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="wallet-summary-search"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search ledger no, service, description..."
            className="h-10 pl-9"
            disabled={loading}
          />
          {search ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
              onClick={() => onSearchChange?.("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange?.(event.target.value)}
            className="h-10 w-[150px]"
            disabled={loading}
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange?.(event.target.value)}
            className="h-10 w-[150px]"
            disabled={loading}
          />
        </div>
      </div>

      <div className="paytrue-cyan-datatable wallet-ledger-datatable overflow-x-auto px-2 pb-2 sm:px-4">
        <DataTable
          columns={columns}
          data={transactions}
          progressPending={loading}
          pagination={false}
          sortIcon={<CyanDataTableSortIcon />}
          defaultSortFieldId="dateTime"
          defaultSortAsc={false}
          highlightOnHover
          dense
          responsive={false}
          customStyles={{
            ...cyanDataTableStyles,
            table: {
              style: {
                ...cyanDataTableStyles.table?.style,
                minWidth: TABLE_MIN_WIDTH,
              },
            },
            headCells: {
              style: {
                ...cyanDataTableStyles.headCells?.style,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                overflow: "visible",
                paddingLeft: "12px",
                paddingRight: "12px",
                minWidth: "fit-content",
              },
            },
            cells: {
              style: {
                ...cyanDataTableStyles.cells?.style,
                paddingLeft: "12px",
                paddingRight: "12px",
                overflow: "visible",
              },
            },
          }}
          noDataComponent={
            <div className="py-16 text-center text-sm text-slate-500">
              {loading
                ? "Loading wallet ledger..."
                : search || dateFrom || dateTo
                  ? "No records match your search / filters"
                  : "No wallet ledger records found"}
            </div>
          }
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Rows per page</span>
          <Select
            value={String(limit)}
            onValueChange={(value) => onLimitChange?.(Number(value))}
          >
            <SelectTrigger className="h-9 w-[88px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROWS_PER_PAGE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            disabled={page <= 1 || loading}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-1"
            disabled={page >= totalPages || loading}
            onClick={() => onPageChange?.(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
