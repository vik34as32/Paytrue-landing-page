"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import DataTable, { type TableColumn } from "react-data-table-component";
import { useReactToPrint } from "react-to-print";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  ArrowLeft,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Loader2,
  MoreHorizontal,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSelector } from "react-redux";
import { getUserDisplayName } from "@/src/lib/userUtils";
import { selectUser } from "@/src/redux/slices/authSlice";
import {
  exportStatementToExcel,
  formatStatementTransactionId,
  type StatementSortState,
} from "@/src/lib/statementExcelExport";
import {
  downloadStatementReceiptPdf,
  formatTransactionId as formatReceiptTransactionId,
} from "@/src/lib/statementReceiptUtils";
import { enrichStatementWithIfsc } from "@/src/services/ifscService";
import TransactionReceipt from "@/src/components/statement/TransactionReceipt";
import ReceiptActions from "@/src/components/statement/ReceiptActions";
import ReceiptPageLayout from "@/src/components/statement/receipt/ReceiptPageLayout";
import { RETAILER_USER } from "@/features/retailer/constants";
import type {
  ReceiptCustomerInfo,
  StatementTransaction,
  TransactionStatus,
  TransactionType,
} from "@/types/statementReceipt";
import { useRetailerStatement } from "@/src/hooks/useRetailerStatement";
import ReferenceCopyCell from "@/src/components/statement/ReferenceCopyCell";
import { BankLogo } from "@/components/retailer/BankLogo";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ServiceFilter = "All" | "Money Transfer" | "UPI ATM" | "AEPS";

type AepsSubFilter =
  | "All"
  | "BALANCE_ENQUIRY"
  | "CASH_WITHDRAWAL"
  | "MINI_STATEMENT"
  | "CASH_DEPOSIT";

const AEPS_SUB_FILTERS: { label: string; value: AepsSubFilter }[] = [
  { label: "All AEPS", value: "All" },
  { label: "Balance Enquiry", value: "BALANCE_ENQUIRY" },
  { label: "Cash Withdrawal", value: "CASH_WITHDRAWAL" },
  { label: "Mini Statement", value: "MINI_STATEMENT" },
  { label: "Cash Deposit", value: "CASH_DEPOSIT" },
];

interface ExportRow {
  "Transaction ID": string;
  "Reference Number": string;
  Date: string;
  Service: string;
  Description: string;
  Type: string;
  Status: string;
  "Previous Balance": string;
  "Credit Amount": string;
  "Debit Amount": string;
  "Updated Balance": string;
  Amount: number;
  "Bank Name": string;
  "Account Number": string;
  Mobile: string;
  Remark: string;
}

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

const SERVICE_FILTERS: ServiceFilter[] = [
  "All",
  "Money Transfer",
  "UPI ATM",
  "AEPS",
];

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30];
const RETAILER_NAME = "Amit Kumar";

const STATEMENT_TABLE_MIN_WIDTH = "1960px";
const STATEMENT_TABLE_SCROLL_HEIGHT = "520px";

const tableCustomStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
      minWidth: STATEMENT_TABLE_MIN_WIDTH,
    },
  },
  tableWrapper: {
    style: {
      display: "block",
      overflow: "visible",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f1f5f9",
      borderBottomWidth: "1px",
      borderBottomColor: "#e2e8f0",
      minHeight: "48px",
    },
  },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      color: "#64748b",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      fontSize: "13px",
      color: "#0b1f3a",
      "&:hover": { backgroundColor: "#eff6ff", cursor: "default" },
    },
    stripedStyle: { backgroundColor: "#fafbfc" },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#0b1f3a",
      overflow: "visible",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#64748b",
      minHeight: "52px",
    },
  },
};

function formatTransactionId(id: string): string {
  return formatReceiptTransactionId(id);
}

function buildReceiptCustomerInfo(
  user: ReturnType<typeof selectUser>
): ReceiptCustomerInfo {
  const customerName = getUserDisplayName(user, RETAILER_NAME);

  return {
    customerName,
    mobile:
      user?.mobile ||
      user?.phoneNumber ||
      user?.phone ||
      RETAILER_USER.mobile,
    retailerId:
      user?.userId ||
      user?.retailerId ||
      user?.retailerCode ||
      RETAILER_USER.retailerId,
    outletName: `${customerName} Digital Services`,
    location:
      user?.city ||
      user?.address?.city ||
      user?.state ||
      user?.address?.state ||
      "India",
  };
}

const RECEIPT_PRINT_PAGE_STYLE = `
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt-no-print, .print\\:hidden { display: none !important; }
  }
`;

function matchesServiceFilter(
  service: string,
  filter: ServiceFilter
): boolean {
  if (filter === "All") return true;
  return service === filter;
}

function formatStatementDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function matchesAepsSubFilter(
  txn: StatementTransaction,
  filter: AepsSubFilter
): boolean {
  if (filter === "All") return true;
  return txn.aepsTransactionType === filter;
}

function StackedHeader({ lines }: { lines: string[] }) {
  return (
    <span className="inline-flex flex-col items-center justify-center text-[11px] font-bold uppercase tracking-wide leading-[1.2]">
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </span>
  );
}

function hasStatementBalance(txn: StatementTransaction): boolean {
  return txn.openingBalance > 0 || txn.balanceAfter > 0;
}

function StatementBalanceCell({
  value,
  tone,
}: {
  value: number;
  tone: "credit" | "debit" | "neutral" | "balance";
}) {
  if (!value && tone !== "balance" && tone !== "neutral") {
    return <span className="text-slate-300">—</span>;
  }

  return (
    <span
      className={cn(
        "font-bold tabular-nums tracking-tight",
        tone === "credit" && "text-emerald-700",
        tone === "debit" && "text-red-600",
        tone === "balance" && "text-[#001F5B]",
        tone === "neutral" && "text-slate-600"
      )}
    >
      {tone === "credit" ? "+" : tone === "debit" ? "−" : ""}
      {formatCurrency(value)}
    </span>
  );
}

function formatBalanceExport(value: number, txn: StatementTransaction): string {
  if (!hasStatementBalance(txn) && value === 0) return "—";
  return formatCurrency(value);
}

function mapToExportRow(txn: StatementTransaction): ExportRow {
  const creditAmount = txn.type === "credit" ? txn.amount : 0;
  const debitAmount = txn.type === "debit" ? txn.amount : 0;

  return {
    "Transaction ID": formatTransactionId(txn.id),
    "Reference Number": txn.referenceNumber,
    Date: formatStatementDate(txn.createdAt),
    Service: txn.service,
    Description: txn.description,
    Type: txn.type,
    Status: txn.status,
    "Previous Balance": formatBalanceExport(txn.openingBalance, txn),
    "Credit Amount": creditAmount ? formatCurrency(creditAmount) : "—",
    "Debit Amount": debitAmount ? formatCurrency(debitAmount) : "—",
    "Updated Balance": formatBalanceExport(txn.balanceAfter, txn),
    Amount: txn.amount,
    "Bank Name": txn.bankName ?? txn.receiverName ?? "",
    "Account Number": txn.accountNumber ?? "",
    Mobile: txn.mobile,
    Remark: txn.remark,
  };
}

function getAutoTableFinalY(doc: jsPDF): number {
  const extended = doc as JsPdfWithAutoTable;
  return extended.lastAutoTable?.finalY ?? 40;
}

function addPayTruePdfHeader(doc: jsPDF, subtitle: string) {
  doc.setFillColor(21, 101, 216);
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("PAYTRUE", 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(subtitle, 14, 26);
  doc.setTextColor(15, 31, 58);
}

function exportStatementPdf(rows: StatementTransaction[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  addPayTruePdfHeader(doc, "Account Statement");

  const exportRows = rows.map((txn) => [
    formatTransactionId(txn.id),
    txn.referenceNumber,
    formatStatementDate(txn.createdAt),
    txn.service,
    txn.description,
    txn.type,
    txn.status,
    formatBalanceExport(txn.openingBalance, txn),
    txn.type === "credit" ? formatCurrency(txn.amount) : "—",
    txn.type === "debit" ? formatCurrency(txn.amount) : "—",
    formatBalanceExport(txn.balanceAfter, txn),
    txn.bankName ?? txn.receiverName ?? "",
    txn.accountNumber ?? "",
    txn.mobile,
  ]);

  autoTable(doc, {
    startY: 44,
    headStyles: { fillColor: [21, 101, 216], textColor: 255, fontSize: 8 },
    styles: { fontSize: 7, cellPadding: 2 },
    head: [
      [
        "Txn ID",
        "Reference",
        "Date",
        "Service",
        "Description",
        "Type",
        "Status",
        "Previous Bal.",
        "Credit",
        "Debit",
        "Updated Bal.",
        "Bank",
        "Account",
        "Mobile",
      ],
    ],
    body: exportRows,
  });

  const finalY = getAutoTableFinalY(doc) + 8;
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-IN")} · ${rows.length} records`,
    14,
    finalY
  );

  doc.save("Statement.pdf");
}

function exportStatementCsv(rows: StatementTransaction[]) {
  const data = rows.map(mapToExportRow);
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  saveAs(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    "Statement.csv"
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const badge =
    status === "success" ? (
      <Badge variant="success">Success</Badge>
    ) : status === "pending" ? (
      <Badge variant="warning">Pending</Badge>
    ) : (
      <Badge variant="destructive">Failed</Badge>
    );

  return <span className="inline-flex shrink-0 whitespace-nowrap">{badge}</span>;
}

interface ReceiptContentProps {
  txn: StatementTransaction;
  customer: ReceiptCustomerInfo;
}

const ReceiptContent = forwardRef<HTMLDivElement, ReceiptContentProps>(
  function ReceiptContent({ txn, customer }, ref) {
    return <TransactionReceipt ref={ref} txn={txn} customer={customer} />;
  }
);

export default function StatementPage() {
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("All");
  const [aepsSubFilter, setAepsSubFilter] = useState<AepsSubFilter>("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortState, setSortState] = useState<StatementSortState>({
    field: "createdAt",
    direction: "desc",
  });
  const [exportingExcel, setExportingExcel] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<StatementTransaction | null>(
    null
  );
  const [printTxn, setPrintTxn] = useState<StatementTransaction | null>(null);

  const user = useSelector(selectUser);
  const {
    data: statementData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useRetailerStatement();

  const allTransactions = useMemo(
    () => statementData?.transactions ?? [],
    [statementData]
  );
  const fetchErrors = statementData?.errors ?? [];

  useEffect(() => {
    if (serviceFilter !== "AEPS") {
      setAepsSubFilter("All");
    }
  }, [serviceFilter]);

  const receiptCustomer = useMemo(
    () => buildReceiptCustomerInfo(user),
    [user]
  );

  const modalPrintRef = useRef<HTMLDivElement>(null);
  const hiddenPrintRef = useRef<HTMLDivElement>(null);

  const handleModalPrint = useReactToPrint({
    contentRef: modalPrintRef,
    documentTitle: selectedTxn
      ? `PAYTRUE_RECEIPT_${formatTransactionId(selectedTxn.id)}`
      : "PAYTRUE_RECEIPT",
    pageStyle: RECEIPT_PRINT_PAGE_STYLE,
  });

  const handleHiddenPrint = useReactToPrint({
    contentRef: hiddenPrintRef,
    documentTitle: printTxn
      ? `PAYTRUE_RECEIPT_${formatTransactionId(printTxn.id)}`
      : "PAYTRUE_RECEIPT",
    pageStyle: RECEIPT_PRINT_PAGE_STYLE,
  });

  const handleDownloadReceipt = useCallback(
    async (txn: StatementTransaction) => {
      setDownloadingReceipt(true);
      try {
        await downloadStatementReceiptPdf(txn, receiptCustomer);
      } finally {
        setDownloadingReceipt(false);
      }
    },
    [receiptCustomer]
  );

  const openReceipt = useCallback((txn: StatementTransaction) => {
    setSelectedTxn(txn);
    setReceiptOpen(true);
    void enrichStatementWithIfsc(txn).then((enriched) => {
      setSelectedTxn((current) =>
        current?.id === enriched.id ? enriched : current
      );
    });
  }, []);

  const printReceipt = useCallback(
    async (txn: StatementTransaction) => {
      const enriched = await enrichStatementWithIfsc(txn);
      setPrintTxn(enriched);
      window.setTimeout(() => {
        handleHiddenPrint();
      }, 600);
    },
    [handleHiddenPrint]
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allTransactions.filter((txn) => {
      if (!matchesServiceFilter(txn.service, serviceFilter)) return false;
      if (serviceFilter === "AEPS" && !matchesAepsSubFilter(txn, aepsSubFilter)) {
        return false;
      }
      if (!query) return true;

      return (
        txn.id.toLowerCase().includes(query) ||
        formatTransactionId(txn.id).toLowerCase().includes(query) ||
        txn.referenceNumber.toLowerCase().includes(query) ||
        txn.description.toLowerCase().includes(query) ||
        txn.service.toLowerCase().includes(query) ||
        (txn.bankName ?? "").toLowerCase().includes(query) ||
        (txn.accountNumber ?? "").toLowerCase().includes(query) ||
        txn.mobile.toLowerCase().includes(query)
      );
    });
  }, [search, serviceFilter, aepsSubFilter, allTransactions]);

  const handleExportExcel = useCallback(async () => {
    setExportingExcel(true);
    try {
      await exportStatementToExcel(filteredTransactions, {
        generatedBy: getUserDisplayName(user, RETAILER_NAME),
        sortState,
      });
    } finally {
      setExportingExcel(false);
    }
  }, [filteredTransactions, sortState, user]);

  const columns: TableColumn<StatementTransaction>[] = useMemo(
    () => [
      {
        id: "createdAt",
        name: "Date",
        selector: (row) => row.createdAt,
        sortable: true,
        minWidth: "160px",
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-600">
            {formatStatementDate(row.createdAt)}
          </span>
        ),
      },
      {
        id: "referenceNumber",
        name: "Reference No.",
        selector: (row) => row.referenceNumber,
        sortable: true,
        minWidth: "220px",
        grow: 1,
        cell: (row) => <ReferenceCopyCell value={row.referenceNumber} />,
      },
      {
        id: "service",
        name: "Service",
        selector: (row) => row.service,
        sortable: true,
        minWidth: "150px",
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-700">{row.service}</span>
        ),
      },
      {
        id: "description",
        name: "Description",
        selector: (row) => row.description,
        sortable: true,
        grow: 2,
        minWidth: "180px",
        wrap: true,
      },
      {
        id: "bankName",
        name: "Bank",
        selector: (row) => row.bankName ?? row.receiverName,
        sortable: true,
        minWidth: "140px",
        wrap: true,
        cell: (row) => (
          <div className="flex min-w-0 items-center gap-2">
            {(row.bankName || row.ifscCode) && (
              <BankLogo
                bank={{
                  name: row.bankName || row.receiverName,
                  shortName: row.bankName || row.receiverName,
                  ifscPrefix: row.ifscCode?.slice(0, 4) || "",
                }}
                size={24}
              />
            )}
            <span className="truncate text-slate-700">
              {row.bankName || row.receiverName || "—"}
            </span>
          </div>
        ),
      },
      {
        id: "accountNumber",
        name: "Account",
        selector: (row) => row.accountNumber ?? "",
        sortable: true,
        minWidth: "130px",
        cell: (row) => (
          <span className="font-mono text-xs text-slate-700">
            {row.accountNumber || "—"}
          </span>
        ),
      },
      {
        id: "mobile",
        name: "Mobile",
        selector: (row) => row.mobile,
        sortable: true,
        minWidth: "120px",
        cell: (row) => (
          <span className="tabular-nums text-slate-700">{row.mobile || "—"}</span>
        ),
      },
      {
        id: "type",
        name: "Type",
        selector: (row) => row.type,
        sortable: true,
        minWidth: "90px",
        cell: (row) => (
          <Badge
            variant={row.type === "debit" ? "destructive" : "success"}
            className="shrink-0 whitespace-nowrap capitalize"
          >
            {row.type}
          </Badge>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        minWidth: "108px",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "openingBalance",
        name: <StackedHeader lines={["Previous", "Balance"]} />,
        selector: (row) => row.openingBalance,
        sortable: true,
        right: true,
        minWidth: "118px",
        cell: (row) =>
          hasStatementBalance(row) ? (
            <StatementBalanceCell value={row.openingBalance} tone="neutral" />
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        id: "creditAmount",
        name: <StackedHeader lines={["Credit", "Amount"]} />,
        selector: (row) => (row.type === "credit" ? row.amount : 0),
        sortable: true,
        right: true,
        minWidth: "108px",
        cell: (row) => (
          <StatementBalanceCell
            value={row.type === "credit" ? row.amount : 0}
            tone="credit"
          />
        ),
      },
      {
        id: "debitAmount",
        name: <StackedHeader lines={["Debit", "Amount"]} />,
        selector: (row) => (row.type === "debit" ? row.amount : 0),
        sortable: true,
        right: true,
        minWidth: "108px",
        cell: (row) => (
          <StatementBalanceCell
            value={row.type === "debit" ? row.amount : 0}
            tone="debit"
          />
        ),
      },
      {
        id: "balanceAfter",
        name: <StackedHeader lines={["Updated", "Balance"]} />,
        selector: (row) => row.balanceAfter,
        sortable: true,
        right: true,
        minWidth: "118px",
        cell: (row) =>
          hasStatementBalance(row) ? (
            <StatementBalanceCell value={row.balanceAfter} tone="balance" />
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        name: "Action",
        minWidth: "100px",
        center: true,
        cell: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => openReceipt(row)}>
                <Eye className="h-4 w-4" />
                View Receipt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleDownloadReceipt(row)}>
                <Download className="h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void printReceipt(row)}>
                <Printer className="h-4 w-4" />
                Print Receipt
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [handleDownloadReceipt, openReceipt, printReceipt]
  );

  return (
    <>
      {receiptOpen && selectedTxn ? (
        <ReceiptPageLayout
          actions={
            <ReceiptActions
              onBack={() => setReceiptOpen(false)}
              onDownload={() => void handleDownloadReceipt(selectedTxn)}
              onPrint={() => handleModalPrint()}
              downloading={downloadingReceipt}
            />
          }
        >
          <ReceiptContent
            ref={modalPrintRef}
            txn={selectedTxn}
            customer={receiptCustomer}
          />
        </ReceiptPageLayout>
      ) : (
        <div className="w-full max-w-none space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/rt/retailer">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#001F5B]">Statement</h1>
                <p className="text-sm text-slate-500">
                  Complete transaction history
                </p>
              </div>
            </div>
          </div>

          <Card className="w-full border-slate-200/80 shadow-sm">
            <CardHeader className="space-y-4 border-b border-slate-100 pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Transaction Statement</CardTitle>
                  <CardDescription>
                    {filteredTransactions.length} of {allTransactions.length}{" "}
                    transactions
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={isFetching}
                    onClick={() => void refetch()}
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", isFetching && "animate-spin")}
                    />
                    Refresh
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={exportingExcel || filteredTransactions.length === 0}
                    onClick={() => void handleExportExcel()}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {exportingExcel ? "Exporting..." : "Export Excel"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => exportStatementCsv(filteredTransactions)}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => exportStatementPdf(filteredTransactions)}
                  >
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>

              {fetchErrors.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Some services could not be loaded: {fetchErrors.join(" · ")}
                </div>
              ) : null}

              {isError && allTransactions.length === 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  Failed to load statement. Please try again.
                </div>
              ) : null}

              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search ID, reference, description, service..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {SERVICE_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setServiceFilter(filter)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                      serviceFilter === filter
                        ? "bg-[#1565d8] text-white shadow-md shadow-blue-200"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-[#1565d8]/30 hover:bg-blue-50 hover:text-[#1565d8]"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {serviceFilter === "AEPS" ? (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {AEPS_SUB_FILTERS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAepsSubFilter(value)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition-all",
                        aepsSubFilter === value
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "border border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}
            </CardHeader>

            <CardContent className="px-0 pb-0 pt-4 sm:px-0">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading transactions...
                </div>
              ) : (
                <div className="space-y-2 px-4 pb-4 sm:px-6">
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                      ↔ Horizontal scroll
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                      ↕ Vertical scroll
                    </span>
                    <span>Drag or use scrollbars to view all columns and rows.</span>
                  </p>
                  <div className="statement-datatable rounded-xl border border-slate-200 bg-white">
                    <DataTable
                      columns={columns}
                      data={filteredTransactions}
                      pagination
                      paginationPerPage={rowsPerPage}
                      paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                      onChangeRowsPerPage={(newRowsPerPage) =>
                        setRowsPerPage(newRowsPerPage)
                      }
                      paginationComponentOptions={{
                        rowsPerPageText: "Rows per page:",
                        rangeSeparatorText: "of",
                      }}
                      sortIcon={<span className="ml-1 text-slate-400">↕</span>}
                      defaultSortFieldId="createdAt"
                      defaultSortAsc={false}
                      onSort={(column, direction) => {
                        setSortState({
                          field: String(column.id ?? column.name ?? "createdAt"),
                          direction: direction === "asc" ? "asc" : "desc",
                        });
                      }}
                      highlightOnHover
                      striped
                      fixedHeader
                      fixedHeaderScrollHeight={STATEMENT_TABLE_SCROLL_HEIGHT}
                      persistTableHead
                      customStyles={tableCustomStyles}
                      noDataComponent={
                        <div className="py-16 text-center">
                          <p className="text-sm font-medium text-slate-600">
                            No transactions found
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            Try adjusting your search or filter
                          </p>
                        </div>
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0">
        {printTxn && (
          <ReceiptContent
            ref={hiddenPrintRef}
            txn={printTxn}
            customer={receiptCustomer}
          />
        )}
      </div>
    </>
  );
}
