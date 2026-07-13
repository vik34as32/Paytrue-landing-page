import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  buildWalletSummaryQuery,
  normalizeWalletSummaryTransaction,
} from "@/src/lib/walletSummaryUtils";
import type {
  WalletSummaryListParams,
  WalletSummaryResult,
} from "@/src/types/walletSummary";

function toNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export async function fetchWalletSummary(
  params: WalletSummaryListParams = {}
): Promise<WalletSummaryResult> {
  const query = buildWalletSummaryQuery(params);
  const response = await api.get(API_ENDPOINTS.walletSummary, { params: query });
  const payload = (response.data?.data ?? response.data) as Record<string, unknown>;

  const walletRaw = (payload.wallet as Record<string, unknown>) ?? {};
  const userRaw = (payload.user as Record<string, unknown>) ?? {};
  const filtersRaw = (payload.filters as Record<string, unknown>) ?? {};
  const metaRaw = (payload.meta as Record<string, unknown>) ?? {};
  const transactionsRaw = Array.isArray(payload.transactions) ? payload.transactions : [];

  const page = toNumber(metaRaw.page) || Number(query.page) || 1;
  const limit = toNumber(metaRaw.limit) || Number(query.limit) || 20;
  const total = toNumber(metaRaw.total) || transactionsRaw.length;
  const totalPages =
    toNumber(metaRaw.totalPages) || Math.max(1, Math.ceil(total / limit) || 1);

  return {
    user: {
      id: String(userRaw.id || ""),
      role: String(userRaw.role || ""),
      roleLabel: String(userRaw.roleLabel || userRaw.role || ""),
    },
    wallet: {
      balance: toNumber(walletRaw.balance),
      holdAmount: toNumber(walletRaw.holdAmount),
      status: walletRaw.status ? String(walletRaw.status) : null,
    },
    filters: {
      type: (String(filtersRaw.type || "ALL").toUpperCase() as WalletSummaryResult["filters"]["type"]) || "ALL",
      status: filtersRaw.status ? String(filtersRaw.status) : null,
      startDate: filtersRaw.startDate ? String(filtersRaw.startDate) : null,
      endDate: filtersRaw.endDate ? String(filtersRaw.endDate) : null,
      search: filtersRaw.search ? String(filtersRaw.search) : null,
      sortBy: String(filtersRaw.sortBy || "createdAt"),
      sortOrder: filtersRaw.sortOrder === "asc" ? "asc" : "desc",
    },
    transactions: transactionsRaw.map((item) =>
      normalizeWalletSummaryTransaction(item as Record<string, unknown>)
    ),
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: Boolean(metaRaw.hasNextPage ?? page < totalPages),
      hasPrevPage: Boolean(metaRaw.hasPrevPage ?? page > 1),
      count: toNumber(metaRaw.count) || transactionsRaw.length,
    },
  };
}
