import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

function computeMdStats(users = []) {
  const today = new Date().toDateString();
  const distributors = users.filter((u) => u.userType === "DISTRIBUTOR");
  const active = distributors.filter(
    (u) => u.status !== "inactive" && u.isActive !== false
  );
  const inactive = distributors.filter(
    (u) => u.status === "inactive" || u.isActive === false
  );
  const todayCreated = distributors.filter(
    (u) => u.createdAt && new Date(u.createdAt).toDateString() === today
  );

  return {
    totalDistributors: distributors.length,
    activeDistributors: active.length,
    inactiveDistributors: inactive.length,
    todayDistributors: todayCreated.length,
    recentDistributors: distributors.slice(0, 5),
    recentLogins: distributors
      .filter((u) => u.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
      .slice(0, 5),
  };
}

export const fetchMdDashboard = createAsyncThunk(
  "dashboard/fetchMd",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.users, {
        params: { page: 1, limit: 100, userType: "DISTRIBUTOR" },
      });
      const payload = response.data?.data || response.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.users || payload?.items || payload?.data || [];

      const stats = computeMdStats(rows);
      return {
        walletBalance: 0,
        todayBusiness: 0,
        todayCommission: 0,
        ...stats,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch MD dashboard");
    }
  }
);

export const fetchDdDashboard = createAsyncThunk(
  "dashboard/fetchDd",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_ENDPOINTS.users, {
        params: { page: 1, limit: 100, userType: "RETAILER" },
      });
      const payload = response.data?.data || response.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.users || payload?.items || payload?.data || [];

      return {
        walletBalance: 0,
        totalRetailers: rows.length,
        todayBusiness: 0,
        todayCommission: 0,
        recentRetailers: rows.slice(0, 5),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch DD dashboard");
    }
  }
);
