import type {
  Dmt2Beneficiary,
  Dmt2Retailer,
  Dmt2Transaction,
  Dmt2TransferMode,
  Dmt2TxnStatus,
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
  const preferredKeys = [
    "beneficiaries",
    "beneficiaryList",
    "items",
    "rows",
    "results",
    "list",
    "records",
    "content",
    "data",
  ];

  for (const key of preferredKeys) {
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value?: string): boolean {
  return Boolean(value && UUID_RE.test(value.trim()));
}

export function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

export function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
}

export function pickApiMessage(payload: unknown, fallback: string): string {
  const data = unwrapRecord(payload);
  return pickString(data.message, data.error, fallback);
}

export function dmt2ApiMessage(error: unknown, fallback: string): string {
  const err = error as {
    message?: string;
    data?: { message?: string; error?: string };
  };
  return (
    err?.data?.message ||
    err?.data?.error ||
    err?.message ||
    fallback
  );
}

function isVerifiedFlag(data: Record<string, unknown>): boolean {
  const status = pickString(data.status, data.kycStatus, data.otpStatus).toUpperCase();
  if (["PENDING", "PENDING_OTP", "UNVERIFIED", "OTP_PENDING"].includes(status)) {
    return false;
  }
  if (data.verified === false || data.otpVerified === false || data.isVerified === false) {
    return false;
  }
  return Boolean(
    data.verified ||
      data.otpVerified ||
      data.isVerified ||
      data.isOtpVerified ||
      status === "VERIFIED" ||
      status === "ACTIVE"
  );
}

export function normalizeRemitter(
  payload: unknown,
  fallbackMobile = ""
): Dmt2Retailer {
  const data = unwrapRecord(payload);
  const mobile = pickString(data.mobile, data.remitterMobile, fallbackMobile);
  return {
    mobile,
    fullName: pickString(data.name, data.fullName, data.remitterName),
    gender: "",
    otpVerified: isVerifiedFlag(data),
    registered: true,
    remitterId: pickString(data.id, data.remitterId) || undefined,
  };
}

export function normalizeBeneficiary(
  payload: unknown,
  retailerMobile = ""
): Dmt2Beneficiary {
  const data = unwrapRecord(payload);
  const nested = unwrapRecord(
    data.beneficiary ?? data.account ?? data.details ?? data
  );
  const row = { ...data, ...nested };
  return {
    id: pickString(row.id, row.beneficiaryId, row.uuid),
    retailerMobile: pickString(
      row.remitterMobile,
      row.senderMobile,
      retailerMobile
    ),
    remitterId: pickString(row.remitterId) || undefined,
    name: pickString(
      row.name,
      row.beneficiaryName,
      row.accountHolderName,
      row.customerName,
      row.fullName
    ),
    accountNumber: pickString(
      row.accountNumber,
      row.account_number,
      row.account,
      row.accNo,
      row.bankAccount
    ),
    accountMasked: pickString(row.accountMasked, row.account_masked),
    ifsc: pickString(
      row.ifscCode,
      row.ifsc,
      row.bankIfsc,
      row.ifsc_code
    ).toUpperCase(),
    bankName:
      pickString(
        row.bankName,
        row.bank_name,
        typeof row.bank === "string" ? row.bank : undefined
      ) || undefined,
    accountType: pickString(row.accountType, row.account_type) || undefined,
    mobile: pickString(
      row.beneficiaryMobile,
      row.mobile,
      row.phone,
      row.mobileNumber
    ),
    verified: Boolean(row.verified || row.isVerified),
    createdAt: pickString(row.createdAt, row.created_at, new Date().toISOString()),
  };
}

const MODE_MAP: Record<string, Dmt2TransferMode> = {
  IMPS: "IMPS",
  NEFT: "NEFT",
  RTGS: "RTGS",
};

const STATUS_MAP: Record<string, Dmt2TxnStatus> = {
  SUCCESS: "SUCCESS",
  SUCCESSFUL: "SUCCESS",
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

/** Statuses after which status polling must stop. */
export const DMT2_TERMINAL_STATUSES: readonly Dmt2TxnStatus[] = [
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "REVERSED",
];

function pickOptionalString(...values: unknown[]): string | undefined {
  return pickString(...values) || undefined;
}

export function isMaskedAccount(value?: string): boolean {
  return /[xX*•]/.test(String(value || ""));
}

/** Prefer a full account number; status / receipt APIs only return a masked one. */
function pickAccountNumber(...values: unknown[]): string {
  const candidates = values
    .map((value) => (value == null ? "" : String(value).trim()))
    .filter(Boolean);
  return candidates.find((value) => !isMaskedAccount(value)) || candidates[0] || "";
}

function pickOptionalNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (value == null || value === "") continue;
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

export function normalizeTransaction(
  payload: unknown,
  fallback?: Partial<Dmt2Transaction>
): Dmt2Transaction {
  const root = unwrapRecord(payload);
  const data = {
    ...root,
    ...asRecord(root.transaction),
    ...asRecord(root.receipt),
  };
  const modeKey = pickString(
    data.transferMode,
    data.serviceType,
    data.mode,
    fallback?.mode
  ).toUpperCase();
  const statusKey = pickString(
    data.finalStatus,
    data.status,
    data.txnStatus,
    fallback?.status
  ).toUpperCase();
  const reference = pickString(
    data.reference,
    data.txnReference,
    data.transactionId,
    data.txnId,
    data.id,
    fallback?.id
  );

  return {
    id: reference,
    customerName: pickString(
      data.customerName,
      data.beneficiaryName,
      data.name,
      fallback?.customerName
    ),
    accountNumber: pickAccountNumber(
      data.accountNumber,
      data.account,
      fallback?.accountNumber,
      data.accountMasked
    ),
    ifsc: pickString(data.ifscCode, data.ifsc, fallback?.ifsc).toUpperCase(),
    customerMobile: pickString(
      data.customerMobile,
      data.mobile,
      fallback?.customerMobile
    ),
    amount: pickNumber(data.amount, fallback?.amount),
    mode: MODE_MAP[modeKey] ?? fallback?.mode ?? "IMPS",
    purpose: pickString(data.remarks, data.purpose, fallback?.purpose),
    referenceId: pickString(data.orderId, data.referenceId, fallback?.referenceId),
    status: STATUS_MAP[statusKey] ?? fallback?.status ?? "PROCESSING",
    createdAt: pickString(
      data.createdAt,
      data.created_at,
      data.txnDate,
      fallback?.createdAt,
      new Date().toISOString()
    ),
    updatedAt: pickOptionalString(
      data.completedAt,
      data.updatedAt,
      data.updated_at,
      data.timestamp,
      fallback?.updatedAt
    ),
    apiTxnId: pickOptionalString(
      data.apiTxnId,
      data.apiTransactionId,
      data.providerTxnId,
      data.providerTransactionId,
      data.ipayId,
      fallback?.apiTxnId
    ),
    externalRef: pickOptionalString(
      data.externalRef,
      data.externalReference,
      data.clientRefId,
      fallback?.externalRef
    ),
    bankRef: pickOptionalString(
      data.bankRefNum,
      data.bankRefNo,
      data.bankReference,
      data.bankReferenceNumber,
      data.utr,
      data.utrNumber,
      data.rrn,
      fallback?.bankRef
    ),
    charges: pickOptionalNumber(data.charges, data.charge, data.serviceCharge, data.fee, fallback?.charges),
    gst: pickOptionalNumber(data.gst, data.gstAmount, data.tax, data.taxAmount, fallback?.gst),
    totalDebit: pickOptionalNumber(
      data.totalDebited,
      data.totalDebit,
      data.totalAmount,
      data.debitAmount,
      data.netDebit,
      fallback?.totalDebit
    ),
    providerMessage: pickOptionalString(
      data.providerMessage,
      data.statusMessage,
      data.responseMessage,
      data.providerResponse,
      fallback?.providerMessage
    ),
    failureReason: pickOptionalString(
      data.failureReason,
      data.reason,
      data.errorMessage,
      fallback?.failureReason
    ),
  };
}

/** Overlay a fresher (status / receipt) snapshot without wiping known fields with empty defaults. */
export function mergeDmt2Transaction(
  base: Dmt2Transaction,
  update: Dmt2Transaction
): Dmt2Transaction {
  const merged: Dmt2Transaction = { ...base };
  (Object.keys(update) as Array<keyof Dmt2Transaction>).forEach((key) => {
    const value = update[key];
    if (value == null || value === "" || (key === "amount" && value === 0)) return;
    if (
      key === "accountNumber" &&
      base.accountNumber &&
      !isMaskedAccount(base.accountNumber) &&
      isMaskedAccount(String(value))
    ) {
      return;
    }
    (merged as unknown as Record<string, unknown>)[key] = value;
  });
  merged.status = update.status;
  merged.createdAt = base.createdAt || update.createdAt;
  return merged;
}
