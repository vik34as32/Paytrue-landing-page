import { createAsyncThunk } from "@reduxjs/toolkit";
import { transferBalance, deductBalance } from "@/src/services/walletService";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  normalizeWalletPayload,
  normalizeTransferRecord,
  extractLedgerEntries,
  getWalletRoleKey,
} from "@/src/lib/walletUtils";

export const fetchWalletBalance = createAsyncThunk(
  "wallet/fetchBalance",
  async ({ role }, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.wallet);
      const payload = response.data?.data ?? response.data;
      return {
        role: getWalletRoleKey(role),
        wallet: normalizeWalletPayload(payload),
        ledgerEntries: extractLedgerEntries(payload),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch wallet balance");
    }
  }
);

export const refreshWalletBalance = createAsyncThunk(
  "wallet/refreshBalance",
  async (role, { dispatch, rejectWithValue }) => {
    try {
      const result = await dispatch(
        fetchWalletBalance({ role: getWalletRoleKey(role) })
      ).unwrap();
      return {
        role: result.role,
        balance: result.wallet.balance,
      };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : error?.message || "Failed to refresh wallet"
      );
    }
  }
);

export const transferWalletBalance = createAsyncThunk(
  "wallet/transfer",
  async ({ receiverId, amount, description, role }, { rejectWithValue }) => {
    try {
      const data = await transferBalance({
        receiverId,
        amount,
        description: description || "Wallet Transfer",
      });
      return {
        role: getWalletRoleKey(role),
        data,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Transfer failed");
    }
  }
);

export const deductWalletBalance = createAsyncThunk(
  "wallet/deduct",
  async ({ userId, amount, description, role }, { rejectWithValue }) => {
    try {
      const data = await deductBalance({
        userId,
        amount,
        description: description || "Wallet Deduction",
      });
      return {
        role: getWalletRoleKey(role),
        data,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Deduction failed");
    }
  }
);

export const fetchTransferHistory = createAsyncThunk(
  "wallet/fetchTransferHistory",
  async (
    {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
      dateFrom = "",
      dateTo = "",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const response = await api.get(API_ENDPOINTS.walletTransfers, { params });
      const payload = response.data?.data ?? response.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.transfers ??
          payload?.transactions ??
          payload?.history ??
          payload?.ledgerEntries ??
          payload?.ledger ??
          payload?.items ??
          payload?.data ??
          [];
      const total =
        payload?.total ??
        payload?.totalCount ??
        payload?.pagination?.total ??
        rows.length;

      return {
        list: rows.map(normalizeTransferRecord),
        total,
        page,
        limit,
        search,
        sortBy,
        sortOrder,
        dateFrom,
        dateTo,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch transfer history");
    }
  }
);
