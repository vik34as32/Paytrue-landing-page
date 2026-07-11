"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Printer,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
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
import { formatCurrency, cn } from "@/lib/utils";
import {
  exportFundRequestsCsv,
  exportFundRequestsExcel,
  exportFundRequestsPdf,
  filterFundRequests,
  formatFundRequestDate,
  formatFundRequestDateOnly,
  formatPaymentModeLabel,
  printFundRequests,
  viewFundRequestReceipt,
} from "@/src/lib/fundRequestUtils";
import {
  FUND_REQUEST_STATUS_FILTERS,
  type FundRequest,
  type FundRequestStatusFilter,
} from "@/src/types/fundRequest";
import FundRequestStatusBadge from "./FundRequestStatusBadge";
import EmptyState from "./EmptyState";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
  FUND_REQUEST_TABLE_MIN_WIDTH,
} from "@/src/components/common/cyanDataTableStyles";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

function StackedHeader({ lines }: { lines: string[] }) {
  return (
    <span className="inline-flex flex-col items-center justify-center leading-[1.15]">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

interface FundRequestTableProps {
  requests: FundRequest[];
  total?: number;
  page?: number;
  limit?: number;
  search?: string;
  statusFilter?: FundRequestStatusFilter;
  dateFrom?: string;
  dateTo?: string;
  serverMode?: boolean;
  loading?: boolean;
  onSearchChange?: (value: string) => void;
  onStatusFilterChange?: (value: FundRequestStatusFilter) => void;
  onDateFromChange?: (value: string) => void;
  onDateToChange?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick: (request: FundRequest) => void;
  onCancelRequest: (request: FundRequest) => void;
  onCreateClick?: () => void;
}

function MobileRequestCard({
  request,
  onView,
  onCancel,
  onViewReceipt,
}: {
  request: FundRequest;
  onView: () => void;
  onCancel: () => void;
  onViewReceipt: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onView();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {request.referenceNumber || request.requestId}
          </p>
          <p className="mt-1 text-lg font-bold text-[#001F5B]">
            {formatCurrency(request.amount)}
          </p>
        </div>
        <FundRequestStatusBadge status={request.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <p className="text-slate-400">Company Bank</p>
          <p className="font-medium">{request.companyBankName || "—"}</p>
        </div>
        <div>
          <p className="text-slate-400">Mode</p>
          <p className="font-medium">{formatPaymentModeLabel(request.paymentMode)}</p>
        </div>
        <div>
          <p className="text-slate-400">UTR</p>
          <p className="font-medium">{request.utrNumber || "—"}</p>
        </div>
        <div>
          <p className="text-slate-400">Date</p>
          <p className="font-medium">{formatFundRequestDate(request.createdAt)}</p>
        </div>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        <Button type="button" size="sm" variant="outline" onClick={onView}>
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onViewReceipt}>
          <Download className="h-3.5 w-3.5" />
          Receipt
        </Button>
        {request.status === "pending" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700"
            onClick={onCancel}
          >
            <XCircle className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
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

export default function FundRequestTable({
  requests,
  total: totalRowsProp,
  page: pageProp,
  limit: limitProp,
  search: searchProp,
  statusFilter: statusFilterProp,
  dateFrom: dateFromProp,
  dateTo: dateToProp,
  serverMode = false,
  loading = false,
  onSearchChange,
  onStatusFilterChange,
  onDateFromChange,
  onDateToChange,
  onPageChange,
  onLimitChange,
  onRowClick,
  onCancelRequest,
  onCreateClick,
}: FundRequestTableProps) {
  const [localSearch, setLocalSearch] = useState("");
  const [localStatusFilter, setLocalStatusFilter] =
    useState<FundRequestStatusFilter>("All");
  const [localDateFrom, setLocalDateFrom] = useState("");
  const [localDateTo, setLocalDateTo] = useState("");
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [localMobilePage, setLocalMobilePage] = useState(1);

  const search = serverMode ? (searchProp ?? "") : localSearch;
  const statusFilter = serverMode ? (statusFilterProp ?? "All") : localStatusFilter;
  const dateFrom = serverMode ? (dateFromProp ?? "") : localDateFrom;
  const dateTo = serverMode ? (dateToProp ?? "") : localDateTo;
  const rowsPerPage = serverMode ? (limitProp ?? 10) : localRowsPerPage;
  const currentPage = serverMode ? (pageProp ?? 1) : localCurrentPage;
  const mobilePage = serverMode ? (pageProp ?? 1) : localMobilePage;

  const setSearch = (value: string) => {
    if (serverMode) onSearchChange?.(value);
    else setLocalSearch(value);
  };
  const setStatusFilter = (value: FundRequestStatusFilter) => {
    if (serverMode) onStatusFilterChange?.(value);
    else setLocalStatusFilter(value);
  };
  const setDateFrom = (value: string) => {
    if (serverMode) onDateFromChange?.(value);
    else setLocalDateFrom(value);
  };
  const setDateTo = (value: string) => {
    if (serverMode) onDateToChange?.(value);
    else setLocalDateTo(value);
  };
  const setRowsPerPage = (value: number) => {
    if (serverMode) onLimitChange?.(value);
    else setLocalRowsPerPage(value);
  };
  const setCurrentPage = (value: number) => {
    if (serverMode) onPageChange?.(value);
    else setLocalCurrentPage(value);
  };
  const setMobilePage = (value: number) => {
    if (serverMode) onPageChange?.(value);
    else setLocalMobilePage(value);
  };
  const [exportingPdf, setExportingPdf] = useState(false);

  const filteredRequests = useMemo(
    () =>
      serverMode
        ? requests
        : filterFundRequests(requests, {
            search,
            statusFilter,
            dateFrom,
            dateTo,
          }),
    [requests, search, statusFilter, dateFrom, dateTo, serverMode]
  );

  const totalRows = serverMode ? (totalRowsProp ?? requests.length) : filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const paginatedMobileRequests = useMemo(() => {
    if (serverMode) return filteredRequests;
    const start = (mobilePage - 1) * rowsPerPage;
    return filteredRequests.slice(start, start + rowsPerPage);
  }, [filteredRequests, mobilePage, rowsPerPage, serverMode]);

  useEffect(() => {
    if (serverMode) return;
    setMobilePage(1);
    setCurrentPage(1);
  }, [search, statusFilter, dateFrom, dateTo, rowsPerPage, serverMode]);

  useEffect(() => {
    if (serverMode) return;
    if (mobilePage > totalPages) {
      setMobilePage(totalPages);
    }
  }, [mobilePage, totalPages, serverMode]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    dateFrom !== "" ||
    dateTo !== "";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
  };

  const columns: TableColumn<FundRequest>[] = useMemo(
    () => [
      {
        id: "sno",
        name: "S.No",
        width: "64px",
        center: true,
        cell: (_row, index) => (
          <span className="font-medium text-slate-700">
            {(currentPage - 1) * rowsPerPage + (index ?? 0) + 1}
          </span>
        ),
      },
      {
        id: "amount",
        name: "Amount",
        selector: (row) => row.amount,
        sortable: true,
        minWidth: "110px",
        cell: (row) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(row.amount)}
          </span>
        ),
      },
      {
        id: "createdAt",
        name: <StackedHeader lines={["Request", "Date"]} />,
        selector: (row) => row.createdAt,
        sortable: true,
        minWidth: "118px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap text-center text-slate-600">
            {formatFundRequestDateOnly(row.createdAt)}
          </span>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "118px",
        center: true,
        cell: (row) => <FundRequestStatusBadge status={row.status} />,
      },
      {
        id: "paymentDate",
        name: <StackedHeader lines={["Deposit", "Date"]} />,
        selector: (row) => row.paymentDate,
        sortable: true,
        minWidth: "108px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap text-center text-slate-600">
            {row.paymentDate
              ? formatFundRequestDateOnly(row.paymentDate)
              : "—"}
          </span>
        ),
      },
      {
        id: "depositBank",
        name: <StackedHeader lines={["Deposit", "Bank"]} />,
        selector: (row) => row.companyBankName || row.bankName || "",
        sortable: true,
        minWidth: "120px",
        center: true,
        cell: (row) => (
          <span className="text-center text-slate-600">
            {row.companyBankName || row.bankName || "—"}
          </span>
        ),
      },
      {
        id: "requestId",
        name: <StackedHeader lines={["Request", "Id"]} />,
        selector: (row) => row.requestId || row.referenceNumber || "",
        sortable: true,
        minWidth: "200px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap font-semibold text-[#0057D9]">
            {row.requestId || row.referenceNumber || "—"}
          </span>
        ),
      },
      {
        id: "bankRefId",
        name: <StackedHeader lines={["Bank", "Ref.", "Id"]} />,
        selector: (row) => row.utrNumber,
        sortable: true,
        minWidth: "180px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap text-center text-slate-600">
            {row.utrNumber || "—"}
          </span>
        ),
      },
      {
        id: "approvedDate",
        name: <StackedHeader lines={["Approved", "Date"]} />,
        selector: (row) => row.approvedDate,
        sortable: true,
        minWidth: "108px",
        center: true,
        cell: (row) => (
          <span className="whitespace-nowrap text-center text-slate-600">
            {row.approvedDate
              ? formatFundRequestDateOnly(row.approvedDate)
              : "—"}
          </span>
        ),
      },
      {
        id: "adminRemark",
        name: <StackedHeader lines={["Admin", "Remark"]} />,
        selector: (row) => row.adminRemark || "",
        sortable: true,
        minWidth: "130px",
        center: true,
        cell: (row) => (
          <span
            className="block max-w-[160px] truncate text-center text-slate-600"
            title={row.adminRemark || undefined}
          >
            {row.adminRemark || "—"}
          </span>
        ),
      },
    ],
    [currentPage, rowsPerPage]
  );

  const showEmpty = !loading && totalRows === 0 && !hasActiveFilters;
  const showFilteredEmpty = !loading && !showEmpty && filteredRequests.length === 0;
  const exportDisabled = filteredRequests.length === 0;

  const handleExportPdf = async () => {
    if (exportDisabled) return;
    setExportingPdf(true);
    try {
      await exportFundRequestsPdf(filteredRequests);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-[#001F5B]">Fund Request History</CardTitle>
            <CardDescription>
              {totalRows} request{totalRows === 1 ? "" : "s"}
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
              onClick={() => exportFundRequestsCsv(filteredRequests)}
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
              onClick={() => exportFundRequestsExcel(filteredRequests)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={exportDisabled || exportingPdf}
              onClick={() => void handleExportPdf()}
            >
              <FileText className="h-4 w-4" />
              {exportingPdf ? "Exporting..." : "PDF"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={exportDisabled}
              onClick={() => printFundRequests(filteredRequests)}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>

        {!showEmpty && (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Label htmlFor="fund-search" className="text-xs font-medium text-slate-500">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="fund-search"
                    placeholder="Search reference, UTR, bank, status..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-10 pl-9"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0 sm:items-end">
                <div className="flex min-w-[148px] flex-col gap-1.5">
                  <Label htmlFor="fund-date-from" className="text-xs font-medium text-slate-500">
                    Start Date
                  </Label>
                  <Input
                    id="fund-date-from"
                    type="date"
                    value={dateFrom}
                    max={dateTo || undefined}
                    onChange={(event) => setDateFrom(event.target.value)}
                    className="h-10"
                    disabled={loading}
                  />
                </div>
                <div className="flex min-w-[148px] flex-col gap-1.5">
                  <Label htmlFor="fund-date-to" className="text-xs font-medium text-slate-500">
                    End Date
                  </Label>
                  <Input
                    id="fund-date-to"
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    onChange={(event) => setDateTo(event.target.value)}
                    className="h-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 shrink-0 gap-1.5 self-end"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {FUND_REQUEST_STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setStatusFilter(statusFilter === filter ? "All" : filter)
                  }
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                    statusFilter === filter
                      ? filter === "Approved"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                        : filter === "Declined"
                          ? "bg-red-600 text-white shadow-md shadow-red-200"
                          : filter === "Pending"
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "bg-[#1565d8] text-white shadow-md shadow-blue-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#1565d8]/30 hover:bg-blue-50 hover:text-[#1565d8]"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0 pt-4 sm:px-0">
        {showEmpty ? (
          <EmptyState onCreateClick={onCreateClick} />
        ) : (
          <>
            <div className="fund-request-datatable paytrue-cyan-datatable hidden min-w-0 px-4 sm:px-6 md:block">
              <DataTable
                key={`${search}-${statusFilter}-${dateFrom}-${dateTo}-${rowsPerPage}-${currentPage}`}
                columns={columns}
                data={filteredRequests}
                progressPending={loading}
                pagination
                paginationServer={serverMode}
                paginationTotalRows={serverMode ? totalRows : filteredRequests.length}
                paginationDefaultPage={currentPage}
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                onChangeRowsPerPage={setRowsPerPage}
                onChangePage={setCurrentPage}
                paginationResetDefaultPage={!serverMode}
                paginationComponentOptions={{
                  rowsPerPageText: "Rows per page:",
                  rangeSeparatorText: "of",
                }}
                sortIcon={<CyanDataTableSortIcon />}
                defaultSortFieldId="createdAt"
                defaultSortAsc={false}
                highlightOnHover
                striped
                responsive={false}
                persistTableHead
                customStyles={{
                  ...cyanDataTableStyles,
                  table: {
                    style: {
                      ...cyanDataTableStyles.table.style,
                      minWidth: FUND_REQUEST_TABLE_MIN_WIDTH,
                    },
                  },
                  rows: {
                    ...cyanDataTableStyles.rows,
                    style: {
                      ...cyanDataTableStyles.rows.style,
                      cursor: "pointer",
                    },
                  },
                }}
                onRowClicked={onRowClick}
                pointerOnHover
                noDataComponent={
                  <div className="py-16 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No matching requests found
                    </p>
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
                }
              />
            </div>

            <div className="md:hidden">
              <div className="space-y-3 px-4 pb-2">
                {showFilteredEmpty ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No matching requests found
                    </p>
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
                  paginatedMobileRequests.map((request) => (
                    <MobileRequestCard
                      key={request.id}
                      request={request}
                      onView={() => onRowClick(request)}
                      onCancel={() => onCancelRequest(request)}
                      onViewReceipt={() => viewFundRequestReceipt(request)}
                    />
                  ))
                )}
              </div>

              {!showFilteredEmpty && totalRows > 0 && (
                <MobilePagination
                  page={mobilePage}
                  totalPages={totalPages}
                  rowsPerPage={rowsPerPage}
                  totalRows={totalRows}
                  onPageChange={setMobilePage}
                  onRowsPerPageChange={setRowsPerPage}
                />
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
