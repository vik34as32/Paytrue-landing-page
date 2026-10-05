import type { UpiPayoutPreview, UpiPayoutStatus, UpiPayoutTransaction } from "../types";

export const UPI_PAYOUT_MIN_AMOUNT = 1;
export const UPI_PAYOUT_MAX_AMOUNT = 100000;
export const UPI_PAYOUT_REMARKS_MAX = 10;
export const UPI_PAYOUT_DEFAULT_REMARKS = "UPIPAY";

/** Mirrors backend `upiPayoutSchema` validation so bad input never reaches the API. */
const VPA_PATTERN = /^[a-z0-9._-]{2,256}@[a-z]{2,64}$/;
const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidVpa(value: string): boolean {
  return VPA_PATTERN.test(value.trim().toLowerCase());
}

export function normalizeVpaInput(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function isValidPayeeMobile(value: string): boolean {
  return MOBILE_PATTERN.test(value.trim());
}

export function isValidPayeeEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function sanitizeRemarks(value: string): string {
  return value.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, UPI_PAYOUT_REMARKS_MAX);
}

export interface UpiAppInfo {
  id: string;
  name: string;
  tone: string;
}

const UPI_HANDLES: Record<string, UpiAppInfo> = {
  ybl: { id: "phonepe", name: "PhonePe", tone: "from-violet-500 to-purple-700" },
  ibl: { id: "phonepe", name: "PhonePe", tone: "from-violet-500 to-purple-700" },
  axl: { id: "phonepe", name: "PhonePe", tone: "from-violet-500 to-purple-700" },
  okaxis: { id: "gpay", name: "Google Pay", tone: "from-sky-500 to-blue-700" },
  okhdfcbank: { id: "gpay", name: "Google Pay", tone: "from-sky-500 to-blue-700" },
  okicici: { id: "gpay", name: "Google Pay", tone: "from-sky-500 to-blue-700" },
  oksbi: { id: "gpay", name: "Google Pay", tone: "from-sky-500 to-blue-700" },
  paytm: { id: "paytm", name: "Paytm", tone: "from-cyan-500 to-sky-700" },
  ptyes: { id: "paytm", name: "Paytm", tone: "from-cyan-500 to-sky-700" },
  ptaxis: { id: "paytm", name: "Paytm", tone: "from-cyan-500 to-sky-700" },
  pthdfc: { id: "paytm", name: "Paytm", tone: "from-cyan-500 to-sky-700" },
  ptsbi: { id: "paytm", name: "Paytm", tone: "from-cyan-500 to-sky-700" },
  upi: { id: "bhim", name: "BHIM UPI", tone: "from-orange-500 to-emerald-600" },
  apl: { id: "amazonpay", name: "Amazon Pay", tone: "from-amber-400 to-orange-600" },
  yapl: { id: "amazonpay", name: "Amazon Pay", tone: "from-amber-400 to-orange-600" },
  rapl: { id: "amazonpay", name: "Amazon Pay", tone: "from-amber-400 to-orange-600" },
  freecharge: { id: "freecharge", name: "Freecharge", tone: "from-orange-400 to-rose-600" },
  jupiteraxis: { id: "jupiter", name: "Jupiter", tone: "from-orange-400 to-amber-600" },
  fam: { id: "fampay", name: "FamPay", tone: "from-yellow-400 to-amber-600" },
  sbi: { id: "sbi", name: "SBI", tone: "from-blue-500 to-indigo-700" },
  hdfcbank: { id: "hdfc", name: "HDFC Bank", tone: "from-blue-600 to-blue-900" },
  icici: { id: "icici", name: "ICICI Bank", tone: "from-orange-500 to-red-700" },
  axisbank: { id: "axis", name: "Axis Bank", tone: "from-rose-600 to-fuchsia-800" },
  kotak: { id: "kotak", name: "Kotak", tone: "from-red-500 to-red-700" },
};

export function detectUpiApp(vpa: string): UpiAppInfo | null {
  const handle = vpa.split("@")[1]?.trim().toLowerCase();
  if (!handle) return null;
  return (
    UPI_HANDLES[handle] ?? {
      id: "bank",
      name: `@${handle}`,
      tone: "from-slate-500 to-slate-700",
    }
  );
}

export function maskVpa(vpa: string): string {
  const [user, handle] = vpa.split("@");
  if (!user || !handle) return vpa;
  if (user.length <= 3) return `${user[0]}••@${handle}`;
  return `${user.slice(0, 2)}${"•".repeat(Math.min(6, user.length - 3))}${user.slice(-1)}@${handle}`;
}

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

export function unwrapList(payload: unknown, depth = 0): unknown[] {
  if (depth > 8 || payload == null) return [];
  if (Array.isArray(payload)) return payload.filter((row) => row && typeof row === "object");
  if (typeof payload !== "object") return [];
  const rec = payload as Record<string, unknown>;
  for (const key of ["transactions", "items", "rows", "results", "list", "data"]) {
    if (!(key in rec)) continue;
    const found = unwrapList(rec[key], depth + 1);
    if (found.length) return found;
    if (Array.isArray(rec[key])) return [];
  }
  return [];
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null || typeof value === "object") continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function pickOptionalNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (value == null || value === "") continue;
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number {
  return pickOptionalNumber(...values) ?? 0;
}

export function upiPayoutApiMessage(error: unknown, fallback: string): string {
  const err = error as {
    message?: string;
    data?: { message?: string; error?: string; errors?: { message?: string }[] };
  };
  return (
    err?.data?.errors?.[0]?.message ||
    err?.data?.message ||
    err?.data?.error ||
    err?.message ||
    fallback
  );
}

const STATUS_MAP: Record<string, UpiPayoutStatus> = {
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

export const UPI_PAYOUT_TERMINAL_STATUSES: readonly UpiPayoutStatus[] = [
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "REVERSED",
];

/** POST /upi/payout/commission/preview → settlement + `wallet` + `summary`. */
export function normalizeUpiPayoutPreview(payload: unknown, amount: number): UpiPayoutPreview {
  const root = unwrapRecord(payload);
  const wallet = asRecord(root.wallet);
  const summary = asRecord(root.summary);
  const baseAmount = pickNumber(root.transferAmount, wallet.transferAmount, root.amount, amount);
  const charges = pickNumber(root.charges, wallet.charges, summary.serviceCharge);
  const gst = pickNumber(root.tax, wallet.tax, root.gst);
  return {
    amount: baseAmount,
    charges,
    gst,
    commission: pickNumber(root.commissionAmount, wallet.commissionAmount, summary.expectedRetailerCommission),
    totalDebit:
      pickOptionalNumber(
        root.debitAmount,
        wallet.totalDeducted,
        summary.totalWalletDebit,
        root.totalDebit
      ) ?? baseAmount + charges + gst,
    sufficient: typeof root.sufficient === "boolean" ? root.sufficient : undefined,
    availableBalance: pickOptionalNumber(root.availableBalance),
  };
}

export function normalizeUpiPayoutTxn(
  payload: unknown,
  fallback?: Partial<UpiPayoutTransaction>
): UpiPayoutTransaction {
  const data = unwrapRecord(payload);
  const wallet = asRecord(data.wallet);
  const statusKey = pickString(data.status, fallback?.status).toUpperCase();
  const reference = pickString(
    data.reference,
    data.apiTxnId,
    data.transactionId,
    fallback?.reference,
    fallback?.id
  );

  return {
    id: reference,
    reference,
    vpa: pickString(data.vpa, data.vpaMasked, data.upiId, fallback?.vpa),
    payeeName: pickString(data.payeeName, data.recipient_name, fallback?.payeeName),
    payeeMobile: pickString(data.payeeMobile, fallback?.payeeMobile) || undefined,
    payeeEmail: pickString(data.payeeEmail, fallback?.payeeEmail) || undefined,
    remarks: pickString(data.remarks, fallback?.remarks) || undefined,
    amount: pickNumber(data.amount, wallet.transferAmount, fallback?.amount),
    status: STATUS_MAP[statusKey] ?? fallback?.status ?? "PROCESSING",
    createdAt: pickString(
      data.createdAt,
      data.timestamp,
      fallback?.createdAt,
      new Date().toISOString()
    ),
    completedAt: pickString(data.completedAt, fallback?.completedAt) || undefined,
    message:
      pickString(data.providerMessage, data.message, fallback?.message) || undefined,
    failureReason: pickString(data.failureReason, fallback?.failureReason) || undefined,
    errorCode: pickString(data.errorCode, fallback?.errorCode) || undefined,
    utr:
      pickString(data.bankRefNum, data.bankRef, data.bankReference, fallback?.utr) || undefined,
    externalRef: pickString(data.externalRef, fallback?.externalRef) || undefined,
    charges: pickOptionalNumber(data.charges, wallet.charges, fallback?.charges),
    gst: pickOptionalNumber(data.tax, wallet.tax, fallback?.gst),
    commission: pickOptionalNumber(data.commissionAmount, wallet.commissionAmount, fallback?.commission),
    totalDebit: pickOptionalNumber(
      data.totalDebited,
      wallet.totalDeducted,
      fallback?.totalDebit
    ),
    closingBalance: pickOptionalNumber(data.closingBalance, fallback?.closingBalance),
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
