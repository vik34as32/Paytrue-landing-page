import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";
import { USER_TYPES } from "@/src/constants/auth";

/** Permission key for password login without SMS/email OTP. */
export const LOGIN_WITHOUT_OTP = "LOGIN_WITHOUT_OTP";

/** Alternate keys backends may send in string permission arrays. */
const LOGIN_WITHOUT_OTP_ALIASES = new Set([
  "LOGIN_WITHOUT_OTP",
  "LOGIN.WITHOUT_OTP",
  "LOGIN WITHOUT OTP",
  "LOGIN_WITHOUTOTP",
]);

/** Roles that may skip OTP when LOGIN_WITHOUT_OTP is allowed by the backend. */
export const LOGIN_WITHOUT_OTP_ROLES = [
  USER_TYPES.RETAILER,
  USER_TYPES.DISTRIBUTOR,
  USER_TYPES.MASTER_DISTRIBUTOR,
] as const;

export type LoginWithoutOtpRole = (typeof LOGIN_WITHOUT_OTP_ROLES)[number];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Strict allowed check — only boolean `true` counts.
 * missing / null / undefined / false / non-boolean → false
 */
export function isPermissionAllowed(allowed: unknown): boolean {
  return allowed === true;
}

export function isLoginWithoutOtpEligibleRole(
  userType: string | null | undefined
): boolean {
  const role = String(userType || "").trim().toUpperCase();
  return (LOGIN_WITHOUT_OTP_ROLES as readonly string[]).includes(role);
}

function normalizePermissionKey(raw: unknown): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function isLoginWithoutOtpKey(raw: unknown): boolean {
  const key = normalizePermissionKey(raw);
  if (!key) return false;
  if (LOGIN_WITHOUT_OTP_ALIASES.has(key)) return true;
  // login.without_otp → LOGIN.WITHOUT_OTP → also compare dotted form
  const dotted = key.replace(/_/g, ".");
  return (
    dotted === "LOGIN.WITHOUT_OTP" ||
    key === "LOGIN.WITHOUT_OTP" ||
    key.includes("LOGIN_WITHOUT_OTP") ||
    key.includes("LOGIN.WITHOUT_OTP")
  );
}

function permissionKeyOf(entry: Record<string, unknown>): string {
  return normalizePermissionKey(
    entry.key || entry.permission || entry.name || ""
  );
}

/**
 * True when permissions list grants LOGIN_WITHOUT_OTP.
 * Supports:
 * - ["LOGIN_WITHOUT_OTP", "login.without_otp"]
 * - [{ key: "LOGIN_WITHOUT_OTP", isAllowed: true }]
 * - [{ key: "LOGIN_WITHOUT_OTP", allowed: true }]
 */
export function hasPermissionInList(
  permissions: unknown,
  permissionKey: string = LOGIN_WITHOUT_OTP
): boolean {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false;
  }

  const wantLoginWithoutOtp =
    normalizePermissionKey(permissionKey) === LOGIN_WITHOUT_OTP ||
    isLoginWithoutOtpKey(permissionKey);

  for (const item of permissions) {
    // String permission keys from login API
    if (typeof item === "string") {
      if (wantLoginWithoutOtp && isLoginWithoutOtpKey(item)) return true;
      if (
        normalizePermissionKey(item) === normalizePermissionKey(permissionKey)
      ) {
        return true;
      }
      continue;
    }

    const row = asRecord(item);
    const key = permissionKeyOf(row);
    const matches = wantLoginWithoutOtp
      ? isLoginWithoutOtpKey(key) || isLoginWithoutOtpKey(row.key)
      : key === normalizePermissionKey(permissionKey);

    if (!matches) continue;

    // Object entries: require explicit isAllowed/allowed === true when present.
    // If neither field exists, treat presence of the key as granted (login string-list style objects).
    if (row.isAllowed !== undefined || row.allowed !== undefined) {
      return isPermissionAllowed(row.isAllowed ?? row.allowed);
    }
    return true;
  }

  return false;
}

/** Find whether LOGIN_WITHOUT_OTP (or alias) appears in a permissions list. */
export function findPermissionEntry(
  permissions: unknown,
  permissionKey: string = LOGIN_WITHOUT_OTP
): { key: string; isAllowed: boolean } | null {
  if (!hasPermissionInList(permissions, permissionKey)) return null;
  return { key: LOGIN_WITHOUT_OTP, isAllowed: true };
}

/** Extract permissions[] from common API envelopes (root or nested user). */
export function extractPermissionsList(payload: unknown): unknown[] | null {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const user = asRecord(data.user || root.user);

  const candidates = [
    data.permissions,
    root.permissions,
    data.userPermissions,
    root.userPermissions,
    user.permissions,
  ];

  for (const list of candidates) {
    if (Array.isArray(list)) return list;
  }
  return null;
}

export type CheckPermissionOptions = {
  /** Prefer explicit Bearer when cookies are not yet readable. */
  accessToken?: string | null;
  /**
   * Optional permissions list from login / user-permissions response.
   * String keys or { key, isAllowed } objects.
   */
  permissions?: unknown[] | null;
};

function authHeaders(accessToken?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = String(accessToken || "").trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * GET /permissions/check/:permission
 * Supports `data.allowed` and `data.isAllowed`. Defaults to false on any failure.
 */
export async function checkPermission(
  permission: string,
  options: CheckPermissionOptions = {}
): Promise<boolean> {
  const name = String(permission || "").trim();
  if (!name) return false;

  // Explicit list from login payload — presence of LOGIN_WITHOUT_OTP string ⇒ allowed
  if (options.permissions !== undefined && options.permissions !== null) {
    return hasPermissionInList(options.permissions, name);
  }

  try {
    const response = await api.get(API_ENDPOINTS.permissionCheck(name), {
      headers: authHeaders(options.accessToken),
      skipSessionLogout: true,
    } as never);

    const body = asRecord(response.data);
    const data = asRecord(body.data);

    // Shape A: { data: { permission, allowed } }
    if (data.allowed !== undefined || data.isAllowed !== undefined) {
      return isPermissionAllowed(data.isAllowed ?? data.allowed);
    }

    // Shape B: { data: { permissions: [...] } }
    const list = extractPermissionsList(body);
    if (list) {
      return hasPermissionInList(list, name);
    }

    if (body.allowed !== undefined || body.isAllowed !== undefined) {
      return isPermissionAllowed(body.isAllowed ?? body.allowed);
    }

    return false;
  } catch {
    return false;
  }
}

/** Alias: boolean permission check by name (fail closed). */
export async function hasPermission(
  permission: string,
  options: CheckPermissionOptions = {}
): Promise<boolean> {
  return checkPermission(permission, options);
}

/**
 * GET user permissions list.
 * Returns [] on failure — missing LOGIN_WITHOUT_OTP ⇒ false.
 */
export async function fetchUserPermissions(
  options: CheckPermissionOptions = {}
): Promise<unknown[]> {
  try {
    const response = await api.get(API_ENDPOINTS.permissionsUser, {
      headers: authHeaders(options.accessToken),
      skipSessionLogout: true,
    } as never);
    return extractPermissionsList(response.data) || [];
  } catch {
    return [];
  }
}

/**
 * Whether this user may skip the login OTP UI.
 * ADMIN / SUPER_ADMIN → always false.
 * Default / missing / API error → false.
 *
 * When the login response already includes LOGIN_WITHOUT_OTP (string or object),
 * trust that list and do NOT call extra permission APIs (avoids clearing a fresh JWT).
 */
export async function canLoginWithoutOtp(
  userType: string | null | undefined,
  options: CheckPermissionOptions = {}
): Promise<boolean> {
  if (!isLoginWithoutOtpEligibleRole(userType)) {
    return false;
  }

  // 1) Login response permissions — authoritative when present
  //    e.g. ["login.without_otp", "LOGIN_WITHOUT_OTP"]
  if (Array.isArray(options.permissions) && options.permissions.length > 0) {
    if (hasPermissionInList(options.permissions, LOGIN_WITHOUT_OTP)) {
      return true;
    }
    // Explicit list without LOGIN_WITHOUT_OTP → fail closed (do not call check API
    // with a brand-new session token; backend already told us the grants).
    return false;
  }

  // 2) No permissions on login payload → ask check endpoint
  const fromCheck = await checkPermission(LOGIN_WITHOUT_OTP, {
    accessToken: options.accessToken,
  });
  if (fromCheck) return true;

  // 3) User-permissions list fallback
  const list = await fetchUserPermissions({ accessToken: options.accessToken });
  return hasPermissionInList(list, LOGIN_WITHOUT_OTP);
}
