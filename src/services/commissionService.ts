import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  extractCommissionLedgerRows,
  extractCommissionPagination,
  extractCommissionWalletType,
  normalizeCommissionLedgerEntry,
  normalizeCommissionWallet,
} from "@/src/lib/commissionUtils";
import type {
  CommissionLedgerFilters,
  CommissionLedgerResult,
  CommissionTopupRequest,
  CommissionWallet,
  CommissionLedgerEntry,
} from "@/src/types/commission";
import { COMMISSION_TRANSFER_REMARKS } from "@/src/types/commission";

export async function fetchCommissionWallet(): Promise<CommissionWallet> {
  const response = await api.get(API_ENDPOINTS.walletCommission);
  return normalizeCommissionWallet(response.data);
}

export async function fetchCommissionLedger(
  filters: CommissionLedgerFilters = {}
): Promise<CommissionLedgerResult> {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const response = await api.get(API_ENDPOINTS.walletCommissionLedger, { params });
  const rows = extractCommissionLedgerRows(response.data);
  const items = rows.map(normalizeCommissionLedgerEntry);
  const pagination = extractCommissionPagination(response.data, {
    page: Number(params.page) || 1,
    limit: Number(params.limit) || 20,
    total: items.length,
  });

  return {
    items,
    pagination,
    walletType: extractCommissionWalletType(response.data),
  };
}

/** Fetch every page for full Excel / PDF / print exports. */
export async function fetchAllCommissionLedger(
  filters: Omit<CommissionLedgerFilters, "page" | "limit"> = {}
): Promise<CommissionLedgerEntry[]> {
  const pageSize = 100;
  const first = await fetchCommissionLedger({
    ...filters,
    page: 1,
    limit: pageSize,
  });

  const all = [...first.items];
  const totalPages = first.pagination.totalPages || 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchCommissionLedger({
      ...filters,
      page,
      limit: pageSize,
    });
    all.push(...next.items);
  }

  return all;
}

export async function topupCommissionToMainWallet(
  payload: CommissionTopupRequest
): Promise<unknown> {
  const response = await api.post(API_ENDPOINTS.walletCommissionTransferToMain, {
    amount: payload.amount,
    remarks: COMMISSION_TRANSFER_REMARKS,
  });
  return response.data?.data ?? response.data;
}
