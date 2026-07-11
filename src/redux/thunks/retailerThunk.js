import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  mapApiUserShape,
  normalizeRetailer,
} from "@/src/lib/retailerListUtils";

export const fetchRetailers = createAsyncThunk(
  "retailer/fetchAll",
  async (
    { page = 1, limit = 100, search = "", sortBy = "createdAt", sortOrder = "desc" } = {},
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
        payload?.meta?.total ||
        payload?.pagination?.total ||
        rows.length;

      return {
        list: rows.map((row) => normalizeRetailer(mapApiUserShape(row))),
        total,
        page,
        limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch retailers");
    }
  }
);

export const fetchRetailerById = createAsyncThunk(
  "retailer/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.users}/${id}`);
      const data = response.data?.data || response.data;
      return normalizeRetailer(mapApiUserShape(data));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch retailer");
    }
  }
);

export const createRetailer = createAsyncThunk(
  "retailer/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.users, formData);
      const data = response.data?.data || response.data;
      return normalizeRetailer(mapApiUserShape(data));
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
      return normalizeRetailer(mapApiUserShape(result));
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
      return normalizeRetailer(
        mapApiUserShape(result || { id, status })
      );
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
