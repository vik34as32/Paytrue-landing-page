"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  WalletCards,
} from "lucide-react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "sonner";
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
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import { formatCurrency, cn } from "@/lib/utils";
import {
  useCommissionLedger,
  useCommissionWallet,
} from "@/src/hooks/useCommission";
import CommissionTopupModal from "@/src/components/commission/CommissionTopupModal";
import type { CommissionLedgerEntry, CommissionPortalRole } from "@/src/types/commission";
import { useAppDispatch } from "@/src/redux/types";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";
import { selectUser } from "@/src/redux/slices/authSlice";
import { fetchAllCommissionLedger } from "@/src/services/commissionService";
import {
  exportCommissionLedgerToExcel,
  exportCommissionLedgerToPdf,
  printCommissionLedger,
} from "@/src/lib/commissionExport";

const ROLE_META: Record<
  CommissionPortalRole,
  { title: string; backHref: string; walletRole: "rt" | "dd" | "md"; roleLabel: string }
> = {
  rt: {
    title: "Commission Report",
    backHref: "/rt/retailer",
    walletRole: "rt",
    roleLabel: "Retailer",
  },
  dd: {
    title: "Commission Report",
    backHref: "/dd/dashboard",
    walletRole: "dd",
    roleLabel: "Distributor",
  },
  md: {
    title: "Commission Report",
    backHref: "/md/dashboard",
    walletRole: "md",
    roleLabel: "Master Distributor",
  },
};

function CommissionLedgerContent({ role }: { role: CommissionPortalRole }) {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  const meta = ROLE_META[role];
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [topupOpen, setTopupOpen] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | "print" | null>(null);

  const filters = useMemo(
    () => ({ page, limit, search: search || undefined }),
    [page, limit, search]
  );

  const walletQuery = useCommissionWallet();
  const ledgerQuery = useCommissionLedger(filters);

  const balance =
    walletQuery.data?.availableBalance ?? walletQuery.data?.balance ?? 0;
  const items = ledgerQuery.data?.items ?? [];
  const pagination = ledgerQuery.data?.pagination;

  const columns: TableColumn<CommissionLedgerEntry>[] = [
    {
      name: "Date",
      selector: (row) => row.date,
      sortable: true,
      minWidth: "110px",
      cell: (row) => (
        <span className="whitespace-nowrap text-xs font-medium text-slate-700">
          {row.date || "—"}
        </span>
      ),
    },
    {
      name: "Time",
      selector: (row) => row.time,
      sortable: true,
      minWidth: "110px",
      cell: (row) => (
        <span className="whitespace-nowrap text-xs text-slate-600">{row.time || "—"}</span>
      ),
    },
    {
      name: "Transaction ID",
      selector: (row) => row.transactionId,
      sortable: true,
      minWidth: "220px",
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-600 break-all">
          {row.transactionId || "—"}
        </span>
      ),
    },
    {
      name: "Reference",
      selector: (row) => row.reference,
      sortable: true,
      minWidth: "240px",
      grow: 2,
      cell: (row) => (
        <span className="font-mono text-[11px] text-slate-500 break-all">
          {row.reference || "—"}
        </span>
      ),
    },
    {
      name: "Opening Balance",
      selector: (row) => row.openingBalance,
      sortable: true,
      right: true,
      minWidth: "130px",
      cell: (row) => (
        <span className="font-semibold text-slate-700">
          {formatCurrency(row.openingBalance)}
        </span>
      ),
    },
        {
      name: "Credit / Debit",
      selector: (row) => row.creditDebit,
      sortable: true,
      center: true,
      minWidth: "120px",
      cell: (row) => (
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            row.creditDebit === "CREDIT"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          )}
        >
          {row.creditDebit || "—"}
        </span>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      right: true,
      minWidth: "110px",
      cell: (row) => (
        <span
          className={cn(
            "font-bold",
            row.creditDebit === "CREDIT" ? "text-emerald-600" : "text-red-600"
          )}
        >
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      name: "Closing Balance",
      selector: (row) => row.closingBalance,
      sortable: true,
      right: true,
      minWidth: "130px",
      cell: (row) => (
        <span className="font-semibold text-[#0b1f3a]">
          {formatCurrency(row.closingBalance)}
        </span>
      ),
    },
    {
      name: "Wallet Type",
      selector: (row) => row.walletType,
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.walletType || "—"}
        </span>
      ),
    },
    {
      name: "Service ID",
      selector: (row) => row.serviceId,
      sortable: true,
      minWidth: "110px",
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.serviceId || "—"}</span>
      ),
    },
  ];

  const exportMeta = {
    generatedBy: user?.name || user?.userId || "Paytrue User",
    roleLabel: user?.roleLabel || meta.roleLabel,
  };

  const loadExportRows = async () => {
    const rows = await fetchAllCommissionLedger({
      search: search || undefined,
    });
    if (!rows.length) {
      throw new Error("No commission ledger data available to export.");
    }
    return rows;
  };

  const handleExcel = async () => {
    setExporting("excel");
    try {
      const rows = await loadExportRows();
      await exportCommissionLedgerToExcel(rows, exportMeta);
      toast.success("Excel downloaded successfully.");
    } catch (err) {
      toast.error((err as Error)?.message || "Failed to export Excel.");
    } finally {
      setExporting(null);
    }
  };

  const handlePdf = async () => {
    setExporting("pdf");
    try {
      const rows = await loadExportRows();
      await exportCommissionLedgerToPdf(rows, exportMeta);
      toast.success("PDF downloaded successfully.");
    } catch (err) {
      toast.error((err as Error)?.message || "Failed to export PDF.");
    } finally {
      setExporting(null);
    }
  };

  const handlePrint = async () => {
    setExporting("print");
    try {
      const rows = await loadExportRows();
      printCommissionLedger(rows, exportMeta);
    } catch (err) {
      toast.error((err as Error)?.message || "Failed to print ledger.");
    } finally {
      setExporting(null);
    }
  };

  const refreshAll = async () => {
    await Promise.all([walletQuery.refetch(), ledgerQuery.refetch()]);
    dispatch(fetchWalletBalance({ role: meta.walletRole }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href={meta.backHref}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#0b1f3a] sm:text-2xl">{meta.title}</h1>
            <p className="text-sm text-slate-500">
              Full commission wallet ledger with export & top-up
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => void refreshAll()}
            disabled={walletQuery.isFetching || ledgerQuery.isFetching}
          >
            {walletQuery.isFetching || ledgerQuery.isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button onClick={() => setTopupOpen(true)} disabled={balance <= 0}>
            <WalletCards className="mr-2 h-4 w-4" />
            Top-up Main Wallet
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Commission Ledger</CardTitle>
            <CardDescription>
              Date, time, balances, reference & service details from commission wallet
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => void handleExcel()}
            >
              {exporting === "excel" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
              )}
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => void handlePdf()}
            >
              {exporting === "pdf" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4 text-red-500" />
              )}
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => void handlePrint()}
            >
              {exporting === "print" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(exporting)}
              onClick={() => void handleExcel()}
              className="sm:hidden"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="commission-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="commission-search"
                  className="pl-9"
                  placeholder="Search reference / transaction ID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit">Search</Button>
          </form>

          {ledgerQuery.isError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
              {(ledgerQuery.error as { message?: string })?.message ||
                "Unable to load commission ledger."}
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => void ledgerQuery.refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              progressPending={ledgerQuery.isLoading || ledgerQuery.isFetching}
              progressComponent={
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading ledger...
                </div>
              }
              noDataComponent={
                <div className="py-10 text-center text-sm text-slate-400">
                  No commission ledger entries found.
                </div>
              }
              pagination
              paginationServer
              paginationTotalRows={pagination?.total ?? 0}
              paginationDefaultPage={page}
              paginationPerPage={limit}
              paginationRowsPerPageOptions={[10, 20, 50, 100]}
              onChangePage={(next) => setPage(next)}
              onChangeRowsPerPage={(next, nextPage) => {
                setLimit(next);
                setPage(nextPage);
              }}
              customStyles={cyanDataTableStyles}
              sortIcon={<CyanDataTableSortIcon />}
              highlightOnHover
              dense
              responsive
            />
          )}
        </CardContent>
      </Card>

      <CommissionTopupModal
        open={topupOpen}
        onOpenChange={setTopupOpen}
        availableBalance={balance}
        onSuccess={() => {
          void refreshAll();
        }}
      />
    </div>
  );
}

export default function CommissionLedgerPage({ role }: { role: CommissionPortalRole }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: true },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CommissionLedgerContent role={role} />
    </QueryClientProvider>
  );
}
