"use client";

import {
  forwardRef,
  useCallback,
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
  MoreHorizontal,
  Printer,
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
import TransactionReceipt from "@/src/components/statement/TransactionReceipt";
import ReceiptActions from "@/src/components/statement/ReceiptActions";
import ReceiptPageLayout from "@/src/components/statement/receipt/ReceiptPageLayout";
import { RETAILER_USER } from "@/features/retailer/constants";
import type { ReceiptCustomerInfo } from "@/types/statementReceipt";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type TransactionType = "debit" | "credit";
type TransactionStatus = "success" | "pending" | "failed";

type StatementService =
  | "Recharge"
  | "Money Transfer"
  | "AEPS"
  | "Aadhaar Pay"
  | "BBPS"
  | "Electricity"
  | "Water Bill"
  | "Gas Bill"
  | "FASTag"
  | "LIC"
  | "Insurance"
  | "DTH"
  | "Credit Card"
  | "Broadband";

interface StatementTransaction {
  id: string;
  referenceNumber: string;
  createdAt: string;
  service: StatementService;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  openingBalance: number;
  balanceAfter: number;
  senderName: string;
  receiverName: string;
  mobile: string;
  remark: string;
}

type ServiceFilter =
  | "All"
  | "Recharge"
  | "Money Transfer"
  | "AEPS"
  | "BBPS"
  | "Insurance"
  | "Bill Payment";

interface ExportRow {
  "Transaction ID": string;
  "Reference Number": string;
  Date: string;
  Service: string;
  Description: string;
  Type: string;
  Status: string;
  Amount: number;
  "Opening Balance": number;
  "Closing Balance": number;
  "Sender Name": string;
  "Receiver Name": string;
  Mobile: string;
  Remark: string;
}

type JsPdfWithAutoTable = jsPDF & {
  lastAutoTable?: { finalY: number };
};

const SERVICE_FILTERS: ServiceFilter[] = [
  "All",
  "Recharge",
  "Money Transfer",
  "AEPS",
  "BBPS",
  "Insurance",
  "Bill Payment",
];

const BILL_PAYMENT_SERVICES: StatementService[] = [
  "Electricity",
  "Water Bill",
  "Gas Bill",
  "FASTag",
  "DTH",
  "Credit Card",
  "Broadband",
  "BBPS",
];

const ROWS_PER_PAGE_OPTIONS = [10, 20, 30];
const RETAILER_NAME = "Amit Kumar";

const tableCustomStyles = {
  table: { style: { backgroundColor: "transparent" } },
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
  cells: { style: { fontSize: "13px", color: "#0b1f3a" } },
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

function generateReferenceNumber(index: number): string {
  return `PTX${String(100000 + index * 7919).slice(-8)}RT`;
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

function formatAmountDisplay(type: TransactionType, amount: number): string {
  return `${type === "debit" ? "-" : "+"}${formatCurrency(amount)}`;
}

function mapToExportRow(txn: StatementTransaction): ExportRow {
  return {
    "Transaction ID": formatTransactionId(txn.id),
    "Reference Number": txn.referenceNumber,
    Date: formatStatementDate(txn.createdAt),
    Service: txn.service,
    Description: txn.description,
    Type: txn.type,
    Status: txn.status,
    Amount: txn.amount,
    "Opening Balance": txn.openingBalance,
    "Closing Balance": txn.balanceAfter,
    "Sender Name": txn.senderName,
    "Receiver Name": txn.receiverName,
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
    formatAmountDisplay(txn.type, txn.amount),
    formatCurrency(txn.balanceAfter),
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
        "Amount",
        "Closing Bal.",
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

function generateFakeTransactions(): StatementTransaction[] {
  type SeedItem = Omit<
    StatementTransaction,
    | "id"
    | "referenceNumber"
    | "createdAt"
    | "openingBalance"
    | "balanceAfter"
  >;

  const seed: SeedItem[] = [
    {
      service: "Recharge",
      description: "Jio prepaid recharge · 9876543210",
      type: "debit",
      amount: 299,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Jio Prepaid",
      mobile: "9876543210",
      remark: "Mobile recharge completed successfully",
    },
    {
      service: "Money Transfer",
      description: "DMT to Rahul Sharma · SBI",
      type: "debit",
      amount: 5000,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Rahul Sharma",
      mobile: "9876543210",
      remark: "Domestic money transfer",
    },
    {
      service: "AEPS",
      description: "Cash withdrawal AEPS · ICICI",
      type: "credit",
      amount: 1200,
      status: "success",
      senderName: "ICICI Bank AEPS",
      receiverName: RETAILER_NAME,
      mobile: "9123456789",
      remark: "AEPS commission credit",
    },
    {
      service: "Electricity",
      description: "BSES Rajdhani · Consumer 7845123690",
      type: "debit",
      amount: 1850,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "BSES Rajdhani",
      mobile: "9876501234",
      remark: "Electricity bill payment",
    },
    {
      service: "Recharge",
      description: "Airtel DTH recharge · 1122334455",
      type: "debit",
      amount: 350,
      status: "pending",
      senderName: RETAILER_NAME,
      receiverName: "Airtel DTH",
      mobile: "1122334455",
      remark: "Awaiting operator confirmation",
    },
    {
      service: "BBPS",
      description: "BBPS bill payment · Municipal tax",
      type: "debit",
      amount: 2200,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Municipal Corporation",
      mobile: "9988776655",
      remark: "BBPS municipal tax payment",
    },
    {
      service: "Money Transfer",
      description: "DMT to Priya Patel · HDFC",
      type: "debit",
      amount: 3500,
      status: "failed",
      senderName: RETAILER_NAME,
      receiverName: "Priya Patel",
      mobile: "9123456780",
      remark: "Beneficiary bank timeout",
    },
    {
      service: "Aadhaar Pay",
      description: "Aadhaar Pay collection · Merchant",
      type: "credit",
      amount: 750,
      status: "success",
      senderName: "Walk-in Customer",
      receiverName: RETAILER_NAME,
      mobile: "9012345678",
      remark: "Aadhaar Pay settlement",
    },
    {
      service: "Water Bill",
      description: "Delhi Jal Board · KNO 5566778899",
      type: "debit",
      amount: 640,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Delhi Jal Board",
      mobile: "9876512345",
      remark: "Water utility bill",
    },
    {
      service: "FASTag",
      description: "FASTag recharge · HR26AB1234",
      type: "debit",
      amount: 500,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "NHAI FASTag",
      mobile: "9876509876",
      remark: "Vehicle FASTag top-up",
    },
    {
      service: "Insurance",
      description: "Health insurance premium · Policy 889900",
      type: "debit",
      amount: 4200,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Star Health Insurance",
      mobile: "9123409876",
      remark: "Insurance premium payment",
    },
    {
      service: "Recharge",
      description: "Vi mobile recharge · 9988776655",
      type: "debit",
      amount: 179,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Vi Prepaid",
      mobile: "9988776655",
      remark: "Prepaid recharge",
    },
    {
      service: "AEPS",
      description: "Mini statement enquiry commission",
      type: "credit",
      amount: 15,
      status: "success",
      senderName: "PayTrue Commission",
      receiverName: RETAILER_NAME,
      mobile: "9876543210",
      remark: "AEPS enquiry commission",
    },
    {
      service: "Gas Bill",
      description: "Indane Gas · LPG ID 4455667788",
      type: "debit",
      amount: 920,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Indane Gas",
      mobile: "9123456701",
      remark: "LPG cylinder booking payment",
    },
    {
      service: "Money Transfer",
      description: "DMT to Amit Singh · Axis Bank",
      type: "debit",
      amount: 10000,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Amit Singh",
      mobile: "9876001234",
      remark: "IMPS transfer to savings account",
    },
    {
      service: "LIC",
      description: "LIC premium payment · Policy 5544332211",
      type: "debit",
      amount: 3100,
      status: "pending",
      senderName: RETAILER_NAME,
      receiverName: "LIC of India",
      mobile: "9123456789",
      remark: "Premium processing",
    },
    {
      service: "DTH",
      description: "Tata Play recharge · Subscriber 6677889900",
      type: "debit",
      amount: 450,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Tata Play",
      mobile: "6677889900",
      remark: "DTH monthly recharge",
    },
    {
      service: "Credit Card",
      description: "HDFC Credit Card bill · XXXX 4521",
      type: "debit",
      amount: 8500,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "HDFC Bank",
      mobile: "9876543201",
      remark: "Credit card bill payment",
    },
    {
      service: "Broadband",
      description: "Jio Fiber bill · Account BF998877",
      type: "debit",
      amount: 799,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Jio Fiber",
      mobile: "9988771122",
      remark: "Broadband monthly bill",
    },
    {
      service: "Recharge",
      description: "BSNL mobile recharge · 9123456780",
      type: "debit",
      amount: 107,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "BSNL Prepaid",
      mobile: "9123456780",
      remark: "Top-up recharge",
    },
    {
      service: "BBPS",
      description: "BBPS education fee · Student ID ST2026",
      type: "debit",
      amount: 15000,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Delhi Public School",
      mobile: "9876123450",
      remark: "School fee via BBPS",
    },
    {
      service: "AEPS",
      description: "AEPS balance enquiry · Commission",
      type: "credit",
      amount: 8,
      status: "success",
      senderName: "PayTrue Commission",
      receiverName: RETAILER_NAME,
      mobile: "9876543210",
      remark: "Micro commission credit",
    },
    {
      service: "Electricity",
      description: "MSEDCL Maharashtra · Consumer 3344556677",
      type: "debit",
      amount: 2340,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "MSEDCL",
      mobile: "9123401234",
      remark: "Maharashtra electricity bill",
    },
    {
      service: "Money Transfer",
      description: "Refund · Failed DMT reversal",
      type: "credit",
      amount: 3500,
      status: "success",
      senderName: "PayTrue Settlement",
      receiverName: RETAILER_NAME,
      mobile: "9876543210",
      remark: "Auto reversal for failed transfer",
    },
    {
      service: "Insurance",
      description: "Motor insurance renewal · Policy MOT8822",
      type: "debit",
      amount: 5600,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "ICICI Lombard",
      mobile: "9123456098",
      remark: "Vehicle insurance renewal",
    },
    {
      service: "Aadhaar Pay",
      description: "Aadhaar Pay settlement credit",
      type: "credit",
      amount: 2400,
      status: "success",
      senderName: "NPCI Settlement",
      receiverName: RETAILER_NAME,
      mobile: "9876543210",
      remark: "Daily Aadhaar Pay settlement",
    },
    {
      service: "Water Bill",
      description: "Bangalore Water Board · RR 7788990011",
      type: "debit",
      amount: 480,
      status: "failed",
      senderName: RETAILER_NAME,
      receiverName: "BWSSB",
      mobile: "9123456712",
      remark: "Biller service unavailable",
    },
    {
      service: "Recharge",
      description: "Jio recharge · 9876501234",
      type: "debit",
      amount: 666,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "Jio Prepaid",
      mobile: "9876501234",
      remark: "Combo plan recharge",
    },
    {
      service: "FASTag",
      description: "NHAI FASTag top-up · DL01CD5678",
      type: "debit",
      amount: 1000,
      status: "success",
      senderName: RETAILER_NAME,
      receiverName: "NHAI FASTag",
      mobile: "9876005678",
      remark: "Highway toll wallet recharge",
    },
    {
      service: "Money Transfer",
      description: "Admin wallet credit · Settlement",
      type: "credit",
      amount: 20000,
      status: "success",
      senderName: "PayTrue Admin",
      receiverName: RETAILER_NAME,
      mobile: "9876543210",
      remark: "Weekly settlement credit",
    },
  ];

  let runningBalance = 85000;
  const now = Date.now();
  const chronological = [...seed].reverse();

  const built = chronological.map((item, index) => {
    const openingBalance = runningBalance;
    if (item.type === "debit") {
      runningBalance -= item.amount;
    } else {
      runningBalance += item.amount;
    }

    const seq = seed.length - index;
    const createdAt = new Date(
      now - index * 36 * 60 * 60 * 1000 - (index % 5) * 15 * 60 * 1000
    ).toISOString();

    return {
      id: `stmt_${String(seq).padStart(3, "0")}`,
      referenceNumber: generateReferenceNumber(seq),
      createdAt,
      openingBalance,
      balanceAfter: runningBalance,
      ...item,
    };
  });

  return built.reverse();
}

const ALL_TRANSACTIONS = generateFakeTransactions();

function matchesServiceFilter(
  service: StatementService,
  filter: ServiceFilter
): boolean {
  if (filter === "All") return true;
  if (filter === "Recharge") return service === "Recharge";
  if (filter === "Money Transfer") return service === "Money Transfer";
  if (filter === "AEPS")
    return service === "AEPS" || service === "Aadhaar Pay";
  if (filter === "BBPS") return service === "BBPS";
  if (filter === "Insurance")
    return service === "Insurance" || service === "LIC";
  if (filter === "Bill Payment") return BILL_PAYMENT_SERVICES.includes(service);
  return true;
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  if (status === "success") return <Badge variant="success">Success</Badge>;
  if (status === "pending") return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="destructive">Failed</Badge>;
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
  }, []);

  const printReceipt = useCallback(
    (txn: StatementTransaction) => {
      setPrintTxn(txn);
      window.setTimeout(() => {
        handleHiddenPrint();
      }, 150);
    },
    [handleHiddenPrint]
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return ALL_TRANSACTIONS.filter((txn) => {
      if (!matchesServiceFilter(txn.service, serviceFilter)) return false;
      if (!query) return true;

      return (
        txn.id.toLowerCase().includes(query) ||
        formatTransactionId(txn.id).toLowerCase().includes(query) ||
        txn.referenceNumber.toLowerCase().includes(query) ||
        txn.description.toLowerCase().includes(query) ||
        txn.service.toLowerCase().includes(query)
      );
    });
  }, [search, serviceFilter]);

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
        minWidth: "130px",
        cell: (row) => (
          <span className="font-mono text-xs font-medium text-[#1565d8]">
            {row.referenceNumber}
          </span>
        ),
      },
      {
        id: "service",
        name: "Service",
        selector: (row) => row.service,
        sortable: true,
        minWidth: "130px",
      },
      {
        id: "description",
        name: "Description",
        selector: (row) => row.description,
        sortable: true,
        grow: 2,
        minWidth: "200px",
        wrap: true,
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
            className="capitalize"
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
        minWidth: "100px",
        cell: (row) => <StatusBadge status={row.status} />,
      },
      {
        id: "amount",
        name: "Amount",
        selector: (row) => row.amount,
        sortable: true,
        right: true,
        minWidth: "110px",
        cell: (row) => (
          <span
            className={cn(
              "font-semibold tabular-nums",
              row.type === "debit" ? "text-red-600" : "text-emerald-600"
            )}
          >
            {formatAmountDisplay(row.type, row.amount)}
          </span>
        ),
      },
      {
        id: "balanceAfter",
        name: "Closing Balance",
        selector: (row) => row.balanceAfter,
        sortable: true,
        right: true,
        minWidth: "130px",
        cell: (row) => (
          <span className="font-semibold tabular-nums text-slate-800">
            {formatCurrency(row.balanceAfter)}
          </span>
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
              <DropdownMenuItem onClick={() => printReceipt(row)}>
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
                    {filteredTransactions.length} of {ALL_TRANSACTIONS.length}{" "}
                    transactions
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
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
            </CardHeader>

            <CardContent className="px-0 pb-0 pt-4 sm:px-0">
              <div className="overflow-x-auto px-4 sm:px-6">
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
                  responsive
                  fixedHeader
                  fixedHeaderScrollHeight="520px"
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
