import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import { setUserCookie, getAccessToken, getUserCookie } from "@/src/lib/cookies";
import { normalizeUser, resolveUserUuid, isUserUuid } from "@/src/lib/authUtils";
import {
  fetchUserById,
  updateUserById,
  mapUserToProfileForm,
  type RetailerProfileFormValues,
} from "@/src/services/profileApi";

type ApiError = {
  message?: string;
  originalError?: { message?: string };
};

export const fetchProfile = createAsyncThunk(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAccessToken();
      if (!token) return rejectWithValue("Not authenticated");

      const response = await api.get(API_ENDPOINTS.profile);
      const profile = response.data?.data || response.data;
      const previous = getUserCookie();

      // Merge previous session UUID so profile responses without `id` don't
      // break /users/:id and biometric-status (uuid validation).
      const normalized = normalizeUser({
        ...(previous && typeof previous === "object" ? previous : {}),
        ...profile,
        id:
          resolveUserUuid(profile) ||
          resolveUserUuid(previous) ||
          profile?.id ||
          previous?.id,
        bankAccount: profile?.bankDetails || profile?.bankAccount,
      });

      setUserCookie(normalized, false);
      return normalized;
    } catch (error) {
      const err = error as ApiError;
      const message =
        err?.message ||
        err?.originalError?.message ||
        "Failed to fetch profile";
      return rejectWithValue(message);
    }
  }
);

/** GET /users/:id — full retailer record for edit form */
export const getUserById = createAsyncThunk(
  "profile/getUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const uuid = String(id || "").trim();
      if (!uuid) return rejectWithValue("User id is required");
      if (!isUserUuid(uuid)) {
        return rejectWithValue(
          "Invalid user id. Expected a UUID — please logout and login again."
        );
      }
      const user = await fetchUserById(uuid);
      const normalized = normalizeUser({
        ...user,
        bankAccount: user?.bankDetails || user?.bankAccount,
      });
      return {
        user: normalized,
        formValues: mapUserToProfileForm(user),
      };
    } catch (error) {
      const err = error as ApiError;
      return rejectWithValue(err?.message || "Failed to load user profile");
    }
  }
);

/** PUT /users/:id — update retailer profile + GPS */
export const updateUser = createAsyncThunk(
  "profile/updateUser",
  async (
    {
      id,
      values,
    }: {
      id: string;
      values: RetailerProfileFormValues;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const uuid = String(id || "").trim();
      if (!uuid) return rejectWithValue("User id is required");
      if (!isUserUuid(uuid)) {
        return rejectWithValue(
          "Invalid user id. Expected a UUID — please logout and login again."
        );
      }
      const updated = await updateUserById(uuid, values);
      const normalized = normalizeUser({
        ...updated,
        bankAccount: updated?.bankDetails || updated?.bankAccount,
      });
      setUserCookie(normalized, false);
      await dispatch(fetchProfile());
      return {
        user: normalized,
        formValues: mapUserToProfileForm(updated),
      };
    } catch (error) {
      const err = error as ApiError;
      return rejectWithValue(err?.message || "Failed to update profile");
    }
  }
);
