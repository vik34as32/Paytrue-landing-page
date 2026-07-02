import { createSlice } from "@reduxjs/toolkit";
import { createInitialWalletState, getWalletRoleKey } from "@/src/lib/walletUtils";
import {
  fetchWalletBalance,
  refreshWalletBalance,
  transferWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";

const initialState = createInitialWalletState();

function applyWalletToRole(state, role, wallet) {
  const key = getWalletRoleKey(role);
  state[key] = {
    ...state[key],
    ...wallet,
    lastUpdated:
      wallet.lastUpdated ?? new Date().toISOString(),
    loading: false,
    error: null,
  };
}

function setRoleLoading(state, role, loading) {
  const key = getWalletRoleKey(role);
  if (state[key]) {
    state[key].loading = loading;
    if (loading) state[key].error = null;
  }
}

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    debitMdWallet(state, action) {
      state.md.balance -= action.payload;
      state.md.availableBalance -= action.payload;
      state.md.currentBalance -= action.payload;
    },
    creditMdWallet(state, action) {
      state.md.balance += action.payload;
      state.md.availableBalance += action.payload;
      state.md.currentBalance += action.payload;
    },
    debitDdWallet(state, action) {
      state.dd.balance -= action.payload;
      state.dd.availableBalance -= action.payload;
      state.dd.currentBalance -= action.payload;
    },
    creditDdWallet(state, action) {
      state.dd.balance += action.payload;
      state.dd.availableBalance += action.payload;
      state.dd.currentBalance += action.payload;
    },
    setTransferHistoryQuery(state, action) {
      Object.assign(state.history, action.payload);
    },
    clearTransferError(state) {
      state.transfer.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state, action) => {
        const role = action.meta.arg?.role;
        if (role) setRoleLoading(state, role, true);
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        applyWalletToRole(state, action.payload.role, action.payload.wallet);
        const ledgerEntries = action.payload.ledgerEntries;
        if (Array.isArray(ledgerEntries) && ledgerEntries.length > 0) {
          state.history.list = ledgerEntries;
          state.history.total = ledgerEntries.length;
          state.history.loading = false;
          state.history.error = null;
        }
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        const role = action.meta.arg?.role;
        if (role) {
          const key = getWalletRoleKey(role);
          state[key].loading = false;
          state[key].error = action.payload;
        }
      })
      .addCase(refreshWalletBalance.fulfilled, (state, action) => {
        const key = getWalletRoleKey(action.payload.role);
        state[key].balance = action.payload.balance;
        state[key].availableBalance = action.payload.balance;
      })
      .addCase(transferWalletBalance.pending, (state) => {
        state.transfer.loading = true;
        state.transfer.error = null;
      })
      .addCase(transferWalletBalance.fulfilled, (state) => {
        state.transfer.loading = false;
      })
      .addCase(transferWalletBalance.rejected, (state, action) => {
        state.transfer.loading = false;
        state.transfer.error = action.payload;
      })
      .addCase(fetchTransferHistory.pending, (state) => {
        state.history.loading = true;
        state.history.error = null;
      })
      .addCase(fetchTransferHistory.fulfilled, (state, action) => {
        state.history.loading = false;
        state.history.list = action.payload.list;
        state.history.total = action.payload.total;
        state.history.page = action.payload.page;
        state.history.limit = action.payload.limit;
        state.history.search = action.payload.search;
        state.history.sortBy = action.payload.sortBy;
        state.history.sortOrder = action.payload.sortOrder;
        state.history.dateFrom = action.payload.dateFrom;
        state.history.dateTo = action.payload.dateTo;
      })
      .addCase(fetchTransferHistory.rejected, (state, action) => {
        state.history.loading = false;
        state.history.error = action.payload;
      });
  },
});

export const {
  debitMdWallet,
  creditMdWallet,
  debitDdWallet,
  creditDdWallet,
  setTransferHistoryQuery,
  clearTransferError,
} = walletSlice.actions;

export default walletSlice.reducer;

export const selectMdWallet = (state) => state.wallet.md;
export const selectDdWallet = (state) => state.wallet.dd;
export const selectRtWallet = (state) => state.wallet.rt;
export const selectWalletTransfer = (state) => state.wallet.transfer;
export const selectTransferHistory = (state) => state.wallet.history;

export function selectWalletByRole(role) {
  return (state) => {
    const key = getWalletRoleKey(role);
    return state.wallet[key];
  };
}
