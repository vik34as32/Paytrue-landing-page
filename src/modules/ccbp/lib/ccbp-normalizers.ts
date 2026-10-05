import type {
  CcbpCommissionPreview,
  CcbpPaymentType,
  CcbpStatus,
  CcbpTransaction,
} from "../types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function unwrapRecord(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  if (Object.keys(data).length) return { ...root, ...data };
  return root;
}

export function unwrapList(payload: unknown): unknown[] {
  return extractObjectArray(payload);
}

function extractObjectArray(value: unknown, depth = 0): unknown[] {
  if (depth > 8 || value == null) return [];
  if (Array.isArray(value)) {
    return value.filter((row) => row && typeof row === "object");
  }
  if (typeof value !== "object") return [];
  const rec = value as Record<string, unknown>;
  for (const key of ["transactions", "items", "rows", "results", "list", "data"]) {
    if (!(key in rec)) continue;
    const found = extractObjectArray(rec[key], depth + 1);
    if (found.length) return found;
    if (Array.isArray(rec[key])) return [];
  }
  const numericKeys = Object.keys(rec)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (numericKeys.length) {
    return numericKeys
      .map((key) => rec[key])
      .filter((row) => row && typeof row === "object");
  }
  return [];
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function pickNumber(...values: unknown[]): number {
  return pickOptionalNumber(...values) ?? 0;
}

function pickOptionalNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (value == null || value === "") continue;
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

export function ccbpApiMessage(error: unknown, fallback: string): string {
  const err = error as { message?: string; data?: { message?: string; error?: string } };
  return err?.data?.message || err?.data?.error || err?.message || fallback;
}

const STATUS_MAP: Record<string, CcbpStatus> = {
  SUCCESS: "SUCCESS",
  SUCCESSFUL: "SUCCESS",
  COMPLETED: "SUCCESS",
  PROCESSING: "PROCESSING",
  IN_PROGRESS: "PROCESSING",
  INITIATED: "PROCESSING",
  SUBMITTED: "PROCESSING",
  ACCEPTED: "PROCESSING",
  PENDING: "PENDING",
  FAILED: "FAILED",
  FAILURE: "FAILED",
  REJECTED: "FAILED",
  DECLINED: "FAILED",
  REFUNDED: "REFUNDED",
  REVERSED: "REVERSED",
};

export const CCBP_TERMINAL_STATUSES: readonly CcbpStatus[] = [
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "REVERSED",
];

const MODE_MAP: Record<string, CcbpPaymentType> = {
  IMPS: "IMPS",
  NEFT: "NEFT",
  RTGS: "RTGS",
};

export function maskCard(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return value;
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export { detectCardNetwork } from "./ccbp-bin";

export function formatCardInput(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();
}

export function normalizeCcbpTxn(
  payload: unknown,
  fallback?: Partial<CcbpTransaction>
): CcbpTransaction {
  const root = unwrapRecord(payload);
  const data = {
    ...root,
    ...asRecord(root.transaction),
    ...asRecord(root.receipt),
  };
  const statusKey = pickString(data.status, fallback?.status).toUpperCase();
  const modeKey = pickString(data.paymentType, data.mode, fallback?.paymentType).toUpperCase();
  const reference = pickString(
    data.reference,
    data.txnReference,
    data.transactionId,
    data.txnId,
    data.id,
    fallback?.reference,
    fallback?.id
  );
  const card = pickString(
    data.creditCardNumber,
    data.cardNumber,
    data.accountMasked,
    fallback?.creditCardNumber
  );

  return {
    id: reference,
    reference,
    payeeName: pickString(data.payeeName, data.name, fallback?.payeeName),
    payeeMobile: pickString(data.payeeMobile, data.mobile, fallback?.payeeMobile),
    payeeEmail: pickString(data.payeeEmail, data.email, fallback?.payeeEmail),
    creditCardNumber: card,
    ifscCode: pickString(data.ifscCode, data.ifsc, fallback?.ifscCode).toUpperCase(),
    amount: pickNumber(data.amount, fallback?.amount),
    paymentType: MODE_MAP[modeKey] ?? fallback?.paymentType ?? "IMPS",
    remarks: pickString(data.remarks, fallback?.remarks),
    status: STATUS_MAP[statusKey] ?? fallback?.status ?? "PROCESSING",
    createdAt: pickString(
      data.createdAt,
      data.created_at,
      data.txnDate,
      fallback?.createdAt,
      new Date().toISOString()
    ),
    message:
      pickString(
        data.providerMessage,
        data.statusMessage,
        data.message,
        fallback?.message
      ) || undefined,
    charges: pickOptionalNumber(data.charges, data.charge, data.fees, fallback?.charges),
    gst: pickOptionalNumber(data.gst, data.gstAmount, data.tax, fallback?.gst),
    totalDebit: pickOptionalNumber(
      data.totalDebit,
      data.totalAmount,
      data.debitAmount,
      fallback?.totalDebit
    ),
    bankRef:
      pickString(
        data.bankRef,
        data.bankRefNo,
        data.bankReference,
        data.utr,
        data.utrNumber,
        data.rrn,
        fallback?.bankRef
      ) || undefined,
    failureReason:
      pickString(data.failureReason, data.reason, data.errorMessage, fallback?.failureReason) ||
      undefined,
  };
}

export function normalizeCcbpPreview(payload: unknown, amount: number): CcbpCommissionPreview {
  const root = unwrapRecord(payload);
  const preview = { ...root, ...asRecord(root.preview), ...asRecord(root.commission) };
  const baseAmount = pickNumber(preview.amount, preview.transferAmount, amount);
  const charges = pickNumber(preview.charges, preview.charge, preview.fees, preview.serviceCharge);
  const gst = pickNumber(preview.gst, preview.gstAmount, preview.tax);
  return {
    amount: baseAmount,
    charges,
    gst,
    commission: pickNumber(
      preview.commission,
      preview.commissionAmount,
      preview.retailerCommission
    ),
    totalDebit:
      pickOptionalNumber(preview.totalDebit, preview.totalAmount, preview.debitAmount) ??
      baseAmount + charges + gst,
  };
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
