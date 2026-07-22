import { exportToCsv, exportToExcel, printTable } from "@/src/lib/exportUtils";
import type {
  WalletSummaryListParams,
  WalletSummaryTransaction,
} from "@/src/types/walletSummary";

export const WALLET_SUMMARY_TYPE_FILTERS = ["ALL", "CREDIT", "DEDUCT"] as const;

export const WALLET_SUMMARY_STATUS_FILTERS = [
  "All",
  "SUCCESS",
  "FAILED",
  "REVERSED",
  "REFUNDED",
] as const;

export function formatWalletSummaryAmount(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatWalletSummaryDateTime(
  date?: string,
  time?: string,
  createdAt?: string
): string {
  if (date && time) {
    const [y, m, d] = date.split("-");
    if (y && m && d) return `${d}-${m}-${y} ${time}`;
    return `${date} ${time}`;
  }
  if (!createdAt) return "—";
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) return "—";
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  const hh = String(parsed.getHours()).padStart(2, "0");
  const min = String(parsed.getMinutes()).padStart(2, "0");
  const ss = String(parsed.getSeconds()).padStart(2, "0");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}`;
}

export function formatWalletSummaryDate(value: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function titleCaseService(value: string): string {
  const raw = value.trim();
  if (!raw) return "—";
  if (raw.includes(" ")) return raw;
  return raw
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizePerformer(raw: Record<string, unknown> | null | undefined) {
  if (!raw) return null;
  return {
    id: String(raw.id || ""),
    name: String(raw.name || "—"),
    email: raw.email ? String(raw.email) : null,
    mobile: raw.mobile ? String(raw.mobile) : null,
    userCode: raw.userCode ? String(raw.userCode) : null,
    role: raw.role ? String(raw.role) : null,
    roleLabel: raw.roleLabel ? String(raw.roleLabel) : null,
  };
}

export function isCommissionLedgerRow(row: {
  service?: string;
  serviceType?: string;
  transactionType?: string;
  walletType?: string;
}): boolean {
  const service = String(row.service || "").toUpperCase();
  const serviceType = String(row.serviceType || "").toUpperCase();
  const transactionType = String(row.transactionType || "").toUpperCase();
  const walletType = String(row.walletType || "").toUpperCase();

  return (
    walletType === "COMMISSION" ||
    serviceType === "COMMISSION" ||
    transactionType === "COMMISSION" ||
    service.includes("COMMISSION")
  );
}

export function isPendingLedgerRow(row: { status?: string }): boolean {
  return String(row.status || "").toUpperCase() === "PENDING";
}

/** Hide Pending + Commission rows from wallet summary grid */
export function shouldShowWalletLedgerRow(row: {
  status?: string;
  service?: string;
  serviceType?: string;
  transactionType?: string;
  walletType?: string;
}): boolean {
  return !isPendingLedgerRow(row) && !isCommissionLedgerRow(row);
}

export function normalizeWalletSummaryTransaction(
  raw: Record<string, unknown>,
  index = 0
): WalletSummaryTransaction {
  const service = String(raw.service || raw.operationType || raw.action || "");
  const serviceType = String(raw.serviceType || "");
  const transactionType = String(
    raw.transactionType || raw.type || ""
  ).toUpperCase();
  const status = String(raw.status || "SUCCESS").toUpperCase();
  const openingBalance = toNumber(raw.openingBalance);
  const closingBalance = toNumber(
    raw.closingBalance ?? raw.updatedBalance ?? raw.openingBalance
  );
  const transactionAmount = toNumber(
    raw.transactionAmount ?? raw.amount ?? raw.txnAmount
  );
  const amountCr = toNumber(raw.amountCr ?? raw.credit);
  const amountDr = toNumber(raw.amountDr ?? raw.debit);
  const charge = toNumber(raw.charge);
  const commission = toNumber(raw.commission);
  const tds = toNumber(raw.tds);
  const ledgerNo = String(
    raw.ledgerNo || raw.reference || raw.referenceId || raw.id || ""
  );
  const description = String(
    raw.description || raw.remarks || raw.message || ""
  ).trim();
  const remarks = raw.remarks ? String(raw.remarks) : null;
  const displayDescription =
    status === "FAILED" && remarks
      ? remarks.split(".")[0]?.trim() || description
      : description;

  const isCredit =
    amountCr > 0 ||
    transactionType === "CREDIT" ||
    transactionType === "TOPUP" ||
    transactionType === "COMMISSION" ||
    String(raw.type || "").toUpperCase() === "CREDIT";

  return {
    id: String(raw.id || raw.ledgerId || `${index}`),
    rowNumber: toNumber(raw.rowNumber) || index + 1,
    ledgerId: String(raw.ledgerId || raw.id || ""),
    ledgerNo,
    date: raw.date ? String(raw.date) : "",
    time: raw.time ? String(raw.time) : "",
    createdAt: String(raw.createdAt || ""),
    transactionId: String(raw.transactionId || ""),
    referenceId: String(raw.referenceId || ""),
    reference: ledgerNo,
    service,
    serviceLabel: titleCaseService(service),
    serviceType,
    transactionType,
    description: displayDescription || "—",
    status,
    openingBalance,
    transactionAmount,
    charge,
    gst: toNumber(raw.gst),
    commission,
    tds,
    amountCr,
    amountDr,
    closingBalance,
    walletType: String(raw.walletType || "MAIN"),
    remarks,
    type: isCredit ? "CREDIT" : "DEDUCT",
    operationType: serviceType || service,
    action: String(raw.action || service),
    amount: transactionAmount,
    updatedBalance: closingBalance,
    performedBy: normalizePerformer(
      (raw.performedBy || raw.retailer || raw.agent) as
        | Record<string, unknown>
        | undefined
    ),
    message: raw.message ? String(raw.message) : null,
  };
}

export function buildWalletSummaryQuery(
  params: WalletSummaryListParams = {}
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
    type: params.type ?? "ALL",
  };

  if (params.status && params.status !== "All") {
    query.status = params.status;
  }
  if (params.startDate) query.startDate = params.startDate;
  if (params.endDate) query.endDate = params.endDate;
  if (params.search?.trim()) query.search = params.search.trim();

  // Prefer server-side exclusion when supported by API
  query.excludePending = 1;
  query.excludeCommission = 1;

  return query;
}

export const WALLET_SUMMARY_EXPORT_COLUMNS = [
  {
    label: "#",
    selector: (row: WalletSummaryTransaction) => String(row.rowNumber || ""),
  },
  {
    label: "Date & Time",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryDateTime(row.date, row.time, row.createdAt),
  },
  {
    label: "Ledger No",
    selector: (row: WalletSummaryTransaction) => row.ledgerNo || "—",
  },
  {
    label: "Service",
    selector: (row: WalletSummaryTransaction) => row.serviceLabel || "—",
  },
  {
    label: "Description",
    selector: (row: WalletSummaryTransaction) => row.description || "—",
  },
  {
    label: "Status",
    selector: (row: WalletSummaryTransaction) => row.status || "—",
  },
  {
    label: "Opening Balance",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.openingBalance),
  },
  {
    label: "Txn Amount",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.transactionAmount),
  },
  {
    label: "Charge",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.charge),
  },
  {
    label: "Comm.",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.commission),
  },
  {
    label: "TDS",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.tds),
  },
  {
    label: "Credit (Cr)",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.amountCr),
  },
  {
    label: "Debit (Dr)",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.amountDr),
  },
  {
    label: "Closing Balance",
    selector: (row: WalletSummaryTransaction) =>
      formatWalletSummaryAmount(row.closingBalance),
  },
] as const;

export function exportWalletSummaryCsv(rows: WalletSummaryTransaction[]): void {
  exportToCsv(
    `Wallet_Summary_${new Date().toISOString().slice(0, 10)}.csv`,
    rows,
    WALLET_SUMMARY_EXPORT_COLUMNS
  );
}

export function exportWalletSummaryExcel(rows: WalletSummaryTransaction[]): void {
  exportToExcel(
    `Wallet_Summary_${new Date().toISOString().slice(0, 10)}`,
    rows,
    WALLET_SUMMARY_EXPORT_COLUMNS
  );
}

export function printWalletSummary(rows: WalletSummaryTransaction[]): void {
  printTable(
    `Wallet Summary (${rows.length} records)`,
    rows,
    WALLET_SUMMARY_EXPORT_COLUMNS
  );
}

export async function exportWalletSummaryPdf(
  rows: WalletSummaryTransaction[]
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(16);
  doc.setTextColor(0, 31, 91);
  doc.text("Wallet Summary", 14, 14);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date().toLocaleString("en-IN")} · ${rows.length} records`,
    14,
    20
  );

  autoTable(doc, {
    head: [WALLET_SUMMARY_EXPORT_COLUMNS.map((col) => col.label)],
    body: rows.map((row) =>
      WALLET_SUMMARY_EXPORT_COLUMNS.map((col) => String(col.selector(row) ?? ""))
    ),
    startY: 24,
    styles: { fontSize: 6.5, cellPadding: 1.5 },
    headStyles: { fillColor: [0, 87, 217], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`Wallet_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
}
