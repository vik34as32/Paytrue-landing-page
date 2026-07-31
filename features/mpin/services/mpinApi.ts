import { API_BASE_URL, API_ENDPOINTS } from "@/src/constants/api";
import { getAccessToken } from "@/src/lib/cookies";
import type {
  ChangeMpinPayload,
  CreateMpinPayload,
  MpinActionResult,
  MpinStatus,
  MpinVerifyApiError,
  VerifyMpinPayload,
  VerifyMpinResult,
} from "../types";

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
  body: Record<string, string>
): Promise<{ status: number; data: unknown }> {
  // Guarantee every value is a non-empty string before send
  const safeBody: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    const trimmed = String(value ?? "").trim();
    if (trimmed) safeBody[key] = trimmed;
  }

  if (Object.keys(safeBody).length === 0) {
    throw {
      status: 400,
      message: "Request body is empty",
      data: { message: "Request body is empty" },
    };
  }

  // Explicit stringify — never pass undefined keys
  const raw = JSON.stringify(safeBody);
  const token = getAccessToken();

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
