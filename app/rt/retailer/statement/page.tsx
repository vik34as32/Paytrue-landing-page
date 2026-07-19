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
import { Label } from "@/components/ui/label";
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
import { RECEIPT_PRINT_PAGE_STYLE } from "@/src/constants/receiptPrint";
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
import { useAepsLedger } from "@/src/hooks/useAepsLedger";
import ReferenceCopyCell from "@/src/components/statement/ReferenceCopyCell";
import StatementBankCell from "@/src/components/statement/StatementBankCell";
import { buildUpiAtmStatementColumns } from "@/src/components/statement/buildUpiAtmStatementColumns";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ServiceFilter =  "DMT" | "UPI ATM" | "AEPS";

type AepsSubFilter = "CASH_WITHDRAWAL" | "CASH_DEPOSIT";

const AEPS_SUB_FILTERS: { label: string; value: AepsSubFilter }[] = [
  { label: "Cash Withdrawal", value: "CASH_WITHDRAWAL" },
  { label: "Cash Deposit", value: "CASH_DEPOSIT" },
];

const getBankName = async (ifsc: string) => {
  const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
  const data = await res.json();
  return data.BANK;
};

interface ExportRow {
  "Transaction ID": string;
  "Reference Number": string;
  Date: string;
  Service: string;
  Description: string;
  Type: string;
  Status: string;
  "Transfer Amount": string;
  "Deduction Amount": string;
  Commission: string;
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

const SERVICE_FILTERS: ServiceFilter[] = ["DMT", "UPI ATM", "AEPS"];

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30];
const RETAILER_NAME = "Amit Kumar";

/** Fixed widths keep header cells aligned with body cells while scrolling */
const COL = {
  date: "150px",
  reference: "200px",
  service: "110px",
  description: "160px",
  bank: "140px",
  aadhaar: "130px",
  message: "200px",
  mobile: "110px",
  type: "88px",
  status: "100px",
  amount: "112px",
  action: "88px",
} as const;

function getPrincipalAmount(txn: StatementTransaction): number {
  const aepsType = String(txn.aepsTransactionType || "").toUpperCase();

  if (aepsType === "CASH_WITHDRAWAL") {
    return txn.withdrawalAmount ?? txn.amount ?? 0;
  }
  if (aepsType === "CASH_DEPOSIT") {
    return txn.transferAmount ?? txn.amount ?? 0;
  }

  return txn.transferAmount ?? txn.amount ?? 0;
}

function getDeductionAmount(txn: StatementTransaction): number {
  // null / undefined → 0
  return txn.deductionAmount ?? txn.charges ?? 0;
}

function getCommissionAmount(txn: StatementTransaction): number {
  return txn.commission ?? 0;
}

/** Failed / pending / expired must not show Credit / Debit movement. */
function getCreditDisplayAmount(txn: StatementTransaction): number {
  if (txn.status !== "success") return 0;
  if (txn.creditAmount != null && txn.creditAmount > 0) {
    return txn.creditAmount;
  }
  return txn.type === "credit" ? getPrincipalAmount(txn) : 0;
}

function getDebitDisplayAmount(txn: StatementTransaction): number {
  if (txn.status !== "success") return 0;

  if (txn.debitAmount != null && txn.debitAmount > 0) {
    return txn.debitAmount;
  }

  return txn.type === "debit" ? getPrincipalAmount(txn) : 0;
}


/** Inclusive local-date range filter on createdAt. */
function matchesDateRange(
  createdAt: string,
  startDate: string,
  endDate: string
): boolean {
  if (!startDate && !endDate) return true;
  const time = new Date(createdAt).getTime();
  if (!Number.isFinite(time)) return false;

  if (startDate) {
    const start = new Date(`${startDate}T00:00:00`).getTime();
    if (time < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59.999`).getTime();
    if (time > end) return false;
  }
  return true;
}

const tableCustomStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
      width: "max-content",
      minWidth: "100%",
    },
  },
  tableWrapper: {
    style: {
      display: "block",
      overflow: "visible",
    },
  },
  responsiveWrapper: {
    style: {
      overflow: "visible",
    },
  },
  headRow: {
    style: {
      backgroundColor: "#f1f5f9",
      borderBottomWidth: "1px",
      borderBottomColor: "#e2e8f0",
      minHeight: "52px",
    },
  },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase" as const,
      letterSpacing: "0.04em",
      color: "#64748b",
      paddingLeft: "10px",
      paddingRight: "10px",
      boxSizing: "border-box" as const,
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
      paddingLeft: "10px",
      paddingRight: "10px",
      boxSizing: "border-box" as const,
      overflow: "hidden",
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#64748b",
      minHeight: "52px",
      backgroundColor: "#ffffff",
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

function matchesServiceFilter(
  service: string,
  filter: ServiceFilter
): boolean {
  if (filter === "DMT") {
    return service === "DMT" || service === "Money Transfer";
  }
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
  const creditAmount = getCreditDisplayAmount(txn);
  const debitAmount = getDebitDisplayAmount(txn);
  const transferAmount = getPrincipalAmount(txn);
  const deductionAmount = getDeductionAmount(txn);
  const commissionAmount = getCommissionAmount(txn);

  return {
    "Transaction ID": formatTransactionId(txn.id),
    "Reference Number": txn.referenceNumber,
    Date: formatStatementDate(txn.createdAt),
    Service: txn.service,
    Description: txn.description,
    Type: txn.type,
    Status: txn.status,
    "Transfer Amount": transferAmount ? formatCurrency(transferAmount) : "—",
    "Deduction Amount": deductionAmount ? formatCurrency(deductionAmount) : "—",
    Commission: commissionAmount ? formatCurrency(commissionAmount) : "—",
    "Previous Balance": formatBalanceExport(txn.openingBalance, txn),
    "Credit Amount": creditAmount ? formatCurrency(creditAmount) : "—",
    "Debit Amount": debitAmount ? formatCurrency(debitAmount) : "—",
    "Updated Balance": formatBalanceExport(txn.balanceAfter, txn),
    Amount: txn.amount,
    "Bank Name": txn.bankName ?? txn.receiverName ?? "",
    "Account Number": txn.aadhaarMasked || txn.accountNumber || "",
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
    formatCurrency(getPrincipalAmount(txn)),
    formatCurrency(getDeductionAmount(txn)),
    formatCurrency(getCommissionAmount(txn)),
    formatBalanceExport(txn.openingBalance, txn),
    getCreditDisplayAmount(txn)
      ? formatCurrency(getCreditDisplayAmount(txn))
      : "—",
    getDebitDisplayAmount(txn)
      ? formatCurrency(getDebitDisplayAmount(txn))
      : "—",
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
        "Transfer",
        "Deduction",
        "Commission",
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
    ) : status === "expired" ? (
      <Badge className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
        Expired
      </Badge>
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
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>("DMT");
  const [aepsSubFilter, setAepsSubFilter] =
    useState<AepsSubFilter>("CASH_WITHDRAWAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
    isLoading: statementLoading,
    isError: statementError,
    isFetching: statementFetching,
    refetch: refetchStatement,
  } = useRetailerStatement();

  const {
    data: aepsLedgerData,
    isLoading: aepsLoading,
    isError: aepsError,
    isFetching: aepsFetching,
    refetch: refetchAeps,
  } = useAepsLedger(
    {
      transactionType: aepsSubFilter,
      page: 1,
      limit: 100,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { enabled: serviceFilter === "AEPS" }
  );

  const isAepsView = serviceFilter === "AEPS";
  const isLoading = isAepsView ? aepsLoading : statementLoading;
  const isError = isAepsView ? aepsError : statementError;
  const isFetching = isAepsView ? aepsFetching : statementFetching;
  const refetch = isAepsView ? refetchAeps : refetchStatement;

  const allTransactions = useMemo(() => {
    if (isAepsView) {
      return aepsLedgerData?.transactions ?? [];
    }
    return statementData?.transactions ?? [];
  }, [isAepsView, aepsLedgerData?.transactions, statementData?.transactions]);

  const fetchErrors = isAepsView ? [] : (statementData?.errors ?? []);

  useEffect(() => {
    if (serviceFilter !== "AEPS") {
      setAepsSubFilter("CASH_WITHDRAWAL");
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
      // UPI ATM statement: hide PENDING (QR still open / not settled)
      if (serviceFilter === "UPI ATM" && txn.status === "pending") {
        return false;
      }
      if (!matchesDateRange(txn.createdAt, startDate, endDate)) return false;
      if (!query) return true;

      return (
        txn.id.toLowerCase().includes(query) ||
        formatTransactionId(txn.id).toLowerCase().includes(query) ||
        txn.referenceNumber.toLowerCase().includes(query) ||
        txn.description.toLowerCase().includes(query) ||
        txn.service.toLowerCase().includes(query) ||
        (txn.bankName ?? "").toLowerCase().includes(query) ||
        (txn.accountNumber ?? "").toLowerCase().includes(query) ||
        (txn.aadhaarMasked ?? "").toLowerCase().includes(query) ||
        (txn.remark ?? "").toLowerCase().includes(query) ||
        (txn.vpa ?? "").toLowerCase().includes(query) ||
        txn.mobile.toLowerCase().includes(query)
      );
    });
  }, [search, serviceFilter, aepsSubFilter, startDate, endDate, allTransactions]);

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

  const columns: TableColumn<StatementTransaction>[] = useMemo(() => {
    if (serviceFilter === "UPI ATM") {
      return buildUpiAtmStatementColumns({
        openReceipt,
        downloadReceipt: (row) => void handleDownloadReceipt(row),
        printReceipt: (row) => void printReceipt(row),
      });
    }

    const isAeps = serviceFilter === "AEPS";
    const principalHeader =
      isAeps && aepsSubFilter === "CASH_WITHDRAWAL" ? (
        <StackedHeader lines={["Withdrawal", "Amount"]} />
      ) : isAeps && aepsSubFilter === "CASH_DEPOSIT" ? (
        <StackedHeader lines={["Transfer", "Amount"]} />
      ) : (
        <StackedHeader lines={["Transfer", "Amount"]} />
      );

    const baseBeforeAmount: TableColumn<StatementTransaction>[] = [
      {
        id: "createdAt",
        name: "Date",
        selector: (row) => row.createdAt,
        sortable: true,
        width: COL.date,
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
        width: COL.reference,
        cell: (row) => <ReferenceCopyCell value={row.referenceNumber} />,
      },
      {
        id: "service",
        name: "Service",
        selector: (row) => row.service,
        sortable: true,
        width: COL.service,
        cell: (row) => (
          <span className="whitespace-nowrap text-slate-700">{row.service}</span>
        ),
      },
      {
        id: "description",
        name: "Description",
        selector: (row) => row.description,
        sortable: true,
        width: COL.description,
        wrap: true,
      },
      {
        id: "bankName",
        name: "Bank",
        selector: (row) => row.bankName ?? row.receiverName ?? row.ifscCode ?? "",
        sortable: true,
        width: COL.bank,
        wrap: true,
        cell: (row) => (
          <StatementBankCell
            bankName={row.bankName}
            receiverName={row.receiverName}
            ifscCode={row.ifscCode}
          />
        ),
      },
      {
        id: "accountNumber",
        name: isAeps ? "Aadhaar" : "Account",
        selector: (row) =>
          isAeps
            ? row.aadhaarMasked || row.accountNumber || ""
            : row.accountNumber ?? "",
        sortable: true,
        width: COL.aadhaar,
        cell: (row) => (
          <span className="font-mono text-xs text-slate-700">
            {isAeps
              ? row.aadhaarMasked || row.accountNumber || "—"
              : row.accountNumber || "—"}
          </span>
        ),
      },
    ];

    const messageColumn: TableColumn<StatementTransaction> = {
      id: "message",
      name: "Message",
      selector: (row) => row.remark ?? "",
      sortable: true,
      width: COL.message,
      wrap: true,
      cell: (row) => (
        <span
          className={cn(
            "line-clamp-2 text-xs leading-snug",
            row.status === "failed"
              ? "font-medium text-red-600"
              : row.status === "success"
                ? "text-emerald-700"
                : "text-slate-600"
          )}
          title={row.remark || undefined}
        >
          {row.remark?.trim() ? row.remark : "—"}
        </span>
      ),
    };

    const amountColumns: TableColumn<StatementTransaction>[] = [
      {
        id: "mobile",
        name: "Mobile",
        selector: (row) => row.mobile,
        sortable: true,
        width: COL.mobile,
        cell: (row) => (
          <span className="tabular-nums text-slate-700">{row.mobile || "—"}</span>
        ),
      },
      {
        id: "type",
        name: "Type",
        selector: (row) => row.type,
        sortable: true,
        width: COL.type,
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
        width: COL.status,
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "principalAmount",
        name: principalHeader,
        selector: (row) => getPrincipalAmount(row),
        sortable: true,
        right: true,
        width: COL.amount,
        cell: (row) => (
          <StatementBalanceCell
            value={getPrincipalAmount(row)}
            tone="neutral"
          />
        ),
      },
      {
        id: "deductionAmount",
        name: <StackedHeader lines={["Chargeable", "Amount"]} />,
        selector: (row) => getDeductionAmount(row),
        sortable: true,
        right: true,
        width: COL.amount,
        cell: (row) => (
          <StatementBalanceCell
            value={getDeductionAmount(row)}
            tone={getDeductionAmount(row) > 0 ? "debit" : "neutral"}
          />
        ),
      },
      {
        id: "commission",
        name: "Commission",
        selector: (row) => getCommissionAmount(row),
        sortable: true,
        right: true,
        width: COL.amount,
        cell: (row) => (
          <StatementBalanceCell
            value={getCommissionAmount(row)}
            tone={getCommissionAmount(row) > 0 ? "credit" : "neutral"}
          />
        ),
      },
      {
        id: "openingBalance",
        name: <StackedHeader lines={["Previous", "Balance"]} />,
        selector: (row) => row.openingBalance,
        sortable: true,
        right: true,
        width: COL.amount,
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
        selector: (row) => getCreditDisplayAmount(row),
        sortable: true,
        right: true,
        width: COL.amount,
        cell: (row) => (
          <StatementBalanceCell
            value={getCreditDisplayAmount(row)}
            tone="credit"
          />
        ),
      },
      {
        id: "debitAmount",
        name: <StackedHeader lines={["Debit", "Amount"]} />,
        selector: (row) => getDebitDisplayAmount(row),
        sortable: true,
        right: true,
        width: COL.amount,
        cell: (row) => (
          <StatementBalanceCell
            value={getDebitDisplayAmount(row)}
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
        width: COL.amount,
        cell: (row) =>
          hasStatementBalance(row) ? (
            <StatementBalanceCell value={row.balanceAfter} tone="balance" />
          ) : (
            <span className="text-slate-300">—</span>
          ),
      },
      {
        id: "action",
        name: "Action",
        width: COL.action,
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
        allowOverflow: false,
        button: true,
      },
    ];

    return [
      ...baseBeforeAmount,
      ...(isAeps ? [messageColumn] : []),
      ...amountColumns,
    ];
  }, [
    handleDownloadReceipt,
    openReceipt,
    printReceipt,
    serviceFilter,
    aepsSubFilter,
  ]);

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

              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search ID, reference, description, service..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-[148px]">
                    <Label
                      htmlFor="statement-start-date"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Start Date
                    </Label>
                    <Input
                      id="statement-start-date"
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-9 rounded-lg border-slate-200 text-sm"
                    />
                  </div>
                  <div className="w-[148px]">
                    <Label
                      htmlFor="statement-end-date"
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      End Date
                    </Label>
                    <Input
                      id="statement-end-date"
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-9 rounded-lg border-slate-200 text-sm"
                    />
                  </div>
                  {startDate || endDate ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                    >
                      Clear dates
                    </Button>
                  ) : null}
                </div>
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
                    <span>
                      {serviceFilter === "UPI ATM"
                        ? "UPI ATM — PENDING hide; QR, Response, VPA alag table."
                        : "Scroll karne par header aur data saath move karenge — columns aligned rahenge."}
                    </span>
                  </p>
                  <div
                    className={cn(
                      "statement-datatable max-h-[520px] overflow-auto rounded-xl border border-slate-200 bg-white",
                      serviceFilter === "UPI ATM" && "statement-upi-atm"
                    )}
                  >
                    <DataTable
                      key={`statement-${serviceFilter}-${aepsSubFilter}`}
                      columns={columns}
                      data={filteredTransactions}
                      responsive={false}
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
                      dense
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
