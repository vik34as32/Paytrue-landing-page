import type {
  CommissionLedgerEntry,
  CommissionWallet,
} from "@/src/types/commission";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toNumber(value: unknown, fallback = 0): number {
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function splitDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: iso, time: "" };

  const date = parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return { date, time };
}

export function unwrapCommissionPayload(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return Object.keys(data).length ? { ...root, ...data } : root;
}

export function normalizeCommissionWallet(payload: unknown): CommissionWallet {
  const raw = unwrapCommissionPayload(payload);
  const nested = asRecord(raw.commission) || asRecord(raw.wallet) || raw;

  const balance = toNumber(
    nested.balance ??
      nested.availableBalance ??
      nested.currentBalance ??
      nested.commissionBalance ??
      raw.balance ??
      raw.availableBalance ??
      raw.commissionBalance
  );

  const availableBalance = toNumber(
    nested.availableBalance ?? nested.balance ?? nested.currentBalance ?? balance,
    balance
  );

  return {
    balance,
    availableBalance,
    holdAmount: toNumber(nested.holdAmount ?? nested.holdBalance ?? raw.holdAmount),
    status: pickString(nested.status, raw.status) || null,
    currency: pickString(nested.currency, raw.currency) || "INR",
    serviceName: pickString(nested.serviceName, raw.serviceName) || "COMMISSION",
    lastUpdated:
      pickString(nested.updatedAt, nested.lastUpdated, raw.updatedAt) ||
      new Date().toISOString(),
  };
}

export function normalizeCommissionLedgerEntry(
  rawInput: unknown
): CommissionLedgerEntry {
  const raw = asRecord(rawInput);
  const retailer = asRecord(
    raw.retailer || raw.sourceRetailer || raw.fromRetailer || raw.child || raw.sourceUser
  );
  const metadata = asRecord(raw.metadata || raw.meta || raw.extra);
  const metaRetailer = asRecord(
    metadata.retailer || metadata.sourceRetailer || metadata.fromRetailer
  );

  const createdAt = pickString(raw.createdAt, raw.date, raw.txnDate, raw.timestamp);
  const { date, time } = splitDateTime(createdAt);
  const amount = toNumber(raw.amount);
  const creditDebitRaw = pickString(raw.creditDebit, raw.type, raw.txnType).toUpperCase();
  const creditDebit =
    creditDebitRaw === "DEBIT" || creditDebitRaw === "DR" || creditDebitRaw === "D"
      ? "DEBIT"
      : creditDebitRaw === "CREDIT" || creditDebitRaw === "CR" || creditDebitRaw === "C"
        ? "CREDIT"
        : creditDebitRaw || "CREDIT";

  const credit =
    creditDebit === "CREDIT"
      ? toNumber(raw.credit ?? raw.cr ?? amount)
      : toNumber(raw.credit ?? raw.cr);
  const debit =
    creditDebit === "DEBIT"
      ? toNumber(raw.debit ?? raw.dr ?? amount)
      : toNumber(raw.debit ?? raw.dr);

  const remarks = pickString(
    raw.remarks,
    raw.remark,
    raw.description,
    raw.narration
  );

  const retailerName = pickString(
    raw.retailerName,
    raw.sourceRetailerName,
    raw.fromRetailerName,
    raw.childName,
    raw.sourceUserName,
    retailer.name,
    retailer.fullName,
    [retailer.firstName, retailer.lastName].filter(Boolean).join(" ").trim(),
    metaRetailer.name,
    metaRetailer.fullName,
    metadata.retailerName,
    // Remarks sometimes: "Commission from RAJAN KUMAR (RET000014)"
    (() => {
      const match = remarks.match(
        /(?:from|retailer)\s*[:\-]?\s*([A-Za-z][A-Za-z0-9 .'-]{1,60})/i
      );
      return match?.[1]?.trim() || "";
    })()
  );

  const retailerMobile = pickString(
    raw.retailerMobile,
    raw.sourceRetailerMobile,
    raw.fromRetailerMobile,
    retailer.mobile,
    retailer.phone,
    retailer.phoneNumber,
    metaRetailer.mobile,
    metaRetailer.phone,
    metadata.retailerMobile
  );

  const retailerCode = pickString(
    raw.retailerCode,
    raw.sourceRetailerCode,
    retailer.userCode,
    retailer.retailerCode,
    retailer.code,
    metaRetailer.userCode,
    metaRetailer.retailerCode,
    metadata.retailerCode,
    (() => {
      const match = remarks.match(/\b(RET\d{4,})\b/i);
      return match?.[1]?.toUpperCase() || "";
    })()
  );

  const retailerId = pickString(
    raw.retailerId,
    raw.sourceRetailerId,
    raw.fromRetailerId,
    raw.childUserId,
    raw.sourceUserId,
    retailer.id,
    retailer.userId,
    metaRetailer.id,
    metadata.retailerId
  );

  return {
    id: pickString(raw.id, raw._id) || `row_${Math.random()}`,
    walletId: pickString(raw.walletId),
    userId: pickString(raw.userId),
    transactionId: pickString(raw.transactionId, raw.txnId, raw.id),
    openingBalance: toNumber(raw.openingBalance),
    closingBalance: toNumber(raw.closingBalance ?? raw.balanceAfter ?? raw.balance),
    amount,
    creditDebit,
    serviceName: pickString(raw.serviceName) || "COMMISSION",
    serviceId: pickString(raw.serviceId, raw.service),
    walletType: pickString(raw.walletType, raw.serviceName) || "COMMISSION",
    remarks,
    type:
      pickString(raw.txnType, raw.transactionType, raw.type) || "COMMISSION",
    reference: pickString(raw.reference, raw.referenceId),
    createdAt,
    date,
    time,
    credit,
    debit,
    retailerId,
    retailerName,
    retailerMobile,
    retailerCode,
  };
}

export function extractCommissionLedgerRows(payload: unknown): unknown[] {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const candidates = [
    data.entries,
    data.items,
    data.ledger,
    data.transactions,
    data.records,
    root.entries,
    root.items,
    root.ledger,
    root.transactions,
    root.records,
    Array.isArray(root.data) ? root.data : null,
    Array.isArray(payload) ? payload : null,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

export function extractCommissionPagination(
  payload: unknown,
  fallback: { page: number; limit: number; total: number }
) {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const pagination =
    asRecord(data.meta) ||
    asRecord(data.pagination) ||
    asRecord(root.meta) ||
    asRecord(root.pagination) ||
    {};

  const page = toNumber(pagination.page ?? fallback.page, fallback.page);
  const limit = toNumber(pagination.limit ?? fallback.limit, fallback.limit);
  const total = toNumber(
    pagination.total ?? pagination.totalCount ?? fallback.total,
    fallback.total
  );
  const totalPages = toNumber(
    pagination.totalPages ?? (Math.ceil((total || 0) / (limit || 1)) || 1),
    1
  );

  return { page, limit, total, totalPages };
}

export function extractCommissionWalletType(payload: unknown): string | null {
  const raw = unwrapCommissionPayload(payload);
  return pickString(raw.walletType, raw.serviceName) || "COMMISSION";
}

export function commissionLedgerPath(role: "rt" | "dd" | "md"): string {
  if (role === "md") return "/md/commission";
  if (role === "dd") return "/dd/commission";
  return "/rt/retailer/commission";
}

export function formatCommissionDate(iso: string): string {
  return splitDateTime(iso).date || "—";
}

export function formatCommissionTime(iso: string): string {
  return splitDateTime(iso).time || "—";
}
