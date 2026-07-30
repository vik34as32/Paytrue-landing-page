import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  buildAepsLedgerQuery,
  normalizeAepsLedgerRow,
} from "@/src/lib/aepsLedgerUtils";
import type {
  AepsLedgerExportParams,
  AepsLedgerListParams,
  AepsLedgerResult,
  AepsLedgerRow,
} from "@/types/aeps-ledger";
import { saveAs } from "file-saver";

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickRows(payload: Record<string, unknown>): unknown[] {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.transactions)) return payload.transactions;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function pickPagination(payload: Record<string, unknown>) {
  return (
    (payload.pagination as Record<string, unknown> | undefined) ||
    (payload.meta as Record<string, unknown> | undefined) ||
    {}
  );
}

function parseFilenameFromDisposition(header?: string | null): string | null {
  if (!header) return null;
  const utfMatch = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utfMatch?.[1]) {
    try {
      return decodeURIComponent(utfMatch[1].trim());
    } catch {
      return utfMatch[1].trim();
    }
  }
  const plainMatch = /filename="?([^";]+)"?/i.exec(header);
  return plainMatch?.[1]?.trim() || null;
}

/** GET /retailer/aeps-ledger */
export async function fetchRetailerAepsLedger(
  params: AepsLedgerListParams = {}
): Promise<AepsLedgerResult> {
  const query = buildAepsLedgerQuery(params);
  const response = await api.get(API_ENDPOINTS.aepsLedger, { params: query });
  const body = asRecord(response.data);

  const nestedPayload =
    body.data && !Array.isArray(body.data) && typeof body.data === "object"
      ? asRecord(body.data)
      : null;

  const payload = nestedPayload ?? body;
  const pagination = pickPagination(Array.isArray(body.data) ? body : payload);
  const nestedWallet = asRecord(payload.wallet);
  const filtersRaw = asRecord(payload.filters);

  const rawRows = Array.isArray(body.data) ? body.data : pickRows(payload);

  const normalized: AepsLedgerRow[] = rawRows.map((item, index) =>
    normalizeAepsLedgerRow(asRecord(item), index)
  );

  const page = toNumber(pagination.page) || Number(query.page) || 1;
  const limit = toNumber(pagination.limit) || Number(query.limit) || 20;

  const transactions = normalized.map((row, index) => ({
    ...row,
    rowNumber: (page - 1) * limit + index + 1,
  }));

  const total = toNumber(pagination.total) || normalized.length;
  const totalPages =
    toNumber(pagination.totalPages) ||
    Math.max(1, Math.ceil(total / limit) || 1);

  return {
    wallet: {
      balance: toNumber(nestedWallet.balance),
      holdAmount: toNumber(nestedWallet.holdAmount),
      status: nestedWallet.status ? String(nestedWallet.status) : null,
    },
    filters: {
      status: filtersRaw.status
        ? String(filtersRaw.status)
        : params.status || null,
      service: filtersRaw.service
        ? String(filtersRaw.service)
        : params.service || null,
      fromDate: filtersRaw.fromDate
        ? String(filtersRaw.fromDate)
        : params.fromDate || null,
      toDate: filtersRaw.toDate
        ? String(filtersRaw.toDate)
        : params.toDate || null,
      search: filtersRaw.search
        ? String(filtersRaw.search)
        : params.search || null,
      sortBy: String(filtersRaw.sortBy || params.sortBy || "createdAt"),
      sortOrder:
        (filtersRaw.sortOrder || params.sortOrder) === "asc" ? "asc" : "desc",
    },
    transactions,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: Boolean(pagination.hasNextPage ?? page < totalPages),
      hasPrevPage: Boolean(pagination.hasPrevPage ?? page > 1),
      count: transactions.length,
    },
  };
}

/** Download CSV / Excel from retailer AEPS ledger export API (falls back to client export upstream). */
export async function exportRetailerAepsLedger(
  params: AepsLedgerExportParams
): Promise<void> {
  const query: Record<string, string> = {
    fromDate: params.fromDate,
    toDate: params.toDate,
    format: params.format === "xlsx" ? "excel" : params.format,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
  };
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "All") query.status = params.status;
  if (params.service && params.service !== "All") query.service = params.service;

  const response = await api.get(API_ENDPOINTS.aepsLedgerExport, {
    params: query,
    responseType: "blob",
  });

  const contentType = String(response.headers?.["content-type"] || "");
  if (contentType.includes("application/json")) {
    const text = await (response.data as Blob).text();
    let message = "Export failed";
    try {
      const parsed = JSON.parse(text) as { message?: string };
      message = parsed.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const disposition = response.headers?.["content-disposition"] as
    | string
    | undefined;
  const fromApi = parseFilenameFromDisposition(disposition);
  const ext = params.format === "csv" ? "csv" : "xlsx";
  const fallback = `AEPS_Ledger_${params.fromDate}_to_${params.toDate}.${ext}`;
  const filename = fromApi || fallback;

  const mime =
    params.format === "csv"
      ? "text/csv;charset=utf-8"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], { type: mime });

  saveAs(blob, filename);
}
