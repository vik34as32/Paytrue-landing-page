import type {
  UpiPayoutPreview,
  UpiPayoutStatus,
  UpiPayoutTransaction,
  UpiVpaVerification,
} from "../types";

export const UPI_PAYOUT_MIN_AMOUNT = 1;
export const UPI_PAYOUT_MAX_AMOUNT = 100000;
export const UPI_PAYOUT_REMARKS = "UPI Payout";

const VPA_PATTERN = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,64}$/;

export function isValidVpa(value: string): boolean {
  return VPA_PATTERN.test(value.trim());
}

export function normalizeVpaInput(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
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

export function normalizeVpaVerification(payload: unknown, vpa: string): UpiVpaVerification {
  const root = unwrapRecord(payload);
  const data = { ...root, ...asRecord(root.beneficiary), ...asRecord(root.result) };
  const name = pickString(
    data.name,
    data.payeeName,
    data.beneficiaryName,
    data.accountHolderName,
    data.customerName,
    data.nameAtBank
  );
  const flag = data.verified ?? data.isValid ?? data.valid;
  const statusText = pickString(data.status, data.verificationStatus).toUpperCase();
  const verified =
    flag === true ||
    ["SUCCESS", "VERIFIED", "VALID", "ACTIVE"].includes(statusText) ||
    (flag == null && Boolean(name));
  return {
    vpa: pickString(data.vpa, data.upiId, vpa),
    name,
    verified,
    message: pickString(data.message) || undefined,
  };
}

export function normalizeUpiPayoutPreview(payload: unknown, amount: number): UpiPayoutPreview {
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

export function normalizeUpiPayoutTxn(
  payload: unknown,
  fallback?: Partial<UpiPayoutTransaction>
): UpiPayoutTransaction {
  const root = unwrapRecord(payload);
  const data = { ...root, ...asRecord(root.transaction), ...asRecord(root.receipt) };
  const statusKey = pickString(data.status, data.txnStatus, fallback?.status).toUpperCase();
  const reference = pickString(
    data.reference,
    data.txnReference,
    data.transactionId,
    data.txnId,
    data.id,
    fallback?.reference,
    fallback?.id
  );

  return {
    id: reference,
    reference,
    vpa: pickString(data.vpa, data.upiId, data.payeeVpa, fallback?.vpa),
    payeeName: pickString(data.payeeName, data.beneficiaryName, data.name, fallback?.payeeName),
    payeeMobile:
      pickString(data.payeeMobile, data.mobile, fallback?.payeeMobile) || undefined,
    amount: pickNumber(data.amount, fallback?.amount),
    status: STATUS_MAP[statusKey] ?? fallback?.status ?? "PROCESSING",
    createdAt: pickString(
      data.createdAt,
      data.created_at,
      data.txnDate,
      fallback?.createdAt,
      new Date().toISOString()
    ),
    message:
      pickString(data.providerMessage, data.statusMessage, data.message, fallback?.message) ||
      undefined,
    failureReason:
      pickString(data.failureReason, data.reason, data.errorMessage, fallback?.failureReason) ||
      undefined,
    utr:
      pickString(data.utr, data.utrNumber, data.rrn, data.bankRef, data.bankRefNo, fallback?.utr) ||
      undefined,
    charges: pickOptionalNumber(data.charges, data.charge, data.fees, fallback?.charges),
    gst: pickOptionalNumber(data.gst, data.gstAmount, data.tax, fallback?.gst),
    totalDebit: pickOptionalNumber(
      data.totalDebit,
      data.totalAmount,
      data.debitAmount,
      fallback?.totalDebit
    ),
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
