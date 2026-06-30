import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  persistAuthSession,
  clearAuthCookies,
  getAccessToken,
  getUserCookie,
} from "@/src/lib/cookies";
import { extractAuthPayload, normalizeUser } from "@/src/lib/authUtils";

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password, remember }, { rejectWithValue }) => {
    try {
      const response = await api.post(API_ENDPOINTS.login, { email, password });
      const { accessToken, refreshToken, user } = extractAuthPayload(response.data);

      if (!accessToken) {
        return rejectWithValue("Invalid login response: missing access token");
      }

      persistAuthSession({ accessToken, refreshToken, user, remember });
      return {
        accessToken,
        refreshToken,
        user: normalizeUser(user),
        remember,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const hydrateAuth = createAsyncThunk(
  "auth/hydrate",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAccessToken();
      const user = getUserCookie();
      if (!token) return rejectWithValue("No session");
      return {
        accessToken: token,
        user: normalizeUser(user),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Session restore failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  clearAuthCookies();
  return null;
});
