"use client";

import { useMemo, useState, type ReactNode } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Landmark, Inbox, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import { cn } from "@/lib/utils";
import {
  exportAepsLedgerCsv,
  exportAepsLedgerExcel,
  formatAepsLedgerAmount,
  formatAepsLedgerDateTime,
} from "@/src/lib/aepsLedgerUtils";
import { exportRetailerAepsLedger } from "@/src/services/aeps-ledger.service";
import type {
  AepsLedgerExportFormat,
  AepsLedgerRow,
  AepsLedgerSortBy,
  AepsLedgerSortOrder,
  AepsLedgerWallet,
} from "@/types/aeps-ledger";
import { AepsLedgerExport } from "./AepsLedgerExport";
import { AepsLedgerFilters } from "./AepsLedgerFilters";
import { AepsLedgerPagination } from "./AepsLedgerPagination";
import { AepsLedgerSearch } from "./AepsLedgerSearch";
import { AepsLedgerSkeleton } from "./AepsLedgerSkeleton";
import { AepsLedgerStatusBadge } from "./AepsLedgerStatusBadge";

const TABLE_MIN_WIDTH = "2100px";

const SORT_FIELD_MAP: Record<string, AepsLedgerSortBy> = {
  dateTime: "createdAt",
  ledgerNo: "ledgerNo",
  transactionAmount: "transactionAmount",
  closingBalance: "closingBalance",
};

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
      {formatAepsLedgerAmount(amount)}
    </span>
  );
}

export interface AepsLedgerTableProps {
  transactions: AepsLedgerRow[];
  wallet?: AepsLedgerWallet | null;
  total?: number;
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  service?: string;
  sortBy?: string;
  sortOrder?: AepsLedgerSortOrder;
  loading?: boolean;
  error?: boolean;
  onRefresh?: () => void;
  onSearchChange?: (value: string) => void;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onServiceChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSortChange?: (sortBy: AepsLedgerSortBy, sortOrder: AepsLedgerSortOrder) => void;
}

export function AepsLedgerTable({
  transactions,
  wallet,
  total = 0,
  page = 1,
  limit = 20,
  search = "",
  dateFrom = "",
  dateTo = "",
  status = "All",
  service = "All",
  sortOrder = "desc",
  loading = false,
  error = false,
  onRefresh,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onStatusChange,
  onServiceChange,
  onPageChange,
  onLimitChange,
  onSortChange,
}: AepsLedgerTableProps) {
  const [csvLoading, setCsvLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);

  const exportDisabled = loading || transactions.length === 0;

  function requireDateRange(): boolean {
    if (!dateFrom?.trim() || !dateTo?.trim()) {
      toast.error("Please select Start Date and End Date to export");
      return false;
    }
    if (dateFrom > dateTo) {
      toast.error("Start Date cannot be after End Date");
      return false;
    }
    return true;
  }

  async function handleFileExport(format: AepsLedgerExportFormat) {
    if (exportDisabled) return;
    if (!requireDateRange()) return;

    const setLoading = format === "csv" ? setCsvLoading : setExcelLoading;
    setLoading(true);
    try {
      try {
        await exportRetailerAepsLedger({
          fromDate: dateFrom,
          toDate: dateTo,
          format,
          search: search.trim() || undefined,
          status: status !== "All" ? status : undefined,
          service: service !== "All" ? service : undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
      } catch {
        if (format === "csv") exportAepsLedgerCsv(transactions);
        else exportAepsLedgerExcel(transactions);
      }
      toast.success(format === "csv" ? "CSV downloaded" : "Excel downloaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Export failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo<TableColumn<AepsLedgerRow>[]>(
    () => [
      {
        id: "rowNumber",
        name: <HeaderLabel>#</HeaderLabel>,
        selector: (row) => row.rowNumber,
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
            {formatAepsLedgerDateTime(row.date, row.time, row.createdAt)}
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
        minWidth: "120px",
        cell: (row) => <AepsLedgerStatusBadge status={row.status} />,
      },
      {
        id: "openingBalance",
        name: <HeaderLabel>Opening Balance</HeaderLabel>,
        selector: (row) => row.openingBalance,
        minWidth: "150px",
        cell: (row) => <MoneyCell value={row.openingBalance} />,
      },
      {
        id: "transactionAmount",
        name: <HeaderLabel>Transaction Amount</HeaderLabel>,
        selector: (row) => row.transactionAmount,
        sortable: true,
        minWidth: "150px",
        cell: (row) => <MoneyCell value={row.transactionAmount} />,
      },
      {
        id: "charge",
        name: <HeaderLabel>Charge</HeaderLabel>,
        selector: (row) => row.charge,
        minWidth: "100px",
        cell: (row) => <MoneyCell value={row.charge} />,
      },
      {
        id: "commission",
        name: <HeaderLabel>Commission</HeaderLabel>,
        selector: (row) => row.commission,
        minWidth: "110px",
        cell: (row) => <MoneyCell value={row.commission} />,
      },
      {
        id: "tds",
        name: <HeaderLabel>TDS</HeaderLabel>,
        selector: (row) => row.tds,
        minWidth: "90px",
        cell: (row) => <MoneyCell value={row.tds} />,
      },
      {
        id: "amountCr",
        name: <HeaderLabel>Credit (CR)</HeaderLabel>,
        selector: (row) => row.amountCr,
        minWidth: "130px",
        cell: (row) => <MoneyCell value={row.amountCr} tone="credit" />,
      },
      {
        id: "amountDr",
        name: <HeaderLabel>Debit (DR)</HeaderLabel>,
        selector: (row) => row.amountDr,
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
      {
        id: "rrn",
        name: <HeaderLabel>RRN</HeaderLabel>,
        selector: (row) => row.rrn,
        minWidth: "140px",
        cell: (row) => (
          <span className="font-mono text-[11px] text-slate-600">
            {row.rrn || "—"}
          </span>
        ),
      },
      {
        id: "bank",
        name: <HeaderLabel>Bank</HeaderLabel>,
        selector: (row) => row.bank,
        minWidth: "120px",
        cell: (row) => (
          <span className="text-xs font-medium text-slate-700">
            {row.bank || "—"}
          </span>
        ),
      },
      {
        id: "remarks",
        name: <HeaderLabel>Remarks</HeaderLabel>,
        selector: (row) => row.remarks || "",
        minWidth: "160px",
        cell: (row) => (
          <span
            className="line-clamp-2 max-w-[180px] text-xs text-slate-500"
            title={row.remarks || undefined}
          >
            {row.remarks || "—"}
          </span>
        ),
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
                AEPS Wallet Ledger
              </h2>
              <p className="text-xs text-slate-500">
                {total} total records
                {wallet?.balance != null && Number(wallet.balance) > 0
                  ? ` · Balance ₹${formatAepsLedgerAmount(wallet.balance)}`
                  : ""}
              </p>
            </div>
          </div>

          <AepsLedgerExport
            disabled={exportDisabled}
            loading={loading}
            csvLoading={csvLoading}
            excelLoading={excelLoading}
            onCsv={() => void handleFileExport("csv")}
            onExcel={() => void handleFileExport("excel")}
            onRefresh={onRefresh}
          />
        </div>
      </div>

      <div className="grid gap-3 border-b border-slate-100 px-4 py-3 md:grid-cols-[1fr_auto] md:px-6">
        <AepsLedgerSearch
          value={search}
          onChange={(value) => onSearchChange?.(value)}
          disabled={loading}
        />
        <AepsLedgerFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          status={status}
          service={service}
          disabled={loading}
          onDateFromChange={(value) => onDateFromChange?.(value)}
          onDateToChange={(value) => onDateToChange?.(value)}
          onStatusChange={(value) => onStatusChange?.(value)}
          onServiceChange={(value) => onServiceChange?.(value)}
        />
      </div>

      {error && !loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm font-medium text-slate-600">
            Unable to load AEPS ledger.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onRefresh?.()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      ) : loading && transactions.length === 0 ? (
        <AepsLedgerSkeleton />
      ) : (
        <div className="paytrue-cyan-datatable wallet-ledger-datatable overflow-x-auto px-2 pb-2 sm:px-4">
          <DataTable
            columns={columns}
            data={transactions}
            progressPending={loading && transactions.length > 0}
            pagination={false}
            sortServer
            sortIcon={<CyanDataTableSortIcon />}
            defaultSortFieldId="dateTime"
            defaultSortAsc={sortOrder === "asc"}
            onSort={(column, direction) => {
              const fieldId = String(column.id || "");
              const mapped = SORT_FIELD_MAP[fieldId];
              if (!mapped) return;
              onSortChange?.(mapped, direction === "asc" ? "asc" : "desc");
            }}
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
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Inbox className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#001F5B]">
                    No AEPS Transactions Found
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {search || dateFrom || dateTo || status !== "All" || service !== "All"
                      ? "No records match your search / filters"
                      : "There are no AEPS ledger entries yet"}
                  </p>
                </div>
              </div>
            }
          />
        </div>
      )}

      <AepsLedgerPagination
        page={page}
        limit={limit}
        total={total}
        loading={loading}
        onPageChange={(next) => onPageChange?.(next)}
        onLimitChange={(next) => onLimitChange?.(next)}
      />
    </div>
  );
}

export default AepsLedgerTable;
