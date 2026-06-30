import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import { setUserCookie, getAccessToken } from "@/src/lib/cookies";
import { normalizeUser } from "@/src/lib/authUtils";

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAccessToken();
      if (!token) return rejectWithValue("Not authenticated");

      const response = await api.get(API_ENDPOINTS.profile);
      const profile = response.data?.data || response.data;
      const normalized = normalizeUser(profile);

      setUserCookie(profile, false);
      return normalized;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch profile");
    }
  }
);
