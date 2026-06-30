import { createSlice } from "@reduxjs/toolkit";
import { mdTransactions, ddTransactions } from "@/src/mock/transactionData";
import {
  fetchMdTransactions,
  fetchDdTransactions,
  transferBalanceToDistributor,
  transferBalanceToRetailer,
} from "@/src/redux/thunks/transactionThunk";

const initialState = {
  mdTransactions,
  ddTransactions,
  loading: false,
  error: null,
  actionLoading: false,
  summary: {
    totalBalanceTransferred: 0,
    totalApprovedRequests: 0,
    totalRejectedRequests: 0,
    totalFailedTransactions: 0,
  },
};

function computeDdSummary(transactions) {
  return {
    totalBalanceTransferred: transactions
      .filter(
        (t) =>
          t.transactionType === "Balance Transfer" && t.status === "success"
      )
      .reduce((sum, t) => sum + t.amount, 0),
    totalApprovedRequests: transactions.filter(
      (t) =>
        t.transactionType === "Fund Request Approval" && t.status === "success"
    ).length,
    totalRejectedRequests: transactions.filter((t) => t.status === "rejected")
      .length,
    totalFailedTransactions: transactions.filter((t) => t.status === "failed")
      .length,
  };
}

const transactionSlice = createSlice({
  name: "transaction",
  initialState: {
    ...initialState,
    summary: computeDdSummary(ddTransactions),
  },
  reducers: {
    clearTransactionError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMdTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMdTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.mdTransactions = action.payload;
      })
      .addCase(fetchMdTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDdTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDdTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.ddTransactions = action.payload;
        state.summary = computeDdSummary(action.payload);
      })
      .addCase(fetchDdTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(transferBalanceToDistributor.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(transferBalanceToDistributor.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.mdTransactions.unshift(action.payload);
      })
      .addCase(transferBalanceToDistributor.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(transferBalanceToRetailer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(transferBalanceToRetailer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.ddTransactions.unshift(action.payload);
        state.summary = computeDdSummary(state.ddTransactions);
      })
      .addCase(transferBalanceToRetailer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearTransactionError } = transactionSlice.actions;
export default transactionSlice.reducer;

export const selectMdTransactions = (state) => state.transaction.mdTransactions;
export const selectDdTransactions = (state) => state.transaction.ddTransactions;
export const selectTransactionLoading = (state) => state.transaction.loading;
export const selectTransactionActionLoading = (state) =>
  state.transaction.actionLoading;
export const selectTransactionError = (state) => state.transaction.error;
export const selectDdTransactionSummary = (state) => state.transaction.summary;
