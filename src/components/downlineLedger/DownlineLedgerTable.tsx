"use client";

import { useMemo, type ReactNode } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
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
import StatementBankCell from "@/src/components/statement/StatementBankCell";
import { cn } from "@/lib/utils";
import {
  formatDownlineAmount,
  formatDownlineDate,
  formatDownlineTime,
} from "@/src/lib/downlineLedgerUtils";
import type {
  DownlineLedgerServiceFilter,
  DownlineLedgerStatusFilter,
  DownlineLedgerSummary,
  DownlineLedgerTransaction,
  DownlineLedgerTxnTypeFilter,
} from "@/src/types/downlineLedger";

const ROWS_PER_PAGE_OPTIONS = [10, 20, 25, 50, 100];

const SERVICE_FILTERS: { label: string; value: DownlineLedgerServiceFilter }[] = [
  { label: "All Services", value: "ALL" },
  { label: "DMT", value: "DMT" },
  { label: "DMT2", value: "DMT2" },
  { label: "DMT3", value: "DMT3" },
  { label: "AEPS", value: "AEPS" },
  { label: "UPI ATM", value: "UPI_ATM" },
];

const TXN_TYPE_FILTERS: { label: string; value: DownlineLedgerTxnTypeFilter }[] = [
  { label: "All Types", value: "ALL" },
  { label: "Credit", value: "CREDIT" },
  { label: "Debit", value: "DEBIT" },
];

const STATUS_FILTERS: { label: string; value: DownlineLedgerStatusFilter }[] = [
  { label: "All Status", value: "ALL" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failed", value: "FAILED" },
  { label: "Pending", value: "PENDING" },
  { label: "Reversed", value: "REVERSED" },
];

function HeaderLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block max-w-full whitespace-nowrap text-center text-[11px] font-bold uppercase tracking-wide text-white">
      {children}
    </span>
  );
}

/** Keeps cell content inside its column — prevents overlap into next columns. */
function CellBox({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full min-w-0 max-w-full overflow-hidden", className)}>
      {children}
    </div>
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
        "block w-full truncate font-semibold tabular-nums tracking-tight",
        tone === "credit" && "text-emerald-700",
        tone === "debit" && "text-red-600",
        tone === "balance" && "font-bold text-[#001F5B]",
        tone === "neutral" && "text-slate-700"
      )}
    >
      {tone === "credit" && amount ? "+" : ""}
      {tone === "debit" && amount ? "−" : ""}
      {formatDownlineAmount(amount)}
    </span>
  );
}

function StatusCell({ status }: { status: string }) {
  const value = String(status || "").toUpperCase();
  const isSuccess = value === "SUCCESS";
  const isFailed = value === "FAILED";
  const isPending = value === "PENDING";

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-[11px] font-bold",
        isSuccess && "bg-emerald-50 text-emerald-700",
        isFailed && "bg-red-50 text-red-600",
        isPending && "bg-amber-50 text-amber-700",
        !isSuccess && !isFailed && !isPending && "bg-slate-100 text-slate-600"
      )}
    >
      {value || "—"}
    </span>
  );
}

function formatAccountDisplay(value: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^X+\d{2,6}$/i.test(raw) || /^X{4,}/i.test(raw)) return raw.toUpperCase();
  if (/^\d{9,18}$/.test(raw)) {
    return raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }
  return raw;
}

function AccountCell({ row }: { row: DownlineLedgerTransaction }) {
  const isAeps = String(row.serviceType || "").toUpperCase().includes("AEPS");
  const account = String(row.accountNumber || "").trim();
  const aadhaar = String(row.aadhaarMasked || "").trim();
  const ifsc = String(row.ifscCode || "").trim().toUpperCase();

  const primary =
    account && account !== aadhaar
      ? account
      : account || (isAeps ? aadhaar : "") || aadhaar;
  const showAadhaarExtra =
    isAeps && aadhaar && primary && aadhaar !== primary;

  if (!primary && !ifsc) {
    return <span className="text-slate-300">—</span>;
  }

  return (
    <CellBox className="space-y-0.5 py-0.5">
      {primary ? (
        <>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {isAeps && !account && aadhaar ? "Aadhaar" : "Account No."}
          </p>
          <p
            className="truncate font-mono text-[12px] font-bold tabular-nums tracking-wide text-[#0b1f3a]"
            title={primary}
          >
            {formatAccountDisplay(primary)}
          </p>
        </>
      ) : null}
      {showAadhaarExtra ? (
        <p
          className="truncate font-mono text-[11px] tabular-nums text-slate-500"
          title={aadhaar}
        >
          Aadhaar: {formatAccountDisplay(aadhaar)}
        </p>
      ) : null}
      {ifsc ? (
        <p
          className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500"
          title={ifsc}
        >
          IFSC: {ifsc}
        </p>
      ) : null}
    </CellBox>
  );
}

function BeneficiaryCell({ row }: { row: DownlineLedgerTransaction }) {
  const name = row.accountHolderName || "—";
  const mobile = row.beneficiaryMobile || "";
  return (
    <CellBox className="space-y-0.5">
      <p className="truncate font-semibold text-[#0b1f3a]" title={name}>
        {name}
      </p>
      <p
        className="truncate text-xs tabular-nums text-slate-500"
        title={mobile || undefined}
      >
        {mobile || "—"}
      </p>
    </CellBox>
  );
}

function RetailerCell({ row }: { row: DownlineLedgerTransaction }) {
  return (
    <CellBox className="space-y-0.5">
      <p
        className="truncate font-semibold text-[#0b1f3a]"
        title={row.retailerName}
      >
        {row.retailerName || "—"}
      </p>
      <p className="truncate text-xs tabular-nums text-slate-500">
        {row.retailerMobile || "—"}
      </p>
      {row.retailerCode ? (
        <p className="truncate font-mono text-[10px] font-semibold text-[#1565d8]">
          {row.retailerCode}
        </p>
      ) : null}
    </CellBox>
  );
}

function StackedHeader({ lines }: { lines: string[] }) {
  return (
    <span className="flex flex-col leading-tight">
      {lines.map((line) => (
        <span
          key={line}
          className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-white"
        >
          {line}
        </span>
      ))}
    </span>
  );
}

interface DownlineLedgerTableProps {
  transactions: DownlineLedgerTransaction[];
  summary?: DownlineLedgerSummary | null;
  total?: number;
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  serviceType?: DownlineLedgerServiceFilter;
  transactionType?: DownlineLedgerTxnTypeFilter;
  status?: DownlineLedgerStatusFilter;
  loading?: boolean;
  onSearchChange?: (value: string) => void;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onServiceTypeChange?: (value: DownlineLedgerServiceFilter) => void;
  onTransactionTypeChange?: (value: DownlineLedgerTxnTypeFilter) => void;
  onStatusChange?: (value: DownlineLedgerStatusFilter) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRefresh?: () => void;
}

export default function DownlineLedgerTable({
  transactions,
  summary,
  total = 0,
  page = 1,
  limit = 20,
  search = "",
  dateFrom = "",
  dateTo = "",
  serviceType = "ALL",
  transactionType = "ALL",
  status = "ALL",
  loading = false,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onServiceTypeChange,
  onTransactionTypeChange,
  onStatusChange,
  onPageChange,
  onLimitChange,
  onRefresh,
}: DownlineLedgerTableProps) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (limit || 1)));
  const hasFilters =
    Boolean(search.trim()) ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    serviceType !== "ALL" ||
    transactionType !== "ALL" ||
    status !== "ALL";

  const clearFilters = () => {
    onSearchChange?.("");
    onDateFromChange?.("");
    onDateToChange?.("");
    onServiceTypeChange?.("ALL");
    onTransactionTypeChange?.("ALL");
    onStatusChange?.("ALL");
  };

  const columns: TableColumn<DownlineLedgerTransaction>[] = useMemo(
    () => [
      {
        id: "date",
        name: <HeaderLabel>Date</HeaderLabel>,
        selector: (row) => row.createdAt,
        sortable: true,
        width: "108px",
        cell: (row) => (
          <CellBox>
            <span className="block truncate whitespace-nowrap text-slate-700">
              {formatDownlineDate(row.createdAt)}
            </span>
          </CellBox>
        ),
      },
      {
        id: "time",
        name: <HeaderLabel>Time</HeaderLabel>,
        selector: (row) => row.createdAt,
        width: "88px",
        cell: (row) => (
          <CellBox>
            <span className="block truncate whitespace-nowrap text-slate-500">
              {formatDownlineTime(row.createdAt)}
            </span>
          </CellBox>
        ),
      },
      {
        id: "retailer",
        name: <HeaderLabel>Retailer</HeaderLabel>,
        selector: (row) => row.retailerName,
        sortable: true,
        width: "168px",
        cell: (row) => <RetailerCell row={row} />,
      },
      {
        id: "transactionId",
        name: <HeaderLabel>Txn ID</HeaderLabel>,
        selector: (row) => row.transactionId,
        width: "150px",
        cell: (row) => (
          <CellBox className="space-y-0.5">
            <p
              className="truncate font-mono text-xs text-slate-700"
              title={row.transactionId}
            >
              {row.transactionId || "—"}
            </p>
            {row.referenceId && row.referenceId !== row.transactionId ? (
              <p
                className="truncate font-mono text-[10px] text-slate-400"
                title={row.referenceId}
              >
                Ref: {row.referenceId}
              </p>
            ) : null}
          </CellBox>
        ),
      },
      {
        id: "service",
        name: <HeaderLabel>Service</HeaderLabel>,
        selector: (row) => row.serviceLabel,
        width: "128px",
        cell: (row) => (
          <CellBox>
            <span
              className="inline-block max-w-full truncate rounded-md bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-700"
              title={row.serviceLabel}
            >
              {row.serviceLabel}
            </span>
          </CellBox>
        ),
      },
      {
        id: "description",
        name: <HeaderLabel>Description</HeaderLabel>,
        selector: (row) => row.description,
        width: "170px",
        cell: (row) => (
          <CellBox>
            <span
              className="line-clamp-2 break-words text-xs text-slate-600"
              title={row.description || row.narration}
            >
              {row.description || row.narration || "—"}
            </span>
          </CellBox>
        ),
      },
      {
        id: "beneficiary",
        name: <HeaderLabel>Beneficiary</HeaderLabel>,
        selector: (row) => row.accountHolderName,
        width: "140px",
        cell: (row) => <BeneficiaryCell row={row} />,
      },
      {
        id: "bank",
        name: <HeaderLabel>Bank</HeaderLabel>,
        width: "160px",
        cell: (row) => (
          <CellBox>
            <div className="max-w-full overflow-hidden [&_span]:!block [&_span]:truncate">
              <StatementBankCell
                bankName={row.bankName}
                receiverName={row.accountHolderName}
                ifscCode={row.ifscCode}
              />
            </div>
          </CellBox>
        ),
      },
      {
        id: "account",
        name: <StackedHeader lines={["Account", "Number"]} />,
        width: "150px",
        cell: (row) => <AccountCell row={row} />,
      },
      {
        id: "type",
        name: <HeaderLabel>Type</HeaderLabel>,
        width: "88px",
        cell: (row) => (
          <CellBox>
            <span
              className={cn(
                "inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-bold",
                row.transactionType === "CREDIT"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-600"
              )}
            >
              {row.transactionType || "—"}
            </span>
          </CellBox>
        ),
      },
      {
        id: "amount",
        name: <StackedHeader lines={["Transfer", "Amount"]} />,
        width: "112px",
        right: true,
        cell: (row) => (
          <CellBox>
            <MoneyCell
              value={row.transactionAmount}
              tone={row.transactionType === "CREDIT" ? "credit" : "debit"}
            />
          </CellBox>
        ),
      },
      {
        id: "charge",
        name: <StackedHeader lines={["Charge", "Amount"]} />,
        width: "104px",
        right: true,
        cell: (row) => (
          <CellBox>
            <MoneyCell
              value={row.chargeAmount}
              tone={row.chargeAmount > 0 ? "debit" : "neutral"}
            />
          </CellBox>
        ),
      },
      {
        id: "commission",
        name: <HeaderLabel>Commission</HeaderLabel>,
        width: "112px",
        right: true,
        cell: (row) => (
          <CellBox>
            <MoneyCell
              value={row.commissionAmount}
              tone={row.commissionAmount > 0 ? "credit" : "neutral"}
            />
          </CellBox>
        ),
      },
      {
        id: "totalDebit",
        name: <StackedHeader lines={["Total", "Debit"]} />,
        width: "112px",
        right: true,
        cell: (row) => {
          const total =
            row.totalDebitAmount ||
            (row.transactionType === "DEBIT"
              ? row.transactionAmount + row.chargeAmount
              : 0);
          return (
            <CellBox>
              <MoneyCell value={total} tone={total > 0 ? "debit" : "neutral"} />
            </CellBox>
          );
        },
      },
      {
        id: "opening",
        name: <StackedHeader lines={["Previous", "Balance"]} />,
        width: "112px",
        right: true,
        cell: (row) => (
          <CellBox>
            <MoneyCell value={row.openingBalance} tone="balance" />
          </CellBox>
        ),
      },
      {
        id: "closing",
        name: <StackedHeader lines={["Closing", "Balance"]} />,
        width: "112px",
        right: true,
        cell: (row) => (
          <CellBox>
            <MoneyCell value={row.closingBalance} tone="balance" />
          </CellBox>
        ),
      },
      {
        id: "status",
        name: <HeaderLabel>Status</HeaderLabel>,
        width: "112px",
        cell: (row) => (
          <CellBox>
            <StatusCell status={row.status} />
          </CellBox>
        ),
      },
      {
        id: "narration",
        name: <HeaderLabel>Narration</HeaderLabel>,
        width: "200px",
        cell: (row) => (
          <CellBox>
            <span
              className="line-clamp-2 break-words text-xs leading-snug text-slate-500"
              title={row.narration}
            >
              {row.narration || "—"}
            </span>
          </CellBox>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      {summary ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Total Txns", value: summary.totalTransactions },
            { label: "Success", value: summary.successfulTransactions },
            {
              label: "Total Debit",
              value: `₹${formatDownlineAmount(summary.totalDebitAmount)}`,
            },
            {
              label: "Total Credit",
              value: `₹${formatDownlineAmount(summary.totalCreditAmount)}`,
            },
            {
              label: "Total Charges",
              value: `₹${formatDownlineAmount(summary.totalCharges)}`,
            },
            {
              label: "Total Commission",
              value: `₹${formatDownlineAmount(summary.totalCommission)}`,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {item.label}
              </p>
              <p className="mt-1 text-lg font-extrabold tabular-nums text-[#0b1f3a]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search name, mobile, txn ID, reference…"
              className="h-11 rounded-xl pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              onClick={() => onRefresh?.()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                className="h-11 rounded-xl"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500">Service</Label>
            <Select
              value={serviceType}
              onValueChange={(value) =>
                onServiceTypeChange?.(value as DownlineLedgerServiceFilter)
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_FILTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500">Type</Label>
            <Select
              value={transactionType}
              onValueChange={(value) =>
                onTransactionTypeChange?.(value as DownlineLedgerTxnTypeFilter)
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {TXN_TYPE_FILTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                onStatusChange?.(value as DownlineLedgerStatusFilter)
              }
            >
              <SelectTrigger className="h-10 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500">Start Date</Label>
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(e) => onDateFromChange?.(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-500">End Date</Label>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(e) => onDateToChange?.(e.target.value)}
              className="h-10 rounded-xl"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {SERVICE_FILTERS.filter((item) => item.value !== "ALL").map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onServiceTypeChange?.(item.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition",
                serviceType === item.value
                  ? "bg-[#1565d8] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-[#1565d8]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto rounded-3xl">
          <DataTable
            columns={columns}
            data={transactions}
            progressPending={loading}
            progressComponent={
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading ledger…
              </div>
            }
            noDataComponent={
              <div className="py-12 text-center text-sm text-slate-500">
                No downline ledger entries found.
              </div>
            }
            pagination={false}
            sortIcon={<CyanDataTableSortIcon />}
            customStyles={{
              ...cyanDataTableStyles,
              table: {
                style: {
                  ...cyanDataTableStyles.table?.style,
                  minWidth: "2500px",
                  tableLayout: "fixed",
                },
              },
              headCells: {
                style: {
                  ...cyanDataTableStyles.headCells?.style,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              },
              cells: {
                style: {
                  ...cyanDataTableStyles.cells?.style,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  maxWidth: 0, // forces children to respect column width
                },
              },
            }}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing page {page} of {totalPages} · {total} total
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(limit)}
              onValueChange={(value) => onLimitChange?.(Number(value))}
            >
              <SelectTrigger className="h-9 w-[110px] rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-lg"
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
              className="h-9 rounded-lg"
              disabled={page >= totalPages || loading}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
