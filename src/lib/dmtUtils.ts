import { dedupeBeneficiariesByAccount } from "@/src/modules/dmt/services/normalizers";
import type {
  CheckSenderResponse,
  DmtApiError,
  DmtBeneficiary,
  DmtDashboardStats,
  DmtErrorCode,
  DmtPaginatedResponse,
  DmtSender,
  DmtTransaction,
  DmtTransactionStatus,
  DmtVerificationStatus,
} from "@/src/types/dmt";

export function unwrapApiData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}

/** Map UI bank selection to API fields (bankId = internal UUID, instantPayBankId = InstantPay numeric id). */
export function resolveBeneficiaryBankFields(input: {
  bankId?: string;
  instantPayBankId?: string | number;
}): { bankId?: string; instantPayBankId?: string | number } {
  const rawBankId = input.bankId?.trim();
  const uuidBankId = rawBankId && isUuid(rawBankId) ? rawBankId : undefined;
  const instantPayBankId =
    input.instantPayBankId ??
    (rawBankId && !isUuid(rawBankId) ? rawBankId : undefined);

  const result: { bankId?: string; instantPayBankId?: string | number } = {};
  if (uuidBankId) result.bankId = uuidBankId;
  if (instantPayBankId != null && String(instantPayBankId).trim()) {
    result.instantPayBankId = instantPayBankId;
  }
  return result;
}

/** Normalize to 10-digit Indian mobile (6–9 prefix). Returns undefined if invalid. */
export function normalizeIndianMobile(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);

  return /^[6-9]\d{9}$/.test(digits) ? digits : undefined;
}

/** Beneficiary mobile, falling back to remitter mobile when omitted. */
export function resolveBeneficiaryMobileNumber(
  senderMobile?: string,
  beneficiaryMobileNumber?: string
): string | undefined {
  return (
    normalizeIndianMobile(beneficiaryMobileNumber) ?? normalizeIndianMobile(senderMobile)
  );
}

function toNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeStatus(value: unknown): DmtVerificationStatus {
  const raw = String(value ?? "pending").toLowerCase();
  if (raw.includes("verify") || raw === "active" || raw === "success") return "verified";
  if (raw.includes("fail")) return "failed";
  if (raw.includes("unverify") || raw === "inactive") return "unverified";
  return "pending";
}

function normalizeTxnStatus(value: unknown): DmtTransactionStatus {
  const raw = String(value ?? "pending").toLowerCase();
  if (raw.includes("success") || raw === "completed") return "success";
  if (raw.includes("fail")) return "failed";
  if (raw.includes("process")) return "processing";
  return "pending";
}

export function normalizeSender(raw: Record<string, unknown> = {}): DmtSender {
  const firstName = String(raw.firstName ?? raw.first_name ?? "");
  const lastName = String(raw.lastName ?? raw.last_name ?? "");
  const name =
    String(raw.name ?? raw.fullName ?? `${firstName} ${lastName}`.trim()) ||
    "Sender";

  const verificationStatus = normalizeStatus(
    raw.verificationStatus ?? raw.status ?? raw.kycStatus
  );

  const metadata =
    raw.metadata && typeof raw.metadata === "object"
      ? (raw.metadata as Record<string, unknown>)
      : {};
  const pidOptionWadh = String(
    raw.pidOptionWadh ??
      raw.pid_option_wadh ??
      raw.wadh ??
      metadata.pidOptionWadh ??
      metadata.pid_option_wadh ??
      metadata.wadh ??
      ""
  ).trim();

  return {
    id: String(raw.id ?? raw.senderId ?? raw._id ?? raw.mobile ?? ""),
    mobile: String(raw.mobile ?? raw.mobileNumber ?? ""),
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    verificationStatus,
    beneficiaryCount: toNumber(raw.beneficiaryCount ?? raw.beneficiariesCount),
    dailyLimit: toNumber(raw.dailyLimit ?? raw.daily_limit),
    monthlyLimit: toNumber(raw.monthlyLimit ?? raw.monthly_limit),
    dailyUsed: toNumber(raw.dailyUsed ?? raw.daily_used, 0),
    monthlyUsed: toNumber(raw.monthlyUsed ?? raw.monthly_used, 0),
    isVerified: Boolean(raw.isVerified ?? verificationStatus === "verified"),
    pidOptionWadh: pidOptionWadh || undefined,
  };
}

export function normalizeBeneficiary(raw: Record<string, unknown> = {}): DmtBeneficiary {
  const status = normalizeStatus(raw.status ?? raw.verificationStatus);
  const metadata =
    raw.metadata && typeof raw.metadata === "object"
      ? (raw.metadata as Record<string, unknown>)
      : {};
  const instantPay =
    metadata.instantPay && typeof metadata.instantPay === "object"
      ? (metadata.instantPay as Record<string, unknown>)
      : {};
  const bankObj =
    raw.bank && typeof raw.bank === "object" ? (raw.bank as Record<string, unknown>) : {};
  const bankAsString = typeof raw.bank === "string" ? raw.bank.trim() : "";
  const ifscCode = String(raw.ifscCode ?? raw.ifsc ?? "").toUpperCase();
  const bankName =
    String(bankObj.name ?? bankObj.bankName ?? raw.bankName ?? bankAsString ?? "").trim() ||
    (ifscCode ? `${ifscCode.slice(0, 4)} Bank` : "");
  const verificationDt = String(
    raw.verificationDt ?? raw.verifiedAt ?? raw.verified_at ?? ""
  ).trim();
  const isVerified = Boolean(
    raw.isVerified ||
      raw.verified ||
      status === "verified" ||
      verificationDt
  );

  return {
    id: String(raw.id ?? raw.beneficiaryId ?? raw._id ?? ""),
    name: String(raw.name ?? raw.beneficiaryName ?? ""),
    mobile: String(
      raw.mobile ?? raw.beneficiaryMobileNumber ?? raw.mobileNumber ?? ""
    ),
    bankName,
    accountNumber: String(raw.accountNumber ?? raw.accountNo ?? raw.account ?? ""),
    ifscCode,
    status: isVerified ? "verified" : status === "verified" ? "unverified" : status,
    isVerified,
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    referenceKey: String(
      raw.referenceKey ?? metadata.referenceKey ?? instantPay.referenceKey ?? ""
    ) || undefined,
    externalRef: String(raw.externalRef ?? instantPay.beneficiaryId ?? "") || undefined,
  };
}

export function normalizeTransaction(raw: Record<string, unknown> = {}): DmtTransaction {
  const beneficiary = (raw.beneficiary as Record<string, unknown>) ?? {};
  const sender = (raw.sender as Record<string, unknown>) ?? {};

  return {
    id: String(raw.id ?? raw._id ?? raw.transactionId ?? ""),
    transactionId: String(raw.transactionId ?? raw.txnId ?? raw.id ?? ""),
    referenceNumber: String(raw.referenceNumber ?? raw.reference ?? raw.refNo ?? ""),
    rrn: raw.rrn ? String(raw.rrn) : undefined,
    utr: raw.utr ? String(raw.utr) : undefined,
    beneficiaryId: String(raw.beneficiaryId ?? beneficiary.id ?? ""),
    beneficiaryName: String(
      raw.beneficiaryName ?? beneficiary.name ?? beneficiary.beneficiaryName ?? ""
    ),
    bankName: String(raw.bankName ?? beneficiary.bankName ?? beneficiary.bank ?? ""),
    accountNumber: String(
      raw.accountNumber ?? beneficiary.accountNumber ?? beneficiary.accountNo ?? ""
    ),
    ifscCode: String(raw.ifscCode ?? beneficiary.ifscCode ?? beneficiary.ifsc ?? ""),
    senderMobile: String(raw.senderMobile ?? sender.mobile ?? raw.mobile ?? ""),
    senderName: String(raw.senderName ?? sender.name ?? ""),
    amount: toNumber(raw.amount),
    charges: toNumber(raw.charges ?? raw.charge ?? raw.fee),
    gst: toNumber(raw.gst ?? raw.gstAmount),
    transferMode: String(raw.transferMode ?? raw.mode ?? "IMPS").toUpperCase() as
      | "IMPS"
      | "NEFT",
    status: normalizeTxnStatus(raw.status),
    remark: raw.remark ? String(raw.remark) : undefined,
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

export function normalizeCheckSenderResponse(payload: unknown): CheckSenderResponse {
  const data = unwrapApiData<Record<string, unknown>>(payload);
  const senderRaw =
    (data?.sender as Record<string, unknown>) ??
    (data?.remitter as Record<string, unknown>) ??
    (data?.data as Record<string, unknown>);

  const exists = Boolean(
    data?.exists ??
      data?.isRegistered ??
      data?.found ??
      senderRaw?.id ??
      senderRaw?.mobile
  );

  const referenceKeyRaw =
    data?.referenceKey ??
    data?.reference_key ??
    data?.requestId ??
    data?.request_id ??
    senderRaw?.referenceKey ??
    senderRaw?.reference_key;

  const metadata =
    data?.metadata && typeof data.metadata === "object"
      ? (data.metadata as Record<string, unknown>)
      : {};
  const senderMeta =
    senderRaw?.metadata && typeof senderRaw.metadata === "object"
      ? (senderRaw.metadata as Record<string, unknown>)
      : {};

  const pidOptionWadh = String(
    data?.pidOptionWadh ??
      data?.pid_option_wadh ??
      data?.wadh ??
      metadata.pidOptionWadh ??
      metadata.pid_option_wadh ??
      metadata.wadh ??
      senderRaw?.pidOptionWadh ??
      senderRaw?.pid_option_wadh ??
      senderRaw?.wadh ??
      senderMeta.pidOptionWadh ??
      senderMeta.pid_option_wadh ??
      senderMeta.wadh ??
      ""
  ).trim();

  // eslint-disable-next-line no-console -- DMT PID/WADH debug
  console.log("========== FRONTEND PID DEBUG ==========");
  // eslint-disable-next-line no-console
  console.log("API pidOptionWadh:", pidOptionWadh || "(undefined)");
  // eslint-disable-next-line no-console
  console.log("Redux pidOptionWadh:", "(not stored yet — checkRemitter normalize)");
  // eslint-disable-next-line no-console
  console.log("Capture pidOptionWadh:", "(n/a at check)");
  // eslint-disable-next-line no-console
  console.log("Generated XML:", "(n/a at check)");
  if (!pidOptionWadh) {
    // eslint-disable-next-line no-console
    console.log(
      "Became undefined at:",
      "normalizeCheckSenderResponse — missing pidOptionWadh on remitter/check payload"
    );
  }
  // eslint-disable-next-line no-console
  console.log("========================================");

  return {
    exists,
    sender: senderRaw
      ? normalizeSender({
          ...senderRaw,
          ...(pidOptionWadh ? { pidOptionWadh } : {}),
        })
      : null,
    referenceKey: referenceKeyRaw != null ? String(referenceKeyRaw) : undefined,
    pidOptionWadh: pidOptionWadh || undefined,
  };
}

export function normalizeBeneficiaryList(payload: unknown): DmtBeneficiary[] {
  const root = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
  const level1 =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const local = Array.isArray(level1.local) ? level1.local : [];
  const provider = Array.isArray(level1.provider) ? level1.provider : [];
  if (local.length || provider.length) {
    const beneficiaries = [...local, ...provider].map((row) =>
      normalizeBeneficiary(row as Record<string, unknown>)
    );
    return dedupeBeneficiariesByAccount(beneficiaries);
  }

  const level2 =
    level1.data && typeof level1.data === "object" && !Array.isArray(level1.data)
      ? (level1.data as Record<string, unknown>)
      : {};

  const candidates = [
    level1.beneficiaries,
    level2.beneficiaries,
    level2.data,
    level1.data,
    level1.items,
    level2.items,
    level1.list,
    level2.list,
    root.beneficiaries,
    root.items,
    payload,
  ];

  const rows = candidates.find((candidate) => Array.isArray(candidate)) ?? [];

  const beneficiaries = (rows as Record<string, unknown>[]).map(normalizeBeneficiary);
  return dedupeBeneficiariesByAccount(beneficiaries);
}

export function normalizeTransactionList(
  payload: unknown
): DmtPaginatedResponse<DmtTransaction> {
  const data = unwrapApiData<Record<string, unknown>>(payload);
  const rows = Array.isArray(data)
    ? data
    : (data?.transactions as unknown[]) ??
      (data?.items as unknown[]) ??
      (data?.data as unknown[]) ??
      [];

  const paginationRaw = (data?.pagination as Record<string, unknown>) ?? data ?? {};
  const total = toNumber(
    paginationRaw.total ?? data?.total ?? data?.totalCount ?? rows.length
  );
  const page = toNumber(paginationRaw.page ?? data?.page, 1);
  const limit = toNumber(paginationRaw.limit ?? data?.limit, 10);
  const totalPages = toNumber(
    paginationRaw.totalPages ??
      data?.totalPages ??
      (Math.ceil(total / limit) || 1)
  );

  return {
    items: (rows as Record<string, unknown>[]).map(normalizeTransaction),
    pagination: { page, limit, total, totalPages },
  };
}

export function buildDashboardStats(
  transactions: DmtTransaction[],
  walletBalance: number,
  beneficiaries: DmtBeneficiary[],
  sendersCount = 1
): DmtDashboardStats {
  const today = new Date().toDateString();
  const todayTxns = transactions.filter(
    (txn) => new Date(txn.createdAt).toDateString() === today
  );

  return {
    todayTransfers: todayTxns.length,
    successfulTransfers: transactions.filter((t) => t.status === "success").length,
    pendingTransfers: transactions.filter(
      (t) => t.status === "pending" || t.status === "processing"
    ).length,
    failedTransfers: transactions.filter((t) => t.status === "failed").length,
    walletBalance,
    totalBeneficiaries: beneficiaries.length,
    totalSenders: sendersCount,
    totalTransferAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
  };
}

export function mapDmtError(error: unknown): DmtApiError {
  const err = error as {
    message?: string;
    status?: number;
    data?: {
      message?: string;
      code?: string;
      error?: string;
      errors?: Array<{ field?: string; message?: string }>;
    };
  };

  const validationErrors = err?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    const details = validationErrors
      .map((item) =>
        item.field ? `${item.field}: ${item.message || "invalid"}` : item.message
      )
      .filter(Boolean)
      .join("; ");
    const mapped = new Error(
      details || err?.data?.message || err?.message || "Validation failed."
    ) as DmtApiError;
    mapped.status = err?.status;
    mapped.code = (err?.data?.code as DmtErrorCode) ?? "UNKNOWN";
    mapped.data = err?.data;
    return mapped;
  }

  const message =
    err?.data?.message ??
    err?.data?.error ??
    err?.message ??
    "Something went wrong";

  const lower = message.toLowerCase();
  let code: DmtErrorCode = "UNKNOWN";

  if (lower.includes("invalid sender") || lower.includes("sender not found")) {
    code = "INVALID_SENDER";
  } else if (lower.includes("beneficiary already") || lower.includes("already exists")) {
    code = "BENEFICIARY_EXISTS";
  } else if (lower.includes("otp expired")) {
    code = "OTP_EXPIRED";
  } else if (lower.includes("invalid otp") || lower.includes("wrong otp")) {
    code = "INVALID_OTP";
  } else if (lower.includes("bank down") || lower.includes("bank unavailable")) {
    code = "BANK_DOWN";
  } else if (lower.includes("timeout") || lower.includes("timed out")) {
    code = "TIMEOUT";
  } else if (lower.includes("insufficient") || lower.includes("low balance")) {
    code = "INSUFFICIENT_BALANCE";
  } else if (lower.includes("transaction failed") || lower.includes("transfer failed")) {
    code = "TRANSACTION_FAILED";
  } else if ((err?.status ?? 0) >= 500) {
    code = "SERVER_ERROR";
  }

  const mapped = new Error(message) as DmtApiError;
  mapped.status = err?.status;
  mapped.code = (err?.data?.code as DmtErrorCode) ?? code;
  mapped.data = err?.data;
  return mapped;
}

export function maskAccountNumber(value: string): string {
  if (!value || value.length < 4) return value;
  return value.slice(-4).padStart(value.length, "•");
}
