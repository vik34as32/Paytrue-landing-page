import api from "@/src/lib/axios";
import { API_BASE_URL, API_ENDPOINTS } from "@/src/constants/api";
import { extractAuthPayload, normalizeUser } from "@/src/lib/authUtils";
import { persistAuthSession } from "@/src/lib/cookies";
import { extractPermissionsList } from "@/src/services/permissionService";
import type { NormalizedAuthUser } from "@/src/types/authLogin";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Case-insensitive property read */
function getProp(record: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] != null && record[key] !== "") return record[key];
  }
  const lowerMap = new Map(
    Object.keys(record).map((k) => [k.toLowerCase(), record[k]])
  );
  for (const key of keys) {
    const value = lowerMap.get(key.toLowerCase());
    if (value != null && value !== "") return value;
  }
  return undefined;
}

/** Axios sometimes leaves JSON as a string; normalize to object. */
function normalizePayload(payload: unknown): unknown {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (!trimmed) return {};
    try {
      return JSON.parse(trimmed);
    } catch {
      return { message: trimmed };
    }
  }
  return payload ?? {};
}

function unwrap(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  const rawData = root.data;

  if (Array.isArray(rawData) && rawData[0] && typeof rawData[0] === "object") {
    return asRecord(rawData[0]);
  }

  const nested = asRecord(rawData);
  return Object.keys(nested).length ? nested : root;
}

function pickMessage(payload: unknown, fallback: string): string {
  const root = asRecord(payload);
  const data = unwrap(payload);
  const raw =
    getProp(root, "message", "Message", "msg", "error", "Error") ??
    getProp(data, "message", "Message", "msg", "error", "Error") ??
    fallback;
  if (Array.isArray(raw)) return String(raw[0] || fallback);
  return String(raw || fallback);
}

function pickRemainingAttempts(payload: unknown): number | null {
  const data = unwrap(payload);
  const root = asRecord(payload);
  const value =
    getProp(data, "remainingAttempts", "attemptsRemaining", "attemptsLeft") ??
    getProp(root, "remainingAttempts", "attemptsRemaining", "attemptsLeft");
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

const SKIP_TOKEN_KEYS = new Set([
  "message",
  "msg",
  "error",
  "email",
  "mobile",
  "password",
  "name",
  "firstname",
  "lastname",
  "accesstoken",
  "refreshtoken",
  "access_token",
  "refresh_token",
]);

/**
 * Find opaque token-like strings anywhere in the payload.
 * Used when backend sends OTP success but uses a non-standard token field name.
 */
function findLikelyOpaqueToken(value: unknown, depth = 0): string {
  if (depth > 6 || value == null) return "";

  if (typeof value === "string") {
    const t = value.trim();
    if (t.length < 12) return "";
    if (/\s/.test(t)) return "";
    if (/otp has been sent/i.test(t)) return "";
    if (/^https?:/i.test(t)) return "";
    // JWT / UUID / long opaque id
    if (
      t.includes(".") ||
      /^[a-f0-9-]{20,}$/i.test(t) ||
      /^[A-Za-z0-9_-]{16,}$/.test(t)
    ) {
      return t;
    }
    return "";
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findLikelyOpaqueToken(item, depth + 1);
      if (found) return found;
    }
    return "";
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    // Prefer keys that look like tokens
    for (const [key, nested] of Object.entries(record)) {
      const lower = key.toLowerCase();
      if (SKIP_TOKEN_KEYS.has(lower)) continue;
      if (
        lower.includes("token") ||
        lower.includes("reference") ||
        lower.includes("ref") ||
        lower === "key" ||
        lower === "hash" ||
        lower === "id" ||
        lower.includes("session")
      ) {
        if (typeof nested === "string" || typeof nested === "number") {
          const token = String(nested).trim();
          if (token.length >= 8 && !/\s/.test(token)) return token;
        }
      }
    }

    for (const [key, nested] of Object.entries(record)) {
      if (SKIP_TOKEN_KEYS.has(key.toLowerCase())) continue;
      const found = findLikelyOpaqueToken(nested, depth + 1);
      if (found) return found;
    }
  }

  return "";
}

function messageSuggestsOtp(message: string): boolean {
  const lower = String(message || "").toLowerCase();
  return (
    lower.includes("otp has been sent") ||
    lower.includes("otp sent") ||
    lower.includes("verify otp") ||
    lower.includes("verify login otp") ||
    lower.includes("registered email and mobile") ||
    lower.includes("sent to your registered") ||
    lower.includes("otp sent successfully")
  );
}

/** Mobile/email must never be used as loginToken — backend rejects it. */
function looksLikeIdentifierNotToken(value: string): boolean {
  const v = value.trim();
  if (!v) return true;
  if (v.includes("@")) return true;
  if (/^\d{10}$/.test(v)) return true;
  if (/^91\d{10}$/.test(v)) return true;
  return false;
}

function isUsableLoginToken(value: unknown): string {
  const token = String(value ?? "").trim();
  if (!token) return "";
  if (looksLikeIdentifierNotToken(token)) return "";
  return token;
}

/** AxiosHeaders-safe header reader (Authorization is often where loginToken lives). */
function readResponseHeader(headers: unknown, name: string): string {
  if (!headers || typeof headers !== "object") return "";

  const h = headers as {
    get?: (key: string) => string | undefined | null;
    toJSON?: () => Record<string, unknown>;
  };

  if (typeof h.get === "function") {
    const direct =
      h.get(name) ||
      h.get(name.toLowerCase()) ||
      h.get(name.toUpperCase());
    if (direct) return String(direct).trim();
  }

  if (typeof h.toJSON === "function") {
    const json = asRecord(h.toJSON());
    const fromJson = getProp(json, name);
    if (fromJson != null) return String(fromJson).trim();
  }

  return String(getProp(asRecord(headers), name) || "").trim();
}

function pickLoginTokenFromHeaders(headers: unknown): string {
  const names = [
    "x-login-token",
    "login-token",
    "x-otp-token",
    "x-temp-token",
    "x-auth-token",
    "x-access-token",
  ];

  for (const name of names) {
    const raw = readResponseHeader(headers, name);
    const token = isUsableLoginToken(raw.replace(/^Bearer\s+/i, ""));
    if (token) return token;
  }

  const auth = readResponseHeader(headers, "authorization");
  if (auth) {
    const token = isUsableLoginToken(auth.replace(/^Bearer\s+/i, ""));
    if (token) return token;
  }

  return "";
}

function flagRequiresOtp(payload: unknown): boolean {
  const root = asRecord(payload);
  const data = unwrap(payload);
  const buckets = [root, data, asRecord(root.result), asRecord(data.result)];

  for (const bag of buckets) {
    const value = getProp(
      bag,
      "requiresOtp",
      "requireOtp",
      "otpRequired",
      "isOtpRequired",
      "otp_required"
    );
    if (value === true || value === 1 || value === "true" || value === "1") {
      return true;
    }

    const code = String(
      getProp(bag, "code", "status", "errorCode") || ""
    ).toUpperCase();
    if (
      code.includes("OTP_REQUIRED") ||
      code.includes("OTP_SENT") ||
      code === "OTP" ||
      code === "REQUIRES_OTP"
    ) {
      return true;
    }
  }

  return messageSuggestsOtp(pickMessage(payload, ""));
}

function pickLoginToken(payload: unknown, responseHeaders?: unknown): string {
  // Headers first — PayTrue exposes Authorization on login OTP challenge
  const fromHeaders = pickLoginTokenFromHeaders(responseHeaders);
  if (fromHeaders) return fromHeaders;

  const root = asRecord(payload);
  const data = unwrap(payload);

  const named = getProp(
    { ...root, ...data },
    "loginToken",
    "LoginToken",
    "tempToken",
    "otpToken",
    "sessionToken",
    "verificationToken",
    "login_token",
    "challengeToken",
    "tempLoginToken",
    "otpLoginToken",
    "otpReference",
    "otpRef",
    "referenceId",
    "requestId"
  );
  const namedToken = isUsableLoginToken(named);
  if (namedToken) return namedToken;

  if (typeof root.data === "string") {
    const dataToken = isUsableLoginToken(root.data);
    if (dataToken) return dataToken;
  }

  const fromResult = getProp(
    asRecord(root.result),
    "loginToken",
    "tempToken",
    "token",
    "otpReference"
  );
  const resultToken = isUsableLoginToken(fromResult);
  if (resultToken) return resultToken;

  if (flagRequiresOtp(payload) || messageSuggestsOtp(pickMessage(payload, ""))) {
    const generic = isUsableLoginToken(
      getProp(data, "token") || getProp(root, "token")
    );
    if (generic) return generic;
  }

  const likely = isUsableLoginToken(findLikelyOpaqueToken(payload));
  if (likely) return likely;

  return "";
}

function extractOtpChallenge(
  payload: unknown,
  responseHeaders?: unknown
): { loginToken: string; message: string } | null {
  const normalized = normalizePayload(payload);
  const message = pickMessage(normalized, "OTP sent successfully.");
  const otpHint =
    flagRequiresOtp(normalized) || messageSuggestsOtp(message);

  const data = unwrap(normalized);
  const root = asRecord(normalized);
  const user = asRecord(
    getProp(data, "user", "profile") || getProp(root, "user", "profile")
  );
  const hasUser = Boolean(user.id || user.userId || user.userType || user.email);

  const accessToken = String(
    getProp(data, "accessToken", "access_token") ||
      getProp(root, "accessToken", "access_token") ||
      ""
  ).trim();

  // Explicit accessToken → authenticated path (not OTP)
  if (accessToken) {
    return null;
  }

  const loginToken = pickLoginToken(normalized, responseHeaders);
  const loginTokenIsJwt = /^eyJ[A-Za-z0-9_-]+\./.test(loginToken);

  // Backend LOGIN_WITHOUT_OTP response: loginToken is the JWT + user object,
  // message "Login successful" — must NOT open OTP screen.
  if (hasUser && loginTokenIsJwt && !otpHint) {
    return null;
  }

  if (!otpHint) {
    // Opaque challenge token without a completed user session → OTP
    if (!loginToken) return null;
    if (hasUser && loginTokenIsJwt) return null;
    return { loginToken, message };
  }

  // OTP indicated but real loginToken missing — do NOT fake with mobile/email
  if (!loginToken) return null;

  return {
    loginToken,
    message: message || "OTP sent successfully.",
  };
}

export interface LoginCredentials {
  email?: string;
  mobile?: string;
  password: string;
  remember?: boolean;
}

export type LoginApiResult =
  | {
      kind: "otp_required";
      loginToken: string;
      message: string;
      remember: boolean;
    }
  | {
      kind: "authenticated";
      accessToken: string;
      refreshToken: string | null;
      user: NormalizedAuthUser | null;
      remember: boolean;
      message?: string;
      /** Present when API also returns an OTP challenge token (permission fail-closed fallback). */
      loginToken?: string;
      /** Permissions from login payload when present (LOGIN_WITHOUT_OTP etc.). */
      permissions?: unknown[] | null;
    };

export interface VerifyLoginOtpPayload {
  loginToken: string;
  otp: string;
  remember?: boolean;
}

export interface VerifyLoginOtpResult {
  accessToken: string;
  refreshToken: string | null;
  user: NormalizedAuthUser | null;
  message: string;
}

export interface ResendLoginOtpResult {
  success: boolean;
  message: string;
  loginToken?: string;
}

export interface LoginOtpApiError {
  message: string;
  status?: number;
  remainingAttempts?: number | null;
  code?: string;
  locked?: boolean;
  expired?: boolean;
  data?: unknown;
}

/** Recover OTP challenge from a rejected axios/login error body. */
export function recoverOtpChallengeFromError(
  error: unknown
): { loginToken: string; message: string } | null {
  const err = error as {
    data?: unknown;
    message?: string;
    originalError?: { response?: { headers?: unknown; data?: unknown } };
  };

  const headers =
    err.originalError?.response?.headers ??
    (error as { response?: { headers?: unknown } })?.response?.headers;

  const body = err?.data ?? err.originalError?.response?.data ?? error;
  return extractOtpChallenge(body, headers);
}

export function toLoginOtpApiError(
  error: unknown,
  fallback = "Request failed"
): LoginOtpApiError {
  const err = error as {
    message?: string;
    status?: number;
    data?: unknown;
  };
  const data = asRecord(err.data);
  const nested = unwrap(err.data);
  const message = pickMessage(err.data ?? err, err.message || fallback);
  const status = err.status;
  const lower = message.toLowerCase();

  return {
    message,
    status,
    remainingAttempts: pickRemainingAttempts(err.data),
    code: String(data.code || nested.code || ""),
    locked: status === 423 || lower.includes("locked"),
    expired:
      lower.includes("otp expired") ||
      lower.includes("expired otp") ||
      String(data.code || nested.code || "").toUpperCase().includes("EXPIRED"),
    data: err.data,
  };
}

/**
 * POST /auth/login
 * - SUPER_ADMIN / ADMIN may receive tokens directly
 * - RETAILER / DISTRIBUTOR / MASTER_DISTRIBUTOR may receive JWT when
 *   LOGIN_WITHOUT_OTP is granted (frontend still verifies via permissions API),
 *   otherwise typically receives requiresOtp + loginToken
 * Uses fetch so response headers (Authorization / x-login-token) are reliably readable cross-origin.
 */
export async function loginWithPassword(
  credentials: LoginCredentials
): Promise<LoginApiResult> {
  const body = credentials.email
    ? { email: credentials.email, password: credentials.password }
    : { mobile: credentials.mobile, password: credentials.password };

  const remember = Boolean(credentials.remember);

  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let payload: unknown = {};
    try {
      payload = normalizePayload(await response.json());
    } catch {
      payload = {};
    }

    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headerMap[key] = value;
    });

    const message = pickMessage(payload, "");

    if (typeof window !== "undefined" && messageSuggestsOtp(message)) {
      try {
        sessionStorage.setItem(
          "pt_debug_last_login_response",
          JSON.stringify({
            status: response.status,
            data: payload,
            headers: headerMap,
          })
        );
      } catch {
        /* ignore */
      }
    }

    // 1) OTP challenge — body + headers (Authorization / x-login-token)
    const otpChallenge = extractOtpChallenge(payload, headerMap);
    if (otpChallenge) {
      return {
        kind: "otp_required",
        loginToken: otpChallenge.loginToken,
        message: otpChallenge.message,
        remember,
      };
    }

    // 2) OTP sent but loginToken missing
    if (messageSuggestsOtp(message)) {
      throw {
        status: 500,
        message:
          "OTP was sent, but loginToken is missing from the server response. Please try again or contact support.",
        data: payload,
      };
    }

    const status = response.status;

    if (status === 423) {
      throw {
        status: 423,
        message: pickMessage(
          payload,
          "Your account has been locked for 1 hour due to multiple invalid OTP attempts."
        ),
        data: payload,
        locked: true,
      };
    }

    if (status >= 400) {
      throw {
        status,
        message: pickMessage(payload, "Login failed"),
        data: payload,
      };
    }

    const { accessToken, refreshToken, user } = extractAuthPayload(payload);
    if (!accessToken) {
      const loginToken = pickLoginToken(payload, headerMap);
      if (loginToken) {
        return {
          kind: "otp_required",
          loginToken,
          message: pickMessage(payload, "OTP sent successfully."),
          remember,
        };
      }
      throw {
        status: 500,
        message: pickMessage(
          payload,
          "Invalid login response: missing access token"
        ),
        data: payload,
      };
    }

    persistAuthSession({
      accessToken,
      refreshToken,
      user: normalizeUser(user),
      remember,
    });

    const otpLoginTokenRaw = pickLoginToken(payload);
    const otpLoginToken =
      otpLoginTokenRaw && otpLoginTokenRaw !== accessToken
        ? otpLoginTokenRaw
        : undefined;

    return {
      kind: "authenticated",
      accessToken,
      refreshToken,
      user: normalizeUser(user),
      remember,
      message: pickMessage(payload, "Login successful"),
      loginToken: otpLoginToken,
      permissions: extractPermissionsList(payload),
    };
  } catch (error) {
    const challenge = recoverOtpChallengeFromError(error);
    if (challenge) {
      return {
        kind: "otp_required",
        loginToken: challenge.loginToken,
        message: challenge.message,
        remember,
      };
    }
    throw error;
  }
}

/** POST /auth/verify-login-otp */
export async function verifyLoginOtp(
  payload: VerifyLoginOtpPayload
): Promise<VerifyLoginOtpResult> {
  const loginToken = isUsableLoginToken(payload.loginToken);
  const otp = String(payload.otp || "").replace(/\D/g, "");

  if (!loginToken) {
    throw {
      status: 400,
      message:
        "Login token is missing. Please go back and login again to receive a fresh OTP.",
      data: null,
    };
  }

  if (!/^\d{6}$/.test(otp)) {
    throw {
      status: 400,
      message: "OTP must be exactly 6 digits",
      data: null,
    };
  }

  const response = await api.post(
    API_ENDPOINTS.verifyLoginOtp,
    { loginToken, otp },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      skipSessionLogout: true,
      validateStatus: () => true,
    } as never
  );

  const status = Number(response.status) || 0;
  const body = normalizePayload(response.data);

  if (status >= 400) {
    throw {
      status,
      message: pickMessage(body, "Invalid OTP"),
      data: body,
      locked: status === 423,
    };
  }

  const { accessToken, refreshToken, user } = extractAuthPayload(body);
  const root = asRecord(body);
  const nested = unwrap(body);

  // Backend returns JWT as `loginToken` on successful OTP verify
  const resolvedAccessToken =
    accessToken ||
    String(root.loginToken || nested.loginToken || "").trim() ||
    null;

  if (!resolvedAccessToken) {
    throw {
      status: 500,
      message: "Invalid OTP response: missing access token",
      data: body,
    };
  }

  const resolvedUser = user || root.user || nested.user || null;
  const normalized = normalizeUser(resolvedUser);
  persistAuthSession({
    accessToken: resolvedAccessToken,
    refreshToken,
    user: normalized,
    remember: Boolean(payload.remember),
  });

  return {
    accessToken: resolvedAccessToken,
    refreshToken,
    user: normalized,
    message: pickMessage(body, "Login successful"),
  };
}

/** POST /auth/resend-login-otp */
export async function resendLoginOtp(
  loginToken: string
): Promise<ResendLoginOtpResult> {
  const token = isUsableLoginToken(loginToken);
  if (!token) {
    throw {
      status: 400,
      message:
        "Login token is missing. Please go back and login again to receive a fresh OTP.",
      data: null,
    };
  }

  const response = await api.post(
    API_ENDPOINTS.resendLoginOtp,
    { loginToken: token },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      skipSessionLogout: true,
      validateStatus: () => true,
    } as never
  );

  const status = Number(response.status) || 0;
  const body = normalizePayload(response.data);

  if (status >= 400) {
    throw {
      status,
      message: pickMessage(body, "Unable to resend OTP"),
      data: body,
      locked: status === 423,
    };
  }

  const data = unwrap(body);
  const root = asRecord(body);
  const nextToken =
    isUsableLoginToken(getProp(data, "loginToken")) ||
    isUsableLoginToken(getProp(root, "loginToken")) ||
    isUsableLoginToken(pickLoginToken(body, response.headers)) ||
    token;

  return {
    success: Boolean(root.success ?? data.success ?? true),
    message: pickMessage(body, "OTP resent successfully."),
    loginToken: nextToken,
  };
}

/** Exported for login page safety-net navigation */
export function isOtpSentMessage(message: string): boolean {
  return messageSuggestsOtp(message);
}

export function extractLoginTokenFromPayload(
  payload: unknown,
  headers?: unknown
): string {
  return pickLoginToken(normalizePayload(payload), headers);
}
