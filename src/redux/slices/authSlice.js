import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  hydrateAuth,
  logoutUser,
  verifyLoginOtp,
} from "@/src/redux/thunks/authThunk";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  hydrated: false,
  loading: false,
  error: null,
  remember: false,
};

function errorMessage(payload) {
  if (!payload) return "Something went wrong";
  if (typeof payload === "string") return payload;
  return payload.message || "Something went wrong";
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setAuthenticatedUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        if (action.payload?.requiresOtp) {
          state.isAuthenticated = false;
          state.accessToken = null;
          state.refreshToken = null;
          state.user = null;
          state.remember = Boolean(action.payload.remember);
          return;
        }
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.remember = action.payload.remember;
        state.hydrated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = errorMessage(action.payload);
        state.isAuthenticated = false;
      })
      .addCase(verifyLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.remember = action.payload.remember;
        state.hydrated = true;
        state.error = null;
      })
      .addCase(verifyLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = errorMessage(action.payload);
      })
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.hydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.hydrated = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, { ...initialState, hydrated: true });
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        const prev = state.user;
        const next = action.payload;
        const prevId = prev?.id || prev?._id;
        const nextId = next?.id || next?._id;
        state.user = {
          ...prev,
          ...next,
          // Keep UUID if profile payload omitted it
          id: nextId || prevId || next?.id,
          _id: next?._id || prev?._id || nextId || prevId,
        };
      });
  },
});

export const { clearAuthError, setAuthenticatedUser } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthHydrated = (state) => state.auth.hydrated;

/** Backward-compatible selectors for portal layouts */
export const selectMdUser = (state) => {
  const user = state.auth.user;
  if (user?.userType === "MASTER_DISTRIBUTOR") return user;
  return null;
};

export const selectDdUser = (state) => {
  const user = state.auth.user;
  if (user?.userType === "DISTRIBUTOR") return user;
  return null;
};

export const selectActiveRole = (state) => state.auth.user?.userType || null;
