import { createSlice } from "@reduxjs/toolkit";
import {
  mdDashboardValues,
  ddDashboardValues,
} from "@/src/mock/dashboardData";
import { fetchMdDashboard, fetchDdDashboard } from "@/src/redux/thunks/dashboardThunk";

const initialState = {
  md: {
    stats: mdDashboardValues,
    loading: false,
    error: null,
  },
  dd: {
    stats: ddDashboardValues,
    loading: false,
    error: null,
  },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateMdWalletBalance(state, action) {
      state.md.stats.walletBalance = action.payload;
    },
    updateDdWalletBalance(state, action) {
      state.dd.stats.walletBalance = action.payload;
    },
    updateMdDistributorCount(state, action) {
      state.md.stats.totalDistributors = action.payload;
    },
    updateDdRetailerCount(state, action) {
      state.dd.stats.totalRetailers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMdDashboard.pending, (state) => {
        state.md.loading = true;
        state.md.error = null;
      })
      .addCase(fetchMdDashboard.fulfilled, (state, action) => {
        state.md.loading = false;
        state.md.stats = action.payload;
      })
      .addCase(fetchMdDashboard.rejected, (state, action) => {
        state.md.loading = false;
        state.md.error = action.payload;
      })
      .addCase(fetchDdDashboard.pending, (state) => {
        state.dd.loading = true;
        state.dd.error = null;
      })
      .addCase(fetchDdDashboard.fulfilled, (state, action) => {
        state.dd.loading = false;
        state.dd.stats = action.payload;
      })
      .addCase(fetchDdDashboard.rejected, (state, action) => {
        state.dd.loading = false;
        state.dd.error = action.payload;
      });
  },
});

export const {
  updateMdWalletBalance,
  updateDdWalletBalance,
  updateMdDistributorCount,
  updateDdRetailerCount,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;

export const selectMdDashboard = (state) => state.dashboard.md;
export const selectDdDashboard = (state) => state.dashboard.dd;
