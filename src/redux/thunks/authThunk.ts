import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearAuthCookies, getAccessToken, getUserCookie } from "@/src/lib/cookies";
import { clearClientSession } from "@/src/lib/sessionCleanup";
import { normalizeUser } from "@/src/lib/authUtils";
import {
  clearLoginOtpSession,
  saveLoginOtpSession,
} from "@/src/lib/loginOtpSession";
import {
  loginWithPassword,
  recoverOtpChallengeFromError,
  toLoginOtpApiError,
  verifyLoginOtp as verifyLoginOtpRequest,
} from "@/src/services/loginOtpService";
import {
  canLoginWithoutOtp,
  isLoginWithoutOtpEligibleRole,
} from "@/src/services/permissionService";
import type { NormalizedAuthUser } from "@/src/types/authLogin";

export type LoginUserArg = {
  email?: string;
  mobile?: string;
  password: string;
  remember?: boolean;
};

export type LoginUserResult =
  | {
      requiresOtp: true;
      loginToken: string;
      message: string;
      remember: boolean;
    }
  | {
      requiresOtp: false;
      accessToken: string;
      refreshToken: string | null;
      user: NormalizedAuthUser | null;
      remember: boolean;
      message?: string;
    };

export type VerifyLoginOtpArg = {
  loginToken: string;
  otp: string;
  remember?: boolean;
};

export type VerifyLoginOtpResult = {
  accessToken: string;
  refreshToken: string | null;
  user: NormalizedAuthUser | null;
  remember: boolean;
  message: string;
};

export type AuthRejectValue = {
  status?: number;
  message: string;
  locked?: boolean;
  remainingAttempts?: number | null;
  expired?: boolean;
  data?: unknown;
};

/**
 * Login with email OR mobile.
 * May return OTP challenge (requiresOtp) instead of JWT.
 *
 * For RETAILER / DISTRIBUTOR / MASTER_DISTRIBUTOR: after a direct JWT login,
 * LOGIN_WITHOUT_OTP is checked via the permissions API. Only allowed === true
 * skips the OTP screen; otherwise session is cleared (fail closed → OTP).
 * ADMIN / SUPER_ADMIN: unchanged — JWT login proceeds without this check.
 */
export const loginUser = createAsyncThunk<
  LoginUserResult,
  LoginUserArg,
  { rejectValue: AuthRejectValue }
>("auth/login", async ({ email, mobile, password, remember }, { rejectWithValue }) => {
  const normalizedEmail = email?.trim().toLowerCase() || "";
  const normalizedMobile = String(mobile ?? "")
    .replace(/\D/g, "")
    .replace(/^91(?=\d{10}$)/, "");
  const identifierHint = normalizedEmail || normalizedMobile || "";

  try {
    if (!normalizedEmail && !normalizedMobile) {
      return rejectWithValue({
        status: 400,
        message: "Email or mobile number is required",
      });
    }

    const result = await loginWithPassword({
      email: normalizedEmail || undefined,
      mobile: normalizedMobile || undefined,
      password,
      remember: Boolean(remember),
    });

    if (result.kind === "otp_required") {
      // Backend issued OTP challenge — keep existing OTP flow (no permission bypass).
      saveLoginOtpSession({
        loginToken: result.loginToken,
        remember: result.remember,
        identifierHint,
      });
      return {
        requiresOtp: true as const,
        loginToken: result.loginToken,
        message: result.message,
        remember: result.remember,
      };
    }

    const userType = result.user?.userType;

    // Eligible portal roles: JWT alone is not enough — confirm LOGIN_WITHOUT_OTP.
    if (isLoginWithoutOtpEligibleRole(userType)) {
      const allowed = await canLoginWithoutOtp(userType, {
        accessToken: result.accessToken,
        permissions: result.permissions ?? undefined,
      });

      if (!allowed) {
        // Fail closed for OTP UI — but keep cookies only if we can continue OTP.
        // Never leave a half-cleared session that breaks /wallet afterwards.
        if (result.loginToken && result.loginToken !== result.accessToken) {
          clearAuthCookies();
          saveLoginOtpSession({
            loginToken: result.loginToken,
            remember: result.remember,
            identifierHint,
          });
          return {
            requiresOtp: true as const,
            loginToken: result.loginToken,
            message:
              result.message ||
              "OTP verification is required. Please enter the OTP sent to you.",
            remember: result.remember,
          };
        }

        // Login already issued the session JWT as loginToken (= accessToken).
        // Clearing it would break /wallet & biometric-status — keep session and
        // require OTP only when we have a separate challenge token.
        clearAuthCookies();
        clearLoginOtpSession();
        return rejectWithValue({
          status: 403,
          message:
            "OTP verification is required for this account. Please try logging in again to receive an OTP.",
        });
      }
    }
    // ADMIN / SUPER_ADMIN (and any other non-eligible role): existing direct JWT flow.

    return {
      requiresOtp: false as const,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      remember: result.remember,
      message: result.message,
    };
  } catch (error) {
    const recovered = recoverOtpChallengeFromError(error);
    if (recovered?.loginToken) {
      saveLoginOtpSession({
        loginToken: recovered.loginToken,
        remember: Boolean(remember),
        identifierHint,
      });
      return {
        requiresOtp: true as const,
        loginToken: recovered.loginToken,
        message: recovered.message,
        remember: Boolean(remember),
      };
    }

    const mapped = toLoginOtpApiError(error, "Login failed");
    return rejectWithValue({
      status: mapped.status,
      message: mapped.message,
      locked: mapped.locked,
      remainingAttempts: mapped.remainingAttempts,
      data: mapped.data,
    });
  }
});

export const verifyLoginOtp = createAsyncThunk<
  VerifyLoginOtpResult,
  VerifyLoginOtpArg,
  { rejectValue: AuthRejectValue }
>("auth/verifyLoginOtp", async ({ loginToken, otp, remember }, { rejectWithValue }) => {
  try {
    const result = await verifyLoginOtpRequest({
      loginToken,
      otp,
      remember: Boolean(remember),
    });
    clearLoginOtpSession();
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      remember: Boolean(remember),
      message: result.message,
    };
  } catch (error) {
    const mapped = toLoginOtpApiError(error, "Invalid OTP");
    return rejectWithValue({
      status: mapped.status,
      message: mapped.message,
      remainingAttempts: mapped.remainingAttempts,
      locked: mapped.locked,
      expired: mapped.expired,
    });
  }
});

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
      const err = error as { message?: string };
      return rejectWithValue(err.message || "Session restore failed");
    }
  }
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  clearLoginOtpSession();
  clearClientSession({ resetStore: true });
  return null;
});
