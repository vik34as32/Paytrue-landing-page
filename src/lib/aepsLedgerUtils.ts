import { exportToCsv, exportToExcel } from "@/src/lib/exportUtils";
import type {
  AepsLedgerListParams,
  AepsLedgerRow,
} from "@/types/aeps-ledger";

export const AEPS_LEDGER_STATUS_OPTIONS = [
  "All",
  "SUCCESS",
  "FAILED",
  "PENDING",
  "REFUNDED",
  "REVERSED",
] as const;

export const AEPS_LEDGER_SERVICE_OPTIONS = [
  "All",
  "CASH_WITHDRAWAL",
  "CASH_DEPOSIT",
  "BALANCE_ENQUIRY",
  "MINI_STATEMENT",
  "AADHAAR_PAY",
] as const;

export function formatAepsLedgerAmount(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAepsLedgerDateTime(
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

export function normalizeAepsLedgerRow(
  raw: Record<string, unknown>,
  index = 0
): AepsLedgerRow {
  const service = String(
    raw.service || raw.transactionType || raw.serviceType || ""
  );
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
  const ledgerNo = String(
    raw.ledgerNo || raw.reference || raw.referenceId || raw.id || ""
  );
  const description = String(
    raw.description || raw.remarks || raw.message || ""
  ).trim();
  const remarks = raw.remarks != null ? String(raw.remarks) : null;

  return {
    id: String(raw.id || raw.ledgerId || `aeps-${index}`),
    rowNumber: toNumber(raw.rowNumber) || index + 1,
    ledgerId: String(raw.ledgerId || raw.id || ""),
    ledgerNo,
    date: raw.date ? String(raw.date) : "",
    time: raw.time ? String(raw.time) : "",
    createdAt: String(raw.createdAt || ""),
    service,
    serviceLabel: titleCaseService(service),
    description: description || "—",
    status,
    openingBalance,
    transactionAmount,
    charge: toNumber(raw.charge),
    commission: toNumber(raw.commission),
    tds: toNumber(raw.tds),
    amountCr,
    amountDr,
    closingBalance,
    rrn: String(raw.rrn || raw.RRN || raw.bankRrn || ""),
    bank: String(raw.bank || raw.bankName || raw.bankCode || ""),
    remarks,
    transactionType: String(raw.transactionType || service),
  };
}

export function buildAepsLedgerQuery(
  params: AepsLedgerListParams = {}
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
  };

  if (params.fromDate) query.fromDate = params.fromDate;
  if (params.toDate) query.toDate = params.toDate;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "All") query.status = params.status;
  if (params.service && params.service !== "All") query.service = params.service;

  return query;
}

export const AEPS_LEDGER_EXPORT_COLUMNS = [
  {
    label: "#",
    selector: (row: AepsLedgerRow) => String(row.rowNumber || ""),
  },
  {
    label: "Date & Time",
    selector: (row: AepsLedgerRow) =>
      formatAepsLedgerDateTime(row.date, row.time, row.createdAt),
  },
  {
    label: "Ledger No",
    selector: (row: AepsLedgerRow) => row.ledgerNo || "—",
  },
  {
    label: "Service",
    selector: (row: AepsLedgerRow) => row.serviceLabel || "—",
  },
  {
    label: "Description",
    selector: (row: AepsLedgerRow) => row.description || "—",
  },
  {
    label: "Status",
    selector: (row: AepsLedgerRow) => row.status || "—",
  },
  {
    label: "Opening Balance",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.openingBalance),
  },
  {
    label: "Transaction Amount",
    selector: (row: AepsLedgerRow) =>
      formatAepsLedgerAmount(row.transactionAmount),
  },
  {
    label: "Charge",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.charge),
  },
  {
    label: "Commission",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.commission),
  },
  {
    label: "TDS",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.tds),
  },
  {
    label: "Credit (CR)",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.amountCr),
  },
  {
    label: "Debit (DR)",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.amountDr),
  },
  {
    label: "Closing Balance",
    selector: (row: AepsLedgerRow) => formatAepsLedgerAmount(row.closingBalance),
  },
  {
    label: "RRN",
    selector: (row: AepsLedgerRow) => row.rrn || "—",
  },
  {
    label: "Bank",
    selector: (row: AepsLedgerRow) => row.bank || "—",
  },
  {
    label: "Remarks",
    selector: (row: AepsLedgerRow) => row.remarks || "—",
  },
];

export function exportAepsLedgerCsv(rows: AepsLedgerRow[]) {
  exportToCsv(
    `AEPS_Wallet_Ledger_${new Date().toISOString().slice(0, 10)}.csv`,
    rows,
    AEPS_LEDGER_EXPORT_COLUMNS
  );
}

export function exportAepsLedgerExcel(rows: AepsLedgerRow[]) {
  exportToExcel(
    `AEPS_Wallet_Ledger_${new Date().toISOString().slice(0, 10)}`,
    rows,
    AEPS_LEDGER_EXPORT_COLUMNS
  );
}
