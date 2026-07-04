"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DataTable from "react-data-table-component";
import { Download, Eye, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtStatusBadge from "@/src/components/dmt/DmtStatusBadge";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useDmtTransactions } from "@/src/hooks/useDmt";
import type { DmtTransaction } from "@/src/types/dmt";
import { formatCurrency } from "@/lib/utils";

export default function DmtTransactionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const filters = useMemo(
    () => ({
      page,
      limit,
      search,
      status: status as "all" | "success" | "pending" | "failed" | "processing",
      dateFrom,
      dateTo,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    }),
    [page, limit, search, status, dateFrom, dateTo, minAmount, maxAmount]
  );

  const { data, isLoading, isError, error, refetch, isFetching } =
    useDmtTransactions(filters);

  const rows = data?.items ?? [];

  const exportCsv = () => {
    if (!rows.length) return toast.error("No transactions to export");
    const csv = [
      ["Transaction ID", "Beneficiary", "Amount", "Mode", "Status", "Date"].join(","),
      ...rows.map((row) =>
        [
          row.transactionId,
          row.beneficiaryName,
          row.amount,
          row.transferMode,
          row.status,
          row.createdAt,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `dmt-transactions-${Date.now()}.csv`);
  };

  const exportExcel = () => {
    if (!rows.length) return toast.error("No transactions to export");
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        "Transaction ID": row.transactionId,
        Beneficiary: row.beneficiaryName,
        Amount: row.amount,
        Mode: row.transferMode,
        Status: row.status,
        Date: row.createdAt,
        RRN: row.rrn,
        UTR: row.utr,
      }))
    );
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "DMT Transactions");
    XLSX.writeFile(book, `dmt-transactions-${Date.now()}.xlsx`);
  };

  const columns = [
    {
      name: "Transaction ID",
      selector: (row: DmtTransaction) => row.transactionId,
      sortable: true,
      grow: 1.2,
    },
    {
      name: "Beneficiary",
      selector: (row: DmtTransaction) => row.beneficiaryName,
      sortable: true,
    },
    {
      name: "Amount",
      selector: (row: DmtTransaction) => row.amount,
      sortable: true,
      cell: (row: DmtTransaction) => formatCurrency(row.amount),
    },
    {
      name: "Mode",
      selector: (row: DmtTransaction) => row.transferMode,
    },
    {
      name: "Status",
      cell: (row: DmtTransaction) => <DmtStatusBadge status={row.status} />,
    },
    {
      name: "Date",
      selector: (row: DmtTransaction) => row.createdAt,
      cell: (row: DmtTransaction) =>
        new Date(row.createdAt).toLocaleString("en-IN"),
    },
    {
      name: "Action",
      cell: (row: DmtTransaction) => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/rt/retailer/dmt/transactions/${row.id}`}>
            <Eye className="h-3.5 w-3.5" />
            View
          </Link>
        </Button>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="space-y-6">
      <DmtPageHeader
        title="Transaction History"
        description="Search, filter and export DMT transactions"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel}>
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search transaction..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <Input
            type="number"
            placeholder="Min amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </CardContent>
      </Card>

      {isError && (
        <DmtErrorState
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      )}

      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={rows}
            progressPending={isLoading}
            pagination
            paginationServer
            paginationTotalRows={data?.pagination.total ?? 0}
            paginationPerPage={limit}
            onChangePage={setPage}
            onChangeRowsPerPage={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            highlightOnHover
            responsive
          />
        </CardContent>
      </Card>
    </div>
  );
}
