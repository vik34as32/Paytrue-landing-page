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
  };
}

export function normalizeBeneficiary(raw: Record<string, unknown> = {}): DmtBeneficiary {
  const status = normalizeStatus(raw.status ?? raw.verificationStatus);
  return {
    id: String(raw.id ?? raw.beneficiaryId ?? raw._id ?? ""),
    name: String(raw.name ?? raw.beneficiaryName ?? ""),
    mobile: String(raw.mobile ?? raw.mobileNumber ?? ""),
    bankName: String(raw.bankName ?? raw.bank ?? ""),
    accountNumber: String(raw.accountNumber ?? raw.accountNo ?? ""),
    ifscCode: String(raw.ifscCode ?? raw.ifsc ?? "").toUpperCase(),
    status,
    isVerified: Boolean(raw.isVerified ?? status === "verified"),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
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

  return {
    exists,
    sender: senderRaw ? normalizeSender(senderRaw) : null,
  };
}

export function normalizeBeneficiaryList(payload: unknown): DmtBeneficiary[] {
  const data = unwrapApiData<unknown>(payload);
  const rows = Array.isArray(data)
    ? data
    : (data as { beneficiaries?: unknown[] })?.beneficiaries ??
      (data as { items?: unknown[] })?.items ??
      (data as { data?: unknown[] })?.data ??
      [];

  return (rows as Record<string, unknown>[]).map(normalizeBeneficiary);
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
