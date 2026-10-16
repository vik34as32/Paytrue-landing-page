import type {
  NsdlBank,
  NsdlLedgerResult,
  NsdlLedgerRow,
  NsdlMerchant,
  NsdlMiniStatementRow,
  NsdlServiceType,
  NsdlState,
  NsdlStepResult,
  NsdlTransaction,
} from "../types";

type Rec = Record<string, unknown>;

export function asRecord(value: unknown): Rec {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Rec) : {};
}

function str(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function optNum(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

/** `{ success, message, data }` envelope → inner `data` (falls back to the payload itself). */
export function unwrapData(payload: unknown): Rec {
  const root = asRecord(payload);
  if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
    return root.data as Rec;
  }
  return root;
}

function asList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const root = asRecord(payload);
  for (const key of ["data", "banks", "states", "transactions", "items", "records"]) {
    const value = root[key];
    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = asList(value);
      if (nested.length) return nested;
    }
  }
  return [];
}

export const NSDL_SERVICE_LABELS: Record<NsdlServiceType, string> = {
  CASH_WITHDRAWAL: "Cash Withdrawal",
  BALANCE_ENQUIRY: "Balance Enquiry",
  MINI_STATEMENT: "Mini Statement",
  CASH_DEPOSIT: "Cash Deposit",
  AADHAAR_PE: "Aadhaar Pay",
};

export function nsdlServiceLabel(serviceType: string): string {
  const key = str(serviceType).toUpperCase() as NsdlServiceType;
  return NSDL_SERVICE_LABELS[key] || str(serviceType).replace(/_/g, " ") || "AEPS";
}

export function normalizeNsdlBanks(payload: unknown): NsdlBank[] {
  const seen = new Set<string>();
  return asList(payload)
    .map((row) => {
      const bank = asRecord(row);
      return {
        name: str(bank.bankName ?? bank.name ?? bank.BANKNAME),
        iin: str(bank.iin ?? bank.identityNo ?? bank.bankIIN ?? bank.IIN).replace(/\D/g, ""),
      };
    })
    .filter((bank) => {
      if (!bank.iin || seen.has(bank.iin)) return false;
      seen.add(bank.iin);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function normalizeNsdlStates(payload: unknown): NsdlState[] {
  return asList(payload)
    .map((row) => {
      const state = asRecord(row);
      return {
        id: str(state.id ?? state.stateId),
        name: str(state.name ?? state.stateName),
      };
    })
    .filter((state) => state.id && state.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function normalizeNsdlMerchant(payload: unknown): NsdlMerchant {
  const data = unwrapData(payload);
  return {
    merchantId: str(data.merchantId) || null,
    status: str(data.status) || "NOT_STARTED",
    nextAction: str(data.nextAction) || "SUBMIT_ONBOARDING",
    activated: data.activated === true,
    dailyLoginStatus: str(data.dailyLoginStatus) || null,
    lastDailyLoginAt: str(data.lastDailyLoginAt) || null,
    videoKycUrl: str(data.videoKycUrl) || null,
    mobile: str(data.mobile) || null,
    email: str(data.email) || null,
    shopName: str(data.shopName) || null,
    aadhaarMasked: str(data.aadhaarMasked) || null,
    bankIin: str(data.bankIin) || null,
  };
}

function isToday(value: string | null): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function isNsdlDailyLoginDone(merchant: NsdlMerchant | null | undefined): boolean {
  if (!merchant?.activated) return false;
  return (
    str(merchant.dailyLoginStatus).toUpperCase() === "SUCCESS" &&
    isToday(merchant.lastDailyLoginAt)
  );
}

export function normalizeNsdlStepResult(payload: unknown): NsdlStepResult {
  const root = asRecord(payload);
  const data = unwrapData(payload);
  return {
    success: data.success === true || str(data.status).toUpperCase() === "SUCCESS",
    status: str(data.status),
    message: str(data.message ?? root.message),
    nextAction: str(data.nextAction) || undefined,
    merchantId: str(data.merchantId) || null,
    videoKycUrl: str(data.videoKycUrl) || null,
    transactionId: str(data.transactionId) || undefined,
  };
}

function normalizeMiniStatement(value: unknown): NsdlMiniStatementRow[] {
  return asList(value).map((row) => {
    const item = asRecord(row);
    const drCr = str(
      item.type ?? item.txnType ?? item.drCr ?? item.DrCr ?? item.debitCreditIndicator
    ).toUpperCase();
    return {
      date: str(item.date ?? item.Date ?? item.txnDate ?? item.transactionDate),
      narration: str(item.narration ?? item.Narration ?? item.description ?? item.remarks),
      amount: num(String(item.amount ?? item.Amount ?? item.txnAmount ?? 0).replace(/,/g, "")),
      type: drCr.startsWith("C") ? "CR" : drCr.startsWith("D") ? "DR" : drCr,
      balance: optNum(item.balance ?? item.Balance),
    };
  });
}

export function normalizeNsdlTransaction(payload: unknown): NsdlTransaction {
  const root = asRecord(payload);
  const data = unwrapData(payload);
  return {
    id: str(data.id),
    transactionId: str(data.transactionId ?? data.reference),
    serviceType: str(data.serviceType).toUpperCase(),
    status: str(data.status).toUpperCase() || "PENDING",
    message: str(data.message ?? data.providerMessage ?? root.message),
    amount: num(data.amount),
    charges: num(data.charges),
    commission: num(data.commissionAmount ?? data.commission),
    aadhaarMasked: str(data.aadhaarMasked),
    bankIIN: str(data.bankIIN),
    bankReference: str(data.bankReferenceNumber ?? data.bankReference),
    providerTransactionId: str(data.providerTransactionId),
    bankAccountBalance: optNum(data.bankAccountBalance),
    miniStatement: normalizeMiniStatement(data.miniStatement),
    openingBalance: optNum(data.openingBalance),
    closingBalance: optNum(data.closingBalance),
    createdAt: str(data.createdAt) || new Date().toISOString(),
    completedAt: str(data.completedAt) || undefined,
  };
}

function normalizeLedgerRow(row: unknown): NsdlLedgerRow {
  const item = asRecord(row);
  return {
    transactionId: str(item.transactionId ?? item.id),
    reference: str(item.reference),
    serviceType: str(item.serviceType).toUpperCase(),
    amount: num(item.amount),
    charges: num(item.charges),
    commission: num(item.commission ?? item.commissionAmount),
    debit: num(item.debit),
    credit: num(item.credit),
    openingBalance: item.openingBalance != null ? num(item.openingBalance) : null,
    closingBalance: item.closingBalance != null ? num(item.closingBalance) : null,
    status: str(item.status).toUpperCase(),
    aadhaarMasked: str(item.aadhaarMasked),
    bankIIN: str(item.bankIIN),
    bankReference: str(item.bankReference ?? item.providerTransactionId),
    providerMessage: str(item.providerMessage),
    createdAt: str(item.createdAt),
  };
}

export function normalizeNsdlLedger(payload: unknown, page: number, limit: number): NsdlLedgerResult {
  const root = asRecord(payload);
  const meta = asRecord(root.meta ?? root.pagination ?? asRecord(root.data).meta);
  const rows = asList(payload).map(normalizeLedgerRow);
  const total = num(meta.total ?? meta.totalCount ?? rows.length);
  const metaLimit = num(meta.limit) || limit;
  return {
    rows,
    total,
    page: num(meta.page) || page,
    limit: metaLimit,
    totalPages: num(meta.totalPages) || Math.max(1, Math.ceil(total / metaLimit)),
    openingBalance: num(meta.openingBalance),
    closingBalance: num(meta.closingBalance),
    totalCredit: num(meta.totalCredit),
    totalDebit: num(meta.totalDebit),
  };
}

/**
 * Backend answers failed onboarding / login / transactions with HTTP 400 but the body still
 * carries the result object — surface that instead of a generic error.
 */
export function resultPayloadFromError(error: unknown): Rec | null {
  const envelope = asRecord(asRecord(error).data);
  const data = asRecord(envelope.data);
  if (str(data.status) || data.success === false) {
    return { ...envelope, data };
  }
  return null;
}

export function nsdlErrorMessage(error: unknown, fallback = "NSDL AEPS request failed."): string {
  const err = asRecord(error);
  const envelope = asRecord(err.data);
  const errors = envelope.errors;
  if (Array.isArray(errors) && errors.length) {
    const details = errors
      .map((item) => {
        const entry = asRecord(item);
        const field = str(entry.field ?? entry.path);
        const message = str(entry.message) || "invalid";
        return field ? `${field}: ${message}` : message;
      })
      .filter(Boolean)
      .join("; ");
    if (details) return details;
  }
  const inner = asRecord(envelope.data);
  return (
    str(inner.message) ||
    str(envelope.message) ||
    str(err.message) ||
    (error instanceof Error ? error.message : "") ||
    fallback
  );
}

export function maskAadhaarInput(aadhaar: string): string {
  const digits = aadhaar.replace(/\D/g, "");
  return digits.length >= 4 ? `XXXX-XXXX-${digits.slice(-4)}` : "";
}

export function createIdempotencyKey(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}${Math.random().toString(36).slice(2)}`;
  return `nsdl${random}`.slice(0, 40);
}
