import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import { mapApiUserShape } from "@/src/lib/retailerListUtils";
import { normalizeDistributor } from "@/src/lib/distributorListUtils";

export const fetchDistributors = createAsyncThunk(
  "distributor/fetchAll",
  async (
    { page = 1, limit = 100, search = "", sortBy = "createdAt", sortOrder = "desc" } = {},
    { rejectWithValue }
  ) => {
    try {
      const params = {
        page,
        limit,
        userType: "DISTRIBUTOR",
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
        list: rows.map((row) => normalizeDistributor(mapApiUserShape(row))),
        total,
        page,
        limit,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch distributors");
    }
  }
);

export const fetchDistributorById = createAsyncThunk(
  "distributor/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.users}/${id}`);
      const data = response.data?.data || response.data;
      return normalizeDistributor(mapApiUserShape(data));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch distributor");
    }
  }
);

export const createDistributor = createAsyncThunk(
  "distributor/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.users, formData);
      const data = response.data?.data || response.data;
      return normalizeDistributor(mapApiUserShape(data));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to create distributor");
    }
  }
);

export const updateDistributor = createAsyncThunk(
  "distributor/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_ENDPOINTS.users}/${id}`, formData);
      const result = response.data?.data || response.data;
      return normalizeDistributor(mapApiUserShape(result));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update distributor");
    }
  }
);

export const toggleDistributorStatus = createAsyncThunk(
  "distributor/toggleStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.users}/${id}/status`, {
        status,
        isActive: status === "active",
      });
      const result = response.data?.data || response.data;
      return normalizeDistributor(mapApiUserShape(result || { id, status }));
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update status");
    }
  }
);

export const deleteDistributor = createAsyncThunk(
  "distributor/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`${API_ENDPOINTS.users}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete distributor");
    }
  }
);
