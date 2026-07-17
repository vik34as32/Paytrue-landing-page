import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import {
  persistAuthSession,
  getAccessToken,
  getUserCookie,
} from "@/src/lib/cookies";
import { clearClientSession } from "@/src/lib/sessionCleanup";
import { extractAuthPayload, normalizeUser } from "@/src/lib/authUtils";

/**
 * Login with email OR mobile.
 * Payload sent to API:
 *   { email, password }  when email is provided
 *   { mobile, password } when mobile is provided
 */
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, mobile, password, remember }, { rejectWithValue }) => {
    try {
      const normalizedEmail = email?.trim().toLowerCase() || "";
      const normalizedMobile = String(mobile ?? "")
        .replace(/\D/g, "")
        .replace(/^91(?=\d{10}$)/, "");

      if (!normalizedEmail && !normalizedMobile) {
        return rejectWithValue("Email or mobile number is required");
      }

      const body = normalizedEmail
        ? { email: normalizedEmail, password }
        : { mobile: normalizedMobile, password };

      const response = await api.post(API_ENDPOINTS.login, body);
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
  clearClientSession({ resetStore: true });
  return null;
});
