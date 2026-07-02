"use client";

import { useMemo, useState } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  Download,
  Eye,
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, cn } from "@/lib/utils";
import {
  exportFundRequestsCsv,
  formatFundRequestDate,
  downloadFundRequestReceipt,
} from "@/src/lib/fundRequestUtils";
import {
  FUND_REQUEST_STATUS_FILTERS,
  type FundRequest,
  type FundRequestStatusFilter,
} from "@/src/types/fundRequest";
import FundRequestStatusBadge from "./FundRequestStatusBadge";
import EmptyState from "./EmptyState";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const tableCustomStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      minHeight: "48px",
    },
  },
  headCells: {
    style: {
      fontSize: "12px",
      fontWeight: 700,
      color: "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "14px",
      color: "#334155",
      borderBottom: "1px solid #f1f5f9",
      "&:hover": {
        backgroundColor: "#f8fbff",
        cursor: "pointer",
      },
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f8fbff",
      borderBottomColor: "#e2e8f0",
    },
  },
  cells: {
    style: {
      paddingTop: "12px",
      paddingBottom: "12px",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      minHeight: "56px",
      fontSize: "13px",
      color: "#64748b",
    },
  },
};

interface FundRequestTableProps {
  requests: FundRequest[];
  onRowClick: (request: FundRequest) => void;
  onCancelRequest: (request: FundRequest) => void;
  onCreateClick?: () => void;
}

function MobileRequestCard({
  request,
  onView,
  onCancel,
  onDownloadReceipt,
}: {
  request: FundRequest;
  onView: () => void;
  onCancel: () => void;
  onDownloadReceipt: () => void;
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
            {request.requestId}
          </p>
          <p className="mt-1 text-lg font-bold text-[#001F5B]">
            {formatCurrency(request.amount)}
          </p>
        </div>
        <FundRequestStatusBadge status={request.status} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <p className="text-slate-400">Mode</p>
          <p className="font-medium">{request.paymentMode}</p>
        </div>
        <div>
          <p className="text-slate-400">Date</p>
          <p className="font-medium">{formatFundRequestDate(request.createdAt)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-slate-400">Remark</p>
          <p className="line-clamp-2 font-medium">{request.remark || "—"}</p>
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
        {request.status === "approved" && (
          <Button type="button" size="sm" variant="outline" onClick={onDownloadReceipt}>
            <Download className="h-3.5 w-3.5" />
            Receipt
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function FundRequestTable({
  requests,
  onRowClick,
  onCancelRequest,
  onCreateClick,
}: FundRequestTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<FundRequestStatusFilter>("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter.toLowerCase();

      if (!matchesStatus) return false;
      if (!query) return true;

      return (
        request.requestId.toLowerCase().includes(query) ||
        request.paymentMode.toLowerCase().includes(query) ||
        request.utrNumber.toLowerCase().includes(query) ||
        request.remark.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query) ||
        request.approvedBy.toLowerCase().includes(query)
      );
    });
  }, [requests, search, statusFilter]);

  const columns: TableColumn<FundRequest>[] = useMemo(
    () => [
      {
        id: "requestId",
        name: "Request ID",
        selector: (row) => row.requestId,
        sortable: true,
        minWidth: "130px",
        cell: (row) => (
          <span className="font-semibold text-[#0057D9]">{row.requestId}</span>
        ),
      },
      {
        id: "amount",
        name: "Requested Amount",
        selector: (row) => row.amount,
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(row.amount)}
          </span>
        ),
      },
      {
        id: "paymentMode",
        name: "Payment Mode",
        selector: (row) => row.paymentMode,
        sortable: true,
        minWidth: "130px",
      },
      {
        id: "utrNumber",
        name: "UTR",
        selector: (row) => row.utrNumber,
        sortable: true,
        minWidth: "140px",
        cell: (row) => (
          <span className="text-slate-600">{row.utrNumber || "—"}</span>
        ),
      },
      {
        id: "remark",
        name: "Remark",
        selector: (row) => row.remark,
        sortable: true,
        minWidth: "180px",
        wrap: true,
        cell: (row) => (
          <span className="line-clamp-2 text-slate-600">{row.remark || "—"}</span>
        ),
      },
      {
        id: "createdAt",
        name: "Requested Date",
        selector: (row) => row.createdAt,
        sortable: true,
        minWidth: "170px",
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-600">
            {formatFundRequestDate(row.createdAt)}
          </span>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "120px",
        cell: (row) => <FundRequestStatusBadge status={row.status} />,
      },
      {
        id: "approvedBy",
        name: "Approved By",
        selector: (row) => row.approvedBy,
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <span className="text-slate-600">{row.approvedBy || "—"}</span>
        ),
      },
      {
        id: "approvedDate",
        name: "Approved Date",
        selector: (row) => row.approvedDate,
        sortable: true,
        minWidth: "170px",
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-600">
            {row.approvedDate ? formatFundRequestDate(row.approvedDate) : "—"}
          </span>
        ),
      },
      {
        name: "Actions",
        minWidth: "100px",
        center: true,
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={(event) => event.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => onRowClick(row)}
              >
                <Eye className="h-4 w-4" />
                View Details
              </DropdownMenuItem>
              {row.status === "pending" && (
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => onCancelRequest(row)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Request
                </DropdownMenuItem>
              )}
              {row.status === "approved" && (
                <DropdownMenuItem
                  onClick={() => void downloadFundRequestReceipt(row)}
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [onCancelRequest, onRowClick]
  );

  const showEmpty = requests.length === 0;
  const showFilteredEmpty = !showEmpty && filteredRequests.length === 0;

  return (
    <Card className="rounded-2xl border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-4 border-b border-slate-100 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-[#001F5B]">Fund Request History</CardTitle>
            <CardDescription>
              {filteredRequests.length} of {requests.length} requests
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 self-start"
            disabled={filteredRequests.length === 0}
            onClick={() => exportFundRequestsCsv(filteredRequests)}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {!showEmpty && (
          <>
            <div className="relative w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search ID, UTR, remark, status..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {FUND_REQUEST_STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                    statusFilter === filter
                      ? "bg-[#1565d8] text-white shadow-md shadow-blue-200"
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
            <div className="hidden overflow-x-auto px-4 sm:px-6 md:block">
              <DataTable
                columns={columns}
                data={filteredRequests}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                onChangeRowsPerPage={setRowsPerPage}
                paginationComponentOptions={{
                  rowsPerPageText: "Rows per page:",
                  rangeSeparatorText: "of",
                }}
                sortIcon={<span className="ml-1 text-slate-400">↕</span>}
                defaultSortFieldId="createdAt"
                defaultSortAsc={false}
                highlightOnHover
                striped
                responsive
                fixedHeader
                fixedHeaderScrollHeight="520px"
                persistTableHead
                customStyles={tableCustomStyles}
                onRowClicked={onRowClick}
                pointerOnHover
                noDataComponent={
                  <div className="py-16 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No matching requests found
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Try adjusting your search or filter
                    </p>
                  </div>
                }
              />
            </div>

            <div className="space-y-3 px-4 pb-6 md:hidden">
              {showFilteredEmpty ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No matching requests found
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <MobileRequestCard
                    key={request.id}
                    request={request}
                    onView={() => onRowClick(request)}
                    onCancel={() => onCancelRequest(request)}
                    onDownloadReceipt={() => void downloadFundRequestReceipt(request)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
