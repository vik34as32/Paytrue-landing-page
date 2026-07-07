"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/src/redux/types";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/src/components/common/StatusBadge";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import { formatCurrency, cn } from "@/lib/utils";
import { exportToCsv, exportToExcel } from "@/src/lib/exportUtils";
import {
  filterWalletHistoryRows,
  formatWalletHistoryDate,
  WALLET_HISTORY_EXPORT_COLUMNS,
  type WalletHistoryTypeFilter,
} from "@/src/lib/walletHistoryUtils";
import {
  fetchTransferHistory,
  fetchWalletBalance,
} from "@/src/redux/thunks/walletThunk";
import {
  selectRtWallet,
  selectTransferHistory,
} from "@/src/redux/slices/walletSlice";
import type { WalletTransferRecord } from "@/types/wallet";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
const TYPE_FILTERS: WalletHistoryTypeFilter[] = ["All", "Credit", "Debit"];
const FILTER_LABEL_CLASS = "text-xs font-medium leading-none text-slate-500";
const FILTER_INPUT_CLASS =
  "h-11 rounded-xl border-slate-200 bg-white shadow-sm text-sm";

function dashIfEmpty(value: string | number | undefined | null) {
  if (value == null || value === "" || value === "—") return "—";
  return String(value);
}

function MobileHistoryCard({ row }: { row: WalletTransferRecord }) {
  const isCredit = row.credit > 0;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {row.transactionId}
          </p>
          <p className="mt-1 text-sm font-semibold text-[#001F5B]">
            {row.description || row.remark || row.transactionType}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatWalletHistoryDate(row.date)}
          </p>
        </div>
        <StatusBadge status={row.status} />
      </div>
      <div className="mt-3 flex items-end justify-between">
        <p
          className={cn(
            "text-lg font-bold tabular-nums",
            isCredit ? "text-emerald-600" : "text-red-600"
          )}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(isCredit ? row.credit : row.debit)}
        </p>
        <p className="text-xs text-slate-500">
          Bal: {formatCurrency(row.closingBalance)}
        </p>
      </div>
    </div>
  );
}

function MobilePagination({
  page,
  totalPages,
  rowsPerPage,
  totalRows,
  onPageChange,
  onRowsPerPageChange,
}: {
  page: number;
  totalPages: number;
  rowsPerPage: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}) {
  const from = totalRows === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const to = Math.min(page * rowsPerPage, totalRows);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-500">
        Showing {from}–{to} of {totalRows}
      </p>
      <div className="flex items-center gap-2">
        <select
          value={rowsPerPage}
          onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
          aria-label="Rows per page"
        >
          {ROWS_PER_PAGE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} / page
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[4rem] text-center text-xs font-medium text-slate-600">
          {page} / {totalPages || 1}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function RetailerWalletHistoryTable() {
  const dispatch = useDispatch<AppDispatch>();
  const wallet = useSelector(selectRtWallet);
  const history = useSelector(selectTransferHistory);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<WalletHistoryTypeFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobilePage, setMobilePage] = useState(1);

  useEffect(() => {
    dispatch(fetchWalletBalance({ role: "rt" }));
    dispatch(
      fetchTransferHistory({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
  }, [dispatch]);

  const filteredRows = useMemo(
    () =>
      filterWalletHistoryRows(history.list, {
        search,
        typeFilter,
        dateFrom,
        dateTo,
      }),
    [history.list, search, typeFilter, dateFrom, dateTo]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  const paginatedMobileRows = useMemo(() => {
    const start = (mobilePage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, mobilePage, rowsPerPage]);

  useEffect(() => {
    setMobilePage(1);
    setCurrentPage(1);
  }, [search, typeFilter, dateFrom, dateTo, rowsPerPage]);

  useEffect(() => {
    if (mobilePage > totalPages) {
      setMobilePage(totalPages);
    }
  }, [mobilePage, totalPages]);

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const hasLoadedBalance = wallet.lastUpdated != null;
  const balance = hasLoadedBalance
    ? wallet.currentBalance ?? wallet.availableBalance ?? wallet.balance ?? 0
    : 0;

  const columns: TableColumn<WalletTransferRecord>[] = useMemo(
    () => [
      {
        id: "sno",
        name: "S.No",
        width: "72px",
        center: true,
        cell: (_row, index) => (
          <span className="font-medium text-slate-700">
            {(currentPage - 1) * rowsPerPage + (index ?? 0) + 1}
          </span>
        ),
      },
      {
        id: "date",
        name: "Date",
        selector: (row) => row.date,
        sortable: true,
        minWidth: "158px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap text-center text-slate-600">
            {formatWalletHistoryDate(row.date)}
          </span>
        ),
      },
      {
        id: "transactionId",
        name: "Transaction ID",
        selector: (row) => row.transactionId,
        sortable: true,
        minWidth: "140px",
        center: true,
        cell: (row) => (
          <span className="font-semibold text-[#0057D9]">{row.transactionId}</span>
        ),
      },
      {
        id: "transactionType",
        name: "Txn Type",
        selector: (row) => row.transactionType,
        sortable: true,
        minWidth: "108px",
        center: true,
        cell: (row) => (
          <span className="text-center text-slate-600">
            {dashIfEmpty(row.transactionType)}
          </span>
        ),
      },
      {
        id: "description",
        name: "Description",
        selector: (row) => row.description || row.remark,
        minWidth: "150px",
        grow: 1,
        cell: (row) => (
          <span
            className="block max-w-[220px] truncate text-slate-700"
            title={row.description || row.remark || undefined}
          >
            {dashIfEmpty(row.description || row.remark)}
          </span>
        ),
      },
      {
        id: "credit",
        name: "Credit",
        selector: (row) => row.credit,
        sortable: true,
        minWidth: "118px",
        center: true,
        cell: (row) =>
          row.credit > 0 ? (
            <span className="font-semibold text-emerald-600">
              +{formatCurrency(row.credit)}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        id: "debit",
        name: "Debit",
        selector: (row) => row.debit,
        sortable: true,
        minWidth: "118px",
        center: true,
        cell: (row) =>
          row.debit > 0 ? (
            <span className="font-semibold text-red-600">
              -{formatCurrency(row.debit)}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          ),
      },
      {
        id: "openingBalance",
        name: "Opening Balance",
        selector: (row) => row.openingBalance,
        sortable: true,
        minWidth: "148px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap font-medium text-slate-700">
            {formatCurrency(row.openingBalance)}
          </span>
        ),
      },
      {
        id: "closingBalance",
        name: "Closing Balance",
        selector: (row) => row.closingBalance,
        sortable: true,
        minWidth: "148px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap font-bold text-[#001F5B]">
            {formatCurrency(row.closingBalance)}
          </span>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "120px",
        right: true,
        cell: (row) => (
          <div className="flex w-full items-center justify-end">
            <StatusBadge status={row.status} />
          </div>
        ),
      },
    ],
    [currentPage, rowsPerPage]
  );

  const exportDisabled = filteredRows.length === 0;

  return (
    <Card className="min-w-0 rounded-2xl border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-[#001F5B]">Wallet History</CardTitle>
            <CardDescription>
              {filteredRows.length} of {history.total || history.list.length}{" "}
              transactions
              {hasActiveFilters ? " (filtered)" : ""}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={exportDisabled}
              onClick={() =>
                exportToCsv(
                  `Wallet_History_${new Date().toISOString().slice(0, 10)}.csv`,
                  filteredRows,
                  WALLET_HISTORY_EXPORT_COLUMNS
                )
              }
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={exportDisabled}
              onClick={() =>
                exportToExcel(
                  `Wallet_History_${new Date().toISOString().slice(0, 10)}`,
                  filteredRows,
                  WALLET_HISTORY_EXPORT_COLUMNS
                )
              }
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button asChild size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Link href="/rt/retailer/fund-request">
                <Plus className="h-4 w-4" />
                Add Balance
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 sm:grid-cols-[1fr_auto] sm:items-center dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Available Wallet Balance
            </p>
            {wallet.loading && !hasLoadedBalance ? (
              <Loader2 className="mt-1 h-5 w-5 animate-spin text-emerald-600" />
            ) : (
              <p className="mt-1 text-2xl font-bold text-[#001F5B] dark:text-white">
                {formatCurrency(balance)}
              </p>
            )}
          </div>
          <Button asChild variant="outline" className="border-emerald-200 bg-white">
            <Link href="/rt/retailer/fund-request/bank-details">
              View Deposit Banks
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:items-end">
          <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
            <Label htmlFor="wallet-search" className={FILTER_LABEL_CLASS}>
              Search
            </Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="wallet-search"
                placeholder="Transaction ID, type, description..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className={cn(FILTER_INPUT_CLASS, "pl-9")}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wallet-date-from" className={FILTER_LABEL_CLASS}>
              Start Date
            </Label>
            <Input
              id="wallet-date-from"
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
              className={cn(FILTER_INPUT_CLASS, "paytrue-filter-date w-full")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wallet-date-to" className={FILTER_LABEL_CLASS}>
              End Date
            </Label>
            <Input
              id="wallet-date-to"
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
              className={cn(FILTER_INPUT_CLASS, "paytrue-filter-date w-full")}
            />
          </div>
          {hasActiveFilters && (
            <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
              <span className={cn(FILTER_LABEL_CLASS, "invisible select-none")}>
                Clear
              </span>
              <Button
                type="button"
                variant="outline"
                className={cn(FILTER_INPUT_CLASS, "gap-1.5 px-4")}
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setTypeFilter(filter)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                typeFilter === filter
                  ? filter === "Credit"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                    : filter === "Debit"
                      ? "bg-red-600 text-white shadow-md shadow-red-200"
                      : "bg-[#1565d8] text-white shadow-md shadow-blue-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#1565d8]/30 hover:bg-blue-50 hover:text-[#1565d8]"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="min-w-0 px-0 pb-0 pt-4">
        {history.error && (
          <div className="mx-4 mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 sm:mx-6">
            {history.error}
          </div>
        )}

        {history.loading && history.list.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1565d8]" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-600">
              No wallet transactions found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add balance via fund request to see credit entries here.
            </p>
            <Button asChild className="mt-4 gap-1.5">
              <Link href="/rt/retailer/fund-request">
                <Plus className="h-4 w-4" />
                Add Balance
              </Link>
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="link"
                className="mt-2"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="paytrue-cyan-datatable hidden px-4 pb-2 sm:px-6 md:block">
              <DataTable
                columns={columns}
                data={filteredRows}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setCurrentPage}
                paginationResetDefaultPage
                paginationComponentOptions={{
                  rowsPerPageText: "Rows per page:",
                  rangeSeparatorText: "of",
                }}
                sortIcon={<CyanDataTableSortIcon />}
                defaultSortFieldId="date"
                defaultSortAsc={false}
                highlightOnHover
                striped
                customStyles={cyanDataTableStyles}
                noTableHead={false}
              />
            </div>

            <div className="md:hidden">
              <div className="space-y-3 px-4 pb-2">
                {paginatedMobileRows.map((row) => (
                  <MobileHistoryCard key={row.id} row={row} />
                ))}
              </div>
              <MobilePagination
                page={mobilePage}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                totalRows={filteredRows.length}
                onPageChange={setMobilePage}
                onRowsPerPageChange={setRowsPerPage}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
