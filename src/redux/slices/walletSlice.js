import { createSlice } from "@reduxjs/toolkit";
import { mdDashboardValues, ddDashboardValues } from "@/src/mock/dashboardData";
import { fetchWalletBalance, refreshWalletBalance } from "@/src/redux/thunks/walletThunk";

const initialState = {
  md: {
    balance: mdDashboardValues.walletBalance,
    loading: false,
    error: null,
  },
  dd: {
    balance: ddDashboardValues.walletBalance,
    loading: false,
    error: null,
  },
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    debitMdWallet(state, action) {
      state.md.balance -= action.payload;
    },
    creditMdWallet(state, action) {
      state.md.balance += action.payload;
    },
    debitDdWallet(state, action) {
      state.dd.balance -= action.payload;
    },
    creditDdWallet(state, action) {
      state.dd.balance += action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.md.loading = true;
        state.dd.loading = true;
        state.md.error = null;
        state.dd.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.md.loading = false;
        state.dd.loading = false;
        state.md.balance = action.payload.mdBalance;
        state.dd.balance = action.payload.ddBalance;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.md.loading = false;
        state.dd.loading = false;
        state.md.error = action.payload;
        state.dd.error = action.payload;
      })
      .addCase(refreshWalletBalance.fulfilled, (state, action) => {
        if (action.payload.role === "md") {
          state.md.balance = action.payload.balance;
        } else if (action.payload.role === "dd") {
          state.dd.balance = action.payload.balance;
        }
      });
  },
});

export const { debitMdWallet, creditMdWallet, debitDdWallet, creditDdWallet } =
  walletSlice.actions;

export default walletSlice.reducer;

export const selectMdWallet = (state) => state.wallet.md;
export const selectDdWallet = (state) => state.wallet.dd;
