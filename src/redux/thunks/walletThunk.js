import { createAsyncThunk } from "@reduxjs/toolkit";
import { mdDashboardValues, ddDashboardValues } from "@/src/mock/dashboardData";
import { delay } from "@/src/redux/utils";

export const fetchWalletBalance = createAsyncThunk(
  "wallet/fetchBalance",
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      // Future API:
      // const [md, dd] = await Promise.all([
      //   api.get("/md/wallet"),
      //   api.get("/dd/wallet"),
      // ]);
      return {
        mdBalance: mdDashboardValues.walletBalance,
        ddBalance: ddDashboardValues.walletBalance,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch wallet balance");
    }
  }
);

export const refreshWalletBalance = createAsyncThunk(
  "wallet/refreshBalance",
  async (role, { getState, rejectWithValue }) => {
    try {
      await delay(200);
      // Future API: return (await api.get(`/${role}/wallet`)).data.balance;
      const balance =
        role === "md"
          ? getState().wallet.md.balance
          : getState().wallet.dd.balance;
      return { role, balance };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to refresh wallet");
    }
  }
);
