import { exportToCsv, exportToExcel, printTable } from "@/src/lib/exportUtils";
import type {
  WalletSummaryListParams,
  WalletSummaryTransaction,
} from "@/src/types/walletSummary";

export const WALLET_SUMMARY_TYPE_FILTERS = ["ALL", "CREDIT", "DEDUCT"] as const;

export const WALLET_SUMMARY_STATUS_FILTERS = [
  "All",
  "SUCCESS",
  "PENDING",
  "PROCESSING",
  "FAILED",
  "REVERSED",
  "REFUNDED",
] as const;

export const WALLET_SUMMARY_EXPORT_COLUMNS = [
  {
    label: "Date",
    selector: (row: WalletSummaryTransaction) =>
      row.date && row.time ? `${row.date} ${row.time}` : formatWalletSummaryDate(row.createdAt),
  },
  {
    label: "Reference",
    selector: (row: WalletSummaryTransaction) => row.reference || "—",
  },
  {
    label: "Performed By",
    selector: (row: WalletSummaryTransaction) => row.performedBy?.name || "—",
  },
  {
    label: "User Code",
    selector: (row: WalletSummaryTransaction) => row.performedBy?.userCode || "—",
  },
  {
    label: "Role",
    selector: (row: WalletSummaryTransaction) =>
      row.performedBy?.roleLabel || row.performedBy?.role || "—",
  },
  {
    label: "Previous Balance",
    selector: (row: WalletSummaryTransaction) => formatWalletSummaryAmount(row.openingBalance),
  },
  {
    label: "Credit Amount",
    selector: (row: WalletSummaryTransaction) =>
      row.type === "CREDIT" ? formatWalletSummaryAmount(row.amount) : "—",
  },
  {
    label: "Deduct Amount",
    selector: (row: WalletSummaryTransaction) =>
      row.type === "DEDUCT" ? formatWalletSummaryAmount(row.amount) : "—",
  },
  {
    label: "Updated Balance",
    selector: (row: WalletSummaryTransaction) => formatWalletSummaryAmount(row.updatedBalance),
  },
  {
    label: "Status",
    selector: (row: WalletSummaryTransaction) => row.status || "—",
  },
  {
    label: "Remarks",
    selector: (row: WalletSummaryTransaction) => row.remarks || "—",
  },
  {
    label: "Message",
    selector: (row: WalletSummaryTransaction) => row.message || "—",
  },
] as const;

export function formatWalletSummaryAmount(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "₹0.00";
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

export function normalizeWalletSummaryTransaction(
  raw: Record<string, unknown>
): WalletSummaryTransaction {
  const type = String(raw.type || "").toUpperCase() === "CREDIT" ? "CREDIT" : "DEDUCT";
  const amount = toNumber(raw.amount);
  const openingBalance = toNumber(raw.openingBalance);
  const closingBalance = toNumber(raw.closingBalance ?? raw.updatedBalance);
  const updatedBalance = toNumber(raw.updatedBalance ?? raw.closingBalance);

  return {
    id: String(raw.id || ""),
    reference: String(raw.reference || ""),
    type,
    operationType: String(raw.operationType || ""),
    action: String(raw.action || ""),
    amount,
    openingBalance,
    closingBalance,
    updatedBalance,
    status: String(raw.status || "SUCCESS"),
    remarks: raw.remarks ? String(raw.remarks) : null,
    createdAt: String(raw.createdAt || ""),
    date: raw.date ? String(raw.date) : undefined,
    time: raw.time ? String(raw.time) : undefined,
    performedBy: normalizePerformer(raw.performedBy as Record<string, unknown> | undefined),
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

  return query;
}

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
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [0, 87, 217], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`Wallet_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
}
