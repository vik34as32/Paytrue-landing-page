import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  buildDownlineLedgerQuery,
  isHiddenDownlineServiceRow,
  normalizeDownlineLedgerRow,
  normalizeDownlineSummary,
} from "@/src/lib/downlineLedgerUtils";
import type {
  DownlineLedgerListParams,
  DownlineLedgerResult,
} from "@/src/types/downlineLedger";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * API sometimes returns `data` as an array, and sometimes as an object
 * with numeric keys: { "0": row, "1": row }. Convert both to an array.
 */
function coerceRows(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;

  // Prefer known list keys when present as arrays
  for (const key of ["transactions", "items", "rows", "records", "data"]) {
    if (Array.isArray(record[key])) return record[key] as unknown[];
  }

  const keys = Object.keys(record);
  if (!keys.length) return [];

  // Numeric-key object → ordered array (skip non-row keys like summary)
  const numericKeys = keys
    .filter((key) => /^\d+$/.test(key))
    .sort((a, b) => Number(a) - Number(b));

  if (numericKeys.length > 0) {
    return numericKeys
      .map((key) => record[key])
      .filter((row) => row && typeof row === "object");
  }

  // Single transaction object fallback
  if (
    "id" in record ||
    "transactionId" in record ||
    "retailerId" in record ||
    "referenceNo" in record
  ) {
    return [record];
  }

  return [];
}

function pickPagination(
  body: Record<string, unknown>,
  fallbackTotal: number,
  page: number,
  limit: number
) {
  const pagination = asRecord(
    body.pagination || body.meta || body.pageInfo
  );
  const total = Number(
    pagination.total ?? pagination.totalCount ?? fallbackTotal
  );
  const resolvedLimit =
    Number(pagination.limit ?? pagination.pageSize ?? limit) || limit;
  const resolvedPage =
    Number(pagination.page ?? pagination.currentPage ?? page) || page;
  const totalPages =
    Number(pagination.totalPages) ||
    Math.max(1, Math.ceil((total || 0) / (resolvedLimit || 1)));

  return {
    page: resolvedPage,
    limit: resolvedLimit,
    total: Number.isFinite(total) ? total : fallbackTotal,
    totalPages,
  };
}

export async function fetchDownlineRetailerLedger(
  params: DownlineLedgerListParams = {}
): Promise<DownlineLedgerResult> {
  const query = buildDownlineLedgerQuery(params);
  const response = await api.get(API_ENDPOINTS.downlineRetailerLedger, {
    params: query,
  });

  const body = asRecord(response.data);
  const rows = coerceRows(body.data);

  // summary/pagination live on response root (not inside data object)
  const summarySource =
    body.summary ??
    asRecord(body.data).summary ??
    null;

  const transactions = rows
    .filter((row) => !isHiddenDownlineServiceRow(row))
    .map((row, index) => normalizeDownlineLedgerRow(row, index));

  return {
    transactions,
    pagination: pickPagination(
      body,
      transactions.length,
      Number(query.page) || 1,
      Number(query.limit) || 20
    ),
    summary: normalizeDownlineSummary(summarySource),
  };
}
