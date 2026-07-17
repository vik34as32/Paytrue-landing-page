import api from "@/src/lib/axios";
import { AEPS_ENDPOINTS } from "@/src/constants/aepsApi";
import { unwrapApiData } from "@/src/lib/dmtUtils";
import { mapAepsToStatement } from "@/src/lib/statementMappers";
import type { StatementTransaction } from "@/types/statementReceipt";

export type AepsLedgerTransactionType =
  | "CASH_WITHDRAWAL"
  | "CASH_DEPOSIT"
  | "BALANCE_ENQUIRY"
  | "MINI_STATEMENT"
  | "AADHAAR_PAY"
  | string;

export interface AepsLedgerQuery {
  page?: number;
  limit?: number;
  /** Filter ledger by AEPS transaction type */
  transactionType?: AepsLedgerTransactionType;
  startDate?: string;
  endDate?: string;
}

export interface AepsLedgerSummaryItem {
  transactionType: string;
  count: number;
  totalAmount: number;
}

export interface AepsLedgerResult {
  transactions: StatementTransaction[];
  summary: AepsLedgerSummaryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * GET /aeps/ledger
 * Optional `transactionType=CASH_WITHDRAWAL|CASH_DEPOSIT` for separate tables.
 */
export async function fetchAepsLedger(
  query: AepsLedgerQuery = {}
): Promise<AepsLedgerResult> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 100;

  const params: Record<string, string | number> = { page, limit };
  if (query.transactionType) {
    params.transactionType = query.transactionType;
  }
  if (query.startDate) params.startDate = query.startDate;
  if (query.endDate) params.endDate = query.endDate;

  const response = await api.get(AEPS_ENDPOINTS.ledger, { params });
  const data = unwrapApiData<Record<string, unknown>>(response.data) ?? {};
  const root = asRecord(data);

  const rows = Array.isArray(data)
    ? data
    : Array.isArray(root.records)
      ? root.records
      : [];

  let transactions = (rows as Record<string, unknown>[]).map(mapAepsToStatement);

  // Client-side safety filter if API returns mixed types
  if (query.transactionType) {
    const wanted = String(query.transactionType).toUpperCase();
    transactions = transactions.filter(
      (txn) => String(txn.aepsTransactionType || "").toUpperCase() === wanted
    );
  }

  const summaryRaw = Array.isArray(root.summary) ? root.summary : [];
  const summary: AepsLedgerSummaryItem[] = summaryRaw.map((item) => {
    const row = asRecord(item);
    return {
      transactionType: String(row.transactionType ?? ""),
      count: toNumber(row.count),
      totalAmount: toNumber(row.totalAmount),
    };
  });

  const metaRaw = asRecord(root.meta);
  const meta = {
    total: toNumber(metaRaw.total, transactions.length),
    page: toNumber(metaRaw.page, page),
    limit: toNumber(metaRaw.limit, limit),
    totalPages: toNumber(
      metaRaw.totalPages,
      Math.max(1, Math.ceil(transactions.length / limit))
    ),
  };

  return { transactions, summary, meta };
}
