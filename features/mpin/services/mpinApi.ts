import { API_BASE_URL, API_ENDPOINTS } from "@/src/constants/api";
import { getAccessToken } from "@/src/lib/cookies";
import type {
  ChangeMpinPayload,
  CreateMpinPayload,
  ForgotMpinOtpResult,
  ForgotMpinPayload,
  MpinActionResult,
  MpinStatus,
  MpinVerifyApiError,
  ResetMpinPayload,
  VerifyForgotMpinOtpPayload,
  VerifyForgotMpinOtpResult,
  VerifyMpinPayload,
  VerifyMpinResult,
} from "../types";
import { MPIN_WEAK_MESSAGE, RETAILER_MOBILE_REGEX, WEAK_MPINS } from "../schemas";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function unwrap(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  return Object.keys(data).length ? data : root;
}

function pickMessage(payload: unknown, fallback: string): string {
  const root = asRecord(payload);
  const data = unwrap(payload);
  return String(root.message || data.message || fallback);
}

function pickAttempts(payload: unknown): number | null {
  const data = unwrap(payload);
  const root = asRecord(payload);
  const value =
    data.attemptsRemaining ??
    data.remainingAttempts ??
    data.attemptsLeft ??
    root.attemptsRemaining ??
    root.remainingAttempts;
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isLockedPayload(status: number | undefined, payload: unknown): boolean {
  if (status === 403) return true;
  const data = unwrap(payload);
  const root = asRecord(payload);
  const message = pickMessage(payload, "").toLowerCase();
  return Boolean(
    data.locked ||
      data.isLocked ||
      root.locked ||
      root.isLocked ||
      message.includes("locked") ||
      message.includes("temporarily lock")
  );
}

export function mapMpinApiError(error: unknown, fallback = "Request failed"): string {
  const err = error as {
    message?: string;
    data?: {
      message?: string;
      error?: string;
      code?: string;
      errors?: Array<{ field?: string; message?: string }>;
    };
    response?: {
      data?: {
        message?: string;
        error?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    };
  };

  const payload = err?.data || err?.response?.data;
  const fieldError = payload?.errors?.[0]?.message;
  if (fieldError) {
    const field = payload?.errors?.[0]?.field;
    return field ? `${field}: ${fieldError}` : fieldError;
  }

  return payload?.message || payload?.error || err?.message || fallback;
}

export function toMpinVerifyApiError(
  error: unknown,
  fallback = "Invalid MPIN"
): MpinVerifyApiError {
  const err = error as {
    message?: string;
    status?: number;
    data?: unknown;
    attemptsRemaining?: number | null;
    locked?: boolean;
  };
  const payload = err.data ?? err;
  const status = err.status;
  const locked = Boolean(err.locked) || isLockedPayload(status, payload);
  return {
    message: locked
      ? mapMpinApiError(error, "Your account has been temporarily locked")
      : mapMpinApiError(error, fallback),
    status,
    attemptsRemaining: err.attemptsRemaining ?? pickAttempts(payload),
    locked,
    data: payload,
  };
}

/**
 * POST JSON via fetch so `mpin` is never dropped by axios serializers / AxiosHeaders.
 * Backend error "must have required property 'mpin'" was caused by empty/malformed body.
 */
async function postMpinJson(
  path: string,
  body: Record<string, string>,
  options?: { allowEmpty?: boolean; skipAuth?: boolean }
): Promise<{ status: number; data: unknown }> {
  // Guarantee every value is a non-empty string before send
  const safeBody: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    const trimmed = String(value ?? "").trim();
    if (trimmed) safeBody[key] = trimmed;
  }

  if (!options?.allowEmpty && Object.keys(safeBody).length === 0) {
    throw {
      status: 400,
      message: "Request body is empty",
      data: { message: "Request body is empty" },
    };
  }

  // Explicit stringify — never pass undefined keys
  const raw = JSON.stringify(safeBody);
  const token = options?.skipAuth ? "" : getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: raw,
  });

  let data: unknown = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: pickMessage(data, "Request failed"),
      data,
      locked: isLockedPayload(response.status, data),
      attemptsRemaining: pickAttempts(data),
    };
  }

  return { status: response.status, data };
}

export async function fetchMpinStatus(): Promise<MpinStatus> {
  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.mpinStatus}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let payload: unknown = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: pickMessage(payload, "Unable to fetch MPIN status"),
      data: payload,
    };
  }

  const data = unwrap(payload);
  const root = asRecord(payload);

  const isMpinCreated = Boolean(
    data.isMpinCreated ??
      data.mpinCreated ??
      data.hasMpin ??
      data.isCreated ??
      root.isMpinCreated
  );

  return {
    isMpinCreated,
    isLocked: Boolean(data.isLocked ?? data.locked),
    lockedUntil: data.lockedUntil ? String(data.lockedUntil) : null,
    attemptsRemaining:
      data.attemptsRemaining != null ? Number(data.attemptsRemaining) : null,
    message: pickMessage(payload, "MPIN status retrieved"),
  };
}

export async function createMpin(
  payload: CreateMpinPayload
): Promise<MpinActionResult> {
  const mpin = String(payload?.mpin ?? "").replace(/\D/g, "");
  const confirmMpin = String(payload?.confirmMpin ?? "").replace(/\D/g, "");

  if (!mpin || !confirmMpin) {
    throw { status: 400, message: "MPIN and Confirm MPIN are required", data: null };
  }

  const { data } = await postMpinJson(API_ENDPOINTS.mpinCreate, {
    mpin,
    confirmMpin,
  });

  return {
    success: Boolean(asRecord(data).success ?? true),
    message: pickMessage(data, "MPIN created successfully"),
  };
}

export async function changeMpin(
  payload: ChangeMpinPayload
): Promise<MpinActionResult> {
  const oldMpin = String(payload?.oldMpin ?? "").replace(/\D/g, "");
  const newMpin = String(payload?.newMpin ?? "").replace(/\D/g, "");
  const confirmMpin = String(payload?.confirmMpin ?? "").replace(/\D/g, "");

  if (!oldMpin || !newMpin || !confirmMpin) {
    throw {
      status: 400,
      message: "Old MPIN, New MPIN and Confirm MPIN are required",
      data: null,
    };
  }

  const { data } = await postMpinJson(API_ENDPOINTS.mpinChange, {
    oldMpin,
    newMpin,
    confirmMpin,
  });

  return {
    success: Boolean(asRecord(data).success ?? true),
    message: pickMessage(data, "MPIN changed successfully"),
  };
}

/**
 * Verify retailer MPIN.
 * Always sends `{ "mpin": "1234" }` as a real JSON body (never empty / never dropped).
 */
export async function verifyMpin(
  payload: VerifyMpinPayload
): Promise<VerifyMpinResult> {
  const mpin = String(payload?.mpin ?? "").replace(/\D/g, "");

  if (!/^\d{4}$/.test(mpin)) {
    throw toMpinVerifyApiError(
      { message: "MPIN must be exactly 4 digits", status: 400, data: null },
      "MPIN must be exactly 4 digits"
    );
  }

  try {
    const { data } = await postMpinJson(API_ENDPOINTS.mpinVerify, { mpin });

    const nested = unwrap(data);
    const root = asRecord(data);
    const verified = Boolean(
      nested.verified ?? nested.success ?? root.verified ?? root.success ?? true
    );
    const attemptsRemaining = pickAttempts(data);

    if (!verified) {
      throw {
        message: pickMessage(data, "Invalid MPIN"),
        status: 400,
        attemptsRemaining,
        locked: isLockedPayload(undefined, data),
        data,
      } satisfies MpinVerifyApiError;
    }

    return {
      verified: true,
      message: pickMessage(data, "MPIN verified successfully"),
      attemptsRemaining,
      locked: false,
    };
  } catch (error) {
    throw toMpinVerifyApiError(error, "Invalid MPIN");
  }
}

function pickStringField(payload: unknown, ...keys: string[]): string {
  const data = unwrap(payload);
  const root = asRecord(payload);
  for (const key of keys) {
    const value = data[key] ?? root[key];
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return "";
}

function pickExpiresInSeconds(payload: unknown): number | null {
  const data = unwrap(payload);
  const root = asRecord(payload);
  const value =
    data.expiresInSeconds ??
    data.expiresIn ??
    data.otpExpiresIn ??
    root.expiresInSeconds ??
    root.expiresIn;
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function mapForgotMpinError(error: unknown, fallback: string): never {
  const status = (error as { status?: number })?.status;
  const mapped = mapMpinApiError(error, fallback);
  const message = mapped.toLowerCase();
  const wrap = (next: string): never => {
    throw { ...(typeof error === "object" && error ? error : {}), message: next };
  };

  if (status === 429 || message.includes("too many") || message.includes("rate limit")) {
    wrap("Too many attempts. Please wait a minute and try again.");
  }
  if (message.includes("expired") && message.includes("otp")) {
    wrap("OTP has expired. Please resend OTP.");
  }
  if (message.includes("invalid otp") || message.includes("incorrect otp") || message.includes("wrong otp")) {
    wrap("Invalid OTP. Please try again.");
  }
  if (
    message.includes("weak") ||
    message.includes("stronger mpin") ||
    message.includes("0000")
  ) {
    wrap(MPIN_WEAK_MESSAGE);
  }
  if (message.includes("mismatch") || message.includes("do not match") || message.includes("must match")) {
    wrap("New MPIN and Confirm MPIN must match");
  }
  if (
    message.includes("reset token") ||
    message.includes("reset session") ||
    message.includes("invalid token")
  ) {
    wrap("Reset session expired. Please verify OTP again.");
  }
  throw error;
}

export function resolveRetailerMobile(user: unknown): string {
  const record = asRecord(user);
  const nested = asRecord(record.profile);
  const raw =
    record.mobile ??
    record.phone ??
    record.mobileNumber ??
    record.phoneNumber ??
    nested.mobile ??
    nested.phone;
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

function requireForgotMobile(mobile: string): string {
  const digits = String(mobile ?? "").replace(/\D/g, "").slice(-10);
  if (!RETAILER_MOBILE_REGEX.test(digits)) {
    throw {
      status: 400,
      message: "Registered mobile number is missing or invalid.",
      data: null,
    };
  }
  return digits;
}

/** POST /auth/mpin/forgot — unauthenticated; body `{ mobile }`. No current MPIN. */
export async function requestForgotMpinOtp(
  payload: ForgotMpinPayload
): Promise<ForgotMpinOtpResult> {
  const mobile = requireForgotMobile(payload?.mobile);
  try {
    const { data } = await postMpinJson(
      API_ENDPOINTS.mpinForgot,
      { mobile },
      { skipAuth: true }
    );
    return {
      success: Boolean(asRecord(data).success ?? true),
      message: pickMessage(data, "OTP sent successfully"),
      mobileMasked: maskRegisteredMobile(mobile),
      expiresInSeconds: pickExpiresInSeconds(data) ?? 300,
    };
  } catch (error) {
    mapForgotMpinError(error, "Unable to send OTP");
  }
}

/** Same as forgot — backend has no separate resend route. */
export async function resendForgotMpinOtp(
  payload: ForgotMpinPayload
): Promise<ForgotMpinOtpResult> {
  const result = await requestForgotMpinOtp(payload);
  return {
    ...result,
    message: result.message || "OTP resent to your registered mobile number",
  };
}

/** POST /auth/mpin/verify-otp — `{ mobile, otp }` → single-use resetToken (10 min). */
export async function verifyForgotMpinOtp(
  payload: VerifyForgotMpinOtpPayload
): Promise<VerifyForgotMpinOtpResult> {
  const mobile = requireForgotMobile(payload?.mobile);
  const cleaned = String(payload?.otp ?? "").replace(/\D/g, "");
  if (!/^\d{6}$/.test(cleaned)) {
    throw { status: 400, message: "OTP must be exactly 6 digits", data: null };
  }

  try {
    const { data } = await postMpinJson(
      API_ENDPOINTS.mpinForgotVerifyOtp,
      { mobile, otp: cleaned },
      { skipAuth: true }
    );
    const resetToken = pickStringField(
      data,
      "resetToken",
      "mpinResetToken",
      "token"
    );
    if (!resetToken || resetToken.length < 20) {
      throw {
        status: 400,
        message: "Unable to start MPIN reset. Please try again.",
        data,
      };
    }
    return {
      success: true,
      message: pickMessage(data, "OTP verified successfully"),
      resetToken,
    };
  } catch (error) {
    mapForgotMpinError(error, "Invalid or expired OTP");
  }
}

/** POST /auth/mpin/reset — `{ resetToken, newMpin, confirmMpin }`. No current MPIN. */
export async function resetMpin(
  payload: ResetMpinPayload
): Promise<MpinActionResult> {
  const resetToken = String(payload?.resetToken ?? "").trim();
  const newMpin = String(payload?.newMpin ?? "").replace(/\D/g, "");
  const confirmMpin = String(payload?.confirmMpin ?? "").replace(/\D/g, "");

  if (!resetToken || resetToken.length < 20) {
    throw {
      status: 400,
      message: "Reset session expired. Please verify OTP again.",
      data: null,
    };
  }
  if (!newMpin || !confirmMpin) {
    throw {
      status: 400,
      message: "New MPIN and Confirm MPIN are required",
      data: null,
    };
  }
  if (newMpin !== confirmMpin) {
    throw {
      status: 400,
      message: "New MPIN and Confirm MPIN must match",
      data: null,
    };
  }
  if ((WEAK_MPINS as readonly string[]).includes(newMpin)) {
    throw {
      status: 400,
      message: MPIN_WEAK_MESSAGE,
      data: null,
    };
  }

  try {
    const { data } = await postMpinJson(
      API_ENDPOINTS.mpinReset,
      { resetToken, newMpin, confirmMpin },
      { skipAuth: true }
    );
    return {
      success: Boolean(asRecord(data).success ?? true),
      message: pickMessage(data, "MPIN reset successfully"),
    };
  } catch (error) {
    mapForgotMpinError(error, "Failed to reset MPIN");
  }
}

export function maskRegisteredMobile(mobile?: string | null): string {
  const digits = String(mobile || "").replace(/\D/g, "");
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  if (last10.length < 4) return "your registered mobile number";
  return `${last10.slice(0, 2)}******${last10.slice(-2)}`;
}
