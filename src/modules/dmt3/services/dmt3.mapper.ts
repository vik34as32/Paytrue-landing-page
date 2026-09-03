import type {
  Dmt3Beneficiary,
  Dmt3CommissionPreview,
  Dmt3PaginationMeta,
  Dmt3Remitter,
  Dmt3Transaction,
  Dmt3TransferMode,
  Dmt3TxnStatus,
  Dmt3VerificationStatus,
} from "../types/dmt3.types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value?: string): boolean {
  return Boolean(value && UUID_RE.test(value.trim()));
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

function numericObjectValues(rec: Record<string, unknown>): unknown[] {
  const numericKeys = Object.keys(rec)
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));
  if (!numericKeys.length) return [];
  return numericKeys
    .map((key) => rec[key])
    .filter((row) => row && typeof row === "object" && !Array.isArray(row));
}

function looksLikeBeneficiaryRow(value: unknown): boolean {
  const rec = asRecord(value);
  return Boolean(
    pickString(rec.id, rec.beneficiaryId) &&
      pickString(rec.name, rec.beneficiaryName, rec.accountHolderName) &&
      pickString(rec.accountNumber, rec.account_number, rec.ifscCode, rec.ifsc)
  );
}

function extractObjectArray(value: unknown, depth = 0): unknown[] {
  if (depth > 8 || value == null) return [];
  if (Array.isArray(value)) {
    return value.filter((row) => row && typeof row === "object");
  }
  if (typeof value !== "object") return [];

  const rec = value as Record<string, unknown>;
  const fromNumeric = numericObjectValues(rec);
  if (fromNumeric.length) return fromNumeric;

  const preferredKeys = [
    "beneficiaries",
    "beneficiaryList",
    "items",
    "rows",
    "results",
    "list",
    "records",
    "transactions",
    "content",
    "data",
  ];

  for (const key of preferredKeys) {
    if (!(key in rec)) continue;
    const found = extractObjectArray(rec[key], depth + 1);
    if (found.length) return found;
    if (Array.isArray(rec[key])) return [];
  }

  if (looksLikeBeneficiaryRow(rec)) return [rec];

  return [];
}

export function unwrapList(payload: unknown): unknown[] {
  const root = asRecord(payload);
  const fromData = extractObjectArray(root.data ?? payload);
  if (fromData.length) return fromData;
  const fromRoot = extractObjectArray(root);
  if (fromRoot.length) return fromRoot;
  return extractObjectArray(payload);
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

export function pickBoolean(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (value === "true" || value === 1) return true;
    if (value === "false" || value === 0) return false;
  }
  return false;
}

export function pickApiMessage(payload: unknown, fallback: string): string {
  const data = unwrapRecord(payload);
  return pickString(data.message, data.error, data.msg, fallback);
}

export function dmt3ApiMessage(error: unknown, fallback: string): string {
  const err = error as {
    message?: string;
    data?: { message?: string; error?: string };
    response?: { data?: { message?: string; error?: string }; status?: number };
    status?: number;
  };
  const status = err?.response?.status ?? err?.status;
  const msg =
    err?.data?.message ||
    err?.data?.error ||
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback;
  return status ? `${msg} (Error ${status})` : msg;
}

const STATUS_MAP: Record<string, Dmt3TxnStatus> = {
  SUCCESS: "SUCCESS",
  SUCCESSFUL: "SUCCESS",
  COMPLETED: "SUCCESS",
  PROCESSING: "PROCESSING",
  PENDING: "PENDING",
  FAILED: "FAILED",
  FAILURE: "FAILED",
  REFUNDED: "REFUNDED",
  REVERSED: "REVERSED",
};

const VERIFY_MAP: Record<string, Dmt3VerificationStatus> = {
  VERIFIED: "VERIFIED",
  PENDING: "PENDING",
  UNVERIFIED: "UNVERIFIED",
  FAILED: "FAILED",
};

export function normalizeRemitter(
  payload: unknown,
  fallbackMobile = ""
): Dmt3Remitter {
  const data = unwrapRecord(payload);
  const nested = unwrapRecord(data.remitter ?? data);
  const row = { ...data, ...nested };
  const status = pickString(row.status, row.kycStatus, row.otpStatus).toUpperCase();
  const pending = ["PENDING", "PENDING_OTP", "UNVERIFIED", "OTP_PENDING"].includes(
    status
  );
  const otpVerified =
    !pending &&
    (pickBoolean(row.verified, row.otpVerified, row.isVerified, row.isOtpVerified) ||
      status === "VERIFIED" ||
      status === "ACTIVE");

  return {
    mobile: pickString(row.mobile, row.remitterMobile, fallbackMobile),
    fullName: pickString(row.name, row.fullName, row.remitterName),
    email: pickString(row.email),
    otpVerified,
    registered: true,
    remitterId: pickString(row.id, row.remitterId) || undefined,
  };
}

export function normalizeVerificationStatus(
  payload: unknown
): Dmt3VerificationStatus {
  const data = unwrapRecord(payload);
  const key = pickString(
    data.verificationStatus,
    data.verifyStatus,
    data.status
  ).toUpperCase();
  if (pickBoolean(data.verified, data.isVerified)) return "VERIFIED";
  return VERIFY_MAP[key] ?? "PENDING";
}

export function normalizeBeneficiary(payload: unknown): Dmt3Beneficiary {
  const data = unwrapRecord(payload);
  const nested = unwrapRecord(data.beneficiary ?? data.account ?? data);
  const row = { ...data, ...nested };
  const accountNumber = pickString(
    row.accountNumber,
    row.account_number,
    row.account,
    row.bankAccount
  );

  const verificationStatus = normalizeVerificationStatus(row);
  const isVerified =
    verificationStatus === "VERIFIED" ||
    pickBoolean(row.isVerified, row.verified);

  return {
    id: pickString(row.id, row.beneficiaryId, row.uuid),
    remitterId: pickString(row.remitterId) || undefined,
    name: pickString(
      row.name,
      row.beneficiaryName,
      row.accountHolderName,
      row.fullName
    ),
    bankName: pickString(row.bankName, row.bank, row.bank_name),
    accountNumber,
    accountMasked: pickString(
      row.accountMasked,
      row.maskedAccountNumber,
      row.account_masked
    ),
    ifsc: pickString(row.ifscCode, row.ifsc, row.ifsc_code).toUpperCase(),
    accountType: pickString(row.accountType, row.account_type) || undefined,
    mobile: pickString(row.mobile, row.mobileNumber, row.phone),
    email: pickString(row.email) || undefined,
    isVerified,
    verificationStatus: isVerified ? "VERIFIED" : verificationStatus,
    verifiedAt: pickString(row.verifiedAt, row.verified_at) || undefined,
    createdAt: pickString(row.createdAt, row.created_at),
  };
}

export function normalizeCommissionPreview(
  payload: unknown
): Dmt3CommissionPreview {
  const data = unwrapRecord(payload);
  const preview = unwrapRecord(data.preview ?? data.commission ?? data);

  return {
    transferAmount: pickNumber(
      preview.transferAmount,
      preview.amount,
      data.amount
    ),
    charges: pickNumber(preview.charges, preview.charge, preview.fees),
    commission: pickNumber(
      preview.commission,
      preview.commissionAmount,
      preview.retailerCommission
    ),
    totalDebit: pickNumber(
      preview.totalDebit,
      preview.totalAmount,
      preview.debitAmount
    ),
    availableBalance: pickNumber(
      preview.availableBalance,
      preview.walletBalance,
      preview.balance
    ),
    balanceAfterTransfer: pickNumber(
      preview.balanceAfterTransfer,
      preview.balanceAfter,
      preview.remainingBalance
    ),
    transferMode: (pickString(
      preview.transferMode,
      preview.mode,
      "IMPS"
    ).toUpperCase() || "IMPS") as Dmt3TransferMode,
    currency: pickString(preview.currency, "INR") || "INR",
  };
}

export function normalizeTransaction(payload: unknown): Dmt3Transaction {
  const data = unwrapRecord(payload);
  const txn = unwrapRecord(data.transaction ?? data.txn ?? data);
  const row = { ...data, ...txn };
  const wallet = unwrapRecord(row.wallet ?? data.wallet);
  const nestedBeneficiary = row.beneficiary
    ? normalizeBeneficiary(row.beneficiary)
    : undefined;
  const remitterRec = unwrapRecord(row.remitter);
  const statusKey = pickString(row.status, row.txnStatus, row.apiOutcome).toUpperCase();
  const accountNumber =
    nestedBeneficiary?.accountNumber ||
    pickString(row.accountNumber, row.beneficiaryAccount);
  const ifscCode = (
    nestedBeneficiary?.ifsc ||
    pickString(row.ifscCode, row.ifsc)
  ).toUpperCase();
  const bankName =
    nestedBeneficiary?.bankName ||
    pickString(row.bankName, row.bank);
  const payeeName =
    pickString(row.payeeName, nestedBeneficiary?.name, row.beneficiaryName) ||
    nestedBeneficiary?.name;
  const payerName = pickString(
    row.payerName,
    remitterRec.name,
    remitterRec.fullName
  );

  return {
    id: pickString(
      row.id,
      row.transactionId,
      row.txnId,
      row.clientTxnId,
      row.referenceId
    ),
    clientTxnId: pickString(row.clientTxnId, row.client_txn_id) || undefined,
    reference: pickString(row.reference, row.referenceId) || undefined,
    beneficiaryId:
      pickString(row.beneficiaryId, nestedBeneficiary?.id) || undefined,
    beneficiaryName: payeeName || "",
    amount: pickNumber(row.amount, row.transferAmount, wallet.transferAmount, wallet.amount),
    charges: pickNumber(
      row.charges,
      row.charge,
      wallet.charges,
      wallet.charge
    ),
    commission: pickNumber(
      row.commissionAmount,
      row.commission,
      wallet.commissionAmount,
      wallet.commission
    ),
    totalDebit: pickNumber(
      row.totalDebited,
      row.totalDebit,
      wallet.totalDeducted,
      wallet.debitAmount
    ),
    status: STATUS_MAP[statusKey] ?? "PENDING",
    utr: pickString(row.utr, row.UTR, row.bankRef, row.rrn) || undefined,
    bankRef: pickString(row.bankRef, row.utr, row.providerTxnId) || undefined,
    transferMode: (pickString(row.transferMode, row.mode, "IMPS").toUpperCase() ||
      "IMPS") as Dmt3TransferMode,
    remarks: pickString(row.remarks, row.remark, row.purpose) || undefined,
    createdAt: pickString(
      row.finalizedAt,
      row.createdAt,
      row.created_at,
      row.txnDate,
      new Date().toISOString()
    ),
    updatedAt: pickString(row.updatedAt, row.updated_at) || undefined,
    failureReason: pickString(row.failureReason, row.reason) || undefined,
    bankName: bankName || undefined,
    ifscCode: ifscCode || undefined,
    accountNumber: accountNumber || undefined,
    payerName: payerName || undefined,
    payeeName: payeeName || undefined,
    openingBalance: pickNumber(
      row.openingBalance,
      wallet.openingBalance
    ),
    closingBalance: pickNumber(
      row.closingBalance,
      wallet.closingBalance
    ),
    beneficiary: nestedBeneficiary,
    remitter: remitterRec.name || remitterRec.mobile
      ? {
          name: pickString(remitterRec.name) || undefined,
          mobile: pickString(remitterRec.mobile) || undefined,
          email: pickString(remitterRec.email) || undefined,
        }
      : undefined,
  };
}

export function normalizePagination(payload: unknown): Dmt3PaginationMeta {
  const data = unwrapRecord(payload);
  const meta = unwrapRecord(data.pagination ?? data.meta ?? data.pageInfo ?? data);

  return {
    page: pickNumber(meta.page, meta.currentPage, 1) || 1,
    limit: pickNumber(meta.limit, meta.pageSize, 20) || 20,
    total: pickNumber(meta.total, meta.totalCount, meta.count),
    totalPages: pickNumber(meta.totalPages, meta.pages),
  };
}

export function normalizeTransactionListResponse(payload: unknown): {
  items: Dmt3Transaction[];
  pagination: Dmt3PaginationMeta;
} {
  const root = unwrapRecord(payload);
  const items = unwrapList(payload).map(normalizeTransaction);
  const pagination = normalizePagination(root);
  return { items, pagination };
}
