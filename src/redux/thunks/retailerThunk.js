import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

function normalizeRetailer(user) {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  return {
    id: user.id || user._id,
    retailerId: user.id || user.userId,
    name: `${firstName} ${lastName}`.trim() || user.email,
    firstName,
    lastName,
    email: user.email,
    mobile: user.mobile,
    shopName: user.outlet?.outletName || user.shopName || "",
    city: user.outlet?.city || user.city || "",
    state: user.outlet?.state || user.state || "",
    profileImage: user.profileImage,
    walletBalance: user.walletBalance || user.wallet?.balance || 0,
    status: String(user.status || (user.isActive === false ? "inactive" : "active")).toLowerCase(),
    createdAt: user.createdAt,
    raw: user,
  };
}

export const fetchRetailers = createAsyncThunk(
  "retailer/fetchAll",
  async (
    { page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = {
        page,
        limit,
        userType: "RETAILER",
      };
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const response = await api.get(API_ENDPOINTS.users, { params });
      const payload = response.data?.data || response.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.users || payload?.items || payload?.data || [];
      const total =
        payload?.total ||
        payload?.totalCount ||
        payload?.pagination?.total ||
        rows.length;

      return {
        list: rows.map(normalizeRetailer),
        total,
        page,
        limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch retailers");
    }
  }
);

export const createRetailer = createAsyncThunk(
  "retailer/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.users, formData);
      const data = response.data?.data || response.data;
      return normalizeRetailer(data);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create retailer");
    }
  }
);

export const updateRetailer = createAsyncThunk(
  "retailer/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.users}/${id}`, formData);
      const result = response.data?.data || response.data;
      return normalizeRetailer(result);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update retailer");
    }
  }
);

export const toggleRetailerStatus = createAsyncThunk(
  "retailer/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.users}/${id}/status`, {
        status,
        isActive: status === "active",
      });
      const result = response.data?.data || response.data;
      return normalizeRetailer(result || { id, status });
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

export const deleteRetailer = createAsyncThunk(
  "retailer/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_ENDPOINTS.users}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete retailer");
    }
  }
);
