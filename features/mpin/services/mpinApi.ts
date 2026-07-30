import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
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
    attemptsRemaining:
      err.attemptsRemaining ?? pickAttempts(payload),
    locked,
    data: payload,
  };
}

export async function fetchMpinStatus(): Promise<MpinStatus> {
  const response = await api.get(API_ENDPOINTS.mpinStatus, {
    skipSessionLogout: true,
  } as never);
  const data = unwrap(response.data);
  const root = asRecord(response.data);

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
    message: pickMessage(response.data, "MPIN status retrieved"),
  };
}

export async function createMpin(
  payload: CreateMpinPayload
): Promise<MpinActionResult> {
  const mpin = String(payload?.mpin ?? "").replace(/\D/g, "");
  const confirmMpin = String(payload?.confirmMpin ?? "").replace(/\D/g, "");

  const response = await api.post(
    API_ENDPOINTS.mpinCreate,
    JSON.stringify({ mpin, confirmMpin }),
    {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    } as never
  );
  return {
    success: Boolean(asRecord(response.data).success ?? true),
    message: pickMessage(response.data, "MPIN created successfully"),
  };
}

export async function changeMpin(
  payload: ChangeMpinPayload
): Promise<MpinActionResult> {
  const oldMpin = String(payload?.oldMpin ?? "").replace(/\D/g, "");
  const newMpin = String(payload?.newMpin ?? "").replace(/\D/g, "");
  const confirmMpin = String(payload?.confirmMpin ?? "").replace(/\D/g, "");

  const response = await api.post(
    API_ENDPOINTS.mpinChange,
    JSON.stringify({ oldMpin, newMpin, confirmMpin }),
    {
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    } as never
  );
  return {
    success: Boolean(asRecord(response.data).success ?? true),
    message: pickMessage(response.data, "MPIN changed successfully"),
  };
}

/**
 * Verify retailer MPIN.
 * Uses skipSessionLogout so HTTP 403 (account lock) does not force logout.
 */
export async function verifyMpin(
  payload: VerifyMpinPayload
): Promise<VerifyMpinResult> {
  // Always send a concrete digit string. JSON.stringify drops `undefined` keys,
  // which caused: must have required property 'mpin'.
  const mpin = String(payload?.mpin ?? "").replace(/\D/g, "");

  if (!mpin) {
    throw toMpinVerifyApiError(
      { message: "MPIN is required", status: 400 },
      "MPIN is required"
    );
  }

  const body = { mpin };

  try {
    // Explicit JSON body avoids AxiosHeaders / undefined-key issues
    // that produced: must have required property 'mpin'
    const response = await api.post(
      API_ENDPOINTS.mpinVerify,
      JSON.stringify(body),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        skipSessionLogout: true,
      } as never
    );

    const data = unwrap(response.data);
    const root = asRecord(response.data);
    const verified = Boolean(
      data.verified ?? data.success ?? root.verified ?? root.success ?? true
    );
    const attemptsRemaining = pickAttempts(response.data);

    if (!verified) {
      const error: MpinVerifyApiError = {
        message: pickMessage(response.data, "Invalid MPIN"),
        status: 400,
        attemptsRemaining,
        locked: isLockedPayload(undefined, response.data),
        data: response.data,
      };
      throw error;
    }

    return {
      verified: true,
      message: pickMessage(response.data, "MPIN verified successfully"),
      attemptsRemaining,
      locked: false,
    };
  } catch (error) {
    const mapped = toMpinVerifyApiError(error, "Invalid MPIN");
    throw mapped;
  }
}
