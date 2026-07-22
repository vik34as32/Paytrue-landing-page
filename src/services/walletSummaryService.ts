import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  buildWalletSummaryQuery,
  normalizeWalletSummaryTransaction,
  shouldShowWalletLedgerRow,
} from "@/src/lib/walletSummaryUtils";
import type {
  WalletSummaryListParams,
  WalletSummaryPortalRole,
  WalletSummaryResult,
  WalletSummaryTransaction,
} from "@/src/types/walletSummary";

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function pickRows(payload: Record<string, unknown>): unknown[] {
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.transactions)) return payload.transactions;
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

export async function fetchWalletSummary(
  params: WalletSummaryListParams = {},
  role: WalletSummaryPortalRole = "rt"
): Promise<WalletSummaryResult> {
  const query = buildWalletSummaryQuery(params);

  // RT retailer wallet summary uses dedicated ledger API
  const endpoint =
    role === "rt" ? API_ENDPOINTS.walletLedger : API_ENDPOINTS.walletSummary;

  const response = await api.get(endpoint, { params: query });
  const body = (response.data ?? {}) as Record<string, unknown>;

  // Shape: { success, message, data: [...], pagination }
  // Legacy: { data: { transactions, wallet, user, meta } }
  const nestedPayload =
    body.data && !Array.isArray(body.data) && typeof body.data === "object"
      ? (body.data as Record<string, unknown>)
      : null;

  const payload = nestedPayload ?? body;
  const pagination = pickPagination(Array.isArray(body.data) ? body : payload);
  const nestedWallet = (payload.wallet as Record<string, unknown>) ?? {};
  const nestedUser = (payload.user as Record<string, unknown>) ?? {};
  const filtersRaw = (payload.filters as Record<string, unknown>) ?? {};

  const rawRows = Array.isArray(body.data)
    ? body.data
    : pickRows(payload);

  const normalized: WalletSummaryTransaction[] = rawRows.map((item, index) =>
    normalizeWalletSummaryTransaction(item as Record<string, unknown>, index)
  );

  // Hide Pending + Commission rows
  const page = toNumber(pagination.page) || Number(query.page) || 1;
  const limit = toNumber(pagination.limit) || Number(query.limit) || 20;

  const transactions = normalized
    .filter(shouldShowWalletLedgerRow)
    .map((row, index) => ({
      ...row,
      rowNumber: (page - 1) * limit + index + 1,
    }));

  const total = toNumber(pagination.total) || normalized.length;
  const totalPages =
    toNumber(pagination.totalPages) || Math.max(1, Math.ceil(total / limit) || 1);

  return {
    user: {
      id: String(nestedUser.id || ""),
      role: String(nestedUser.role || role),
      roleLabel: String(nestedUser.roleLabel || nestedUser.role || role),
    },
    wallet: {
      balance: toNumber(nestedWallet.balance),
      holdAmount: toNumber(nestedWallet.holdAmount),
      status: nestedWallet.status ? String(nestedWallet.status) : null,
    },
    filters: {
      type:
        (String(
          filtersRaw.type || params.type || "ALL"
        ).toUpperCase() as WalletSummaryResult["filters"]["type"]) || "ALL",
      status: filtersRaw.status
        ? String(filtersRaw.status)
        : params.status || null,
      startDate: filtersRaw.startDate
        ? String(filtersRaw.startDate)
        : params.startDate || null,
      endDate: filtersRaw.endDate
        ? String(filtersRaw.endDate)
        : params.endDate || null,
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
