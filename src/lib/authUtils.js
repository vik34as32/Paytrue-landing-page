import {
  USER_TYPE_LABELS,
  ROLE_DASHBOARD_PATHS,
  ROLE_PORTAL_PATHS,
  ROLE_PATH_PREFIXES,
} from "@/src/constants/auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUserUuid(value) {
  return UUID_REGEX.test(String(value || "").trim());
}

/** Prefer real UUID for API path/query params — never RET000003 / display codes. */
export function resolveUserUuid(user) {
  if (!user || typeof user !== "object") return null;
  for (const value of [
    user.id,
    user._id,
    user.userId,
    user.retailerId,
    user.distributorId,
  ]) {
    if (value != null && isUserUuid(value)) {
      return String(value).trim();
    }
  }
  return null;
}

export function normalizeUser(user) {
  if (!user) return null;

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    user.fullName ||
    user.full_name ||
    user.name ||
    "";
  const profileImage =
    user.profileImage ||
    user.profileImageUrl ||
    user.avatar ||
    user.image ||
    null;

  const uuid = resolveUserUuid(user);
  const userCode =
    user.userCode ||
    user.retailerCode ||
    user.distributorCode ||
    (!isUserUuid(user.userId) ? user.userId : null) ||
    null;

  return {
    ...user,
    // Always keep UUID on `id` when known — APIs validate :id as uuid
    id: uuid || user.id || user._id || null,
    _id: user._id || uuid || null,
    userCode: userCode || undefined,
    firstName,
    lastName,
    name: fullName || user.email,
    profileImage,
    roleLabel: USER_TYPE_LABELS[user.userType] || user.userType,
    // Display code for UI (RET000003). Do NOT use this for /users/:id or retailerId APIs.
    userId: userCode || uuid || user.userId || user.id || null,
    status:
      user.status ||
      user.accountStatus ||
      (user.isActive === false ? "inactive" : "active"),
    portalPath: ROLE_PORTAL_PATHS[user.userType],
    dashboardPath: ROLE_DASHBOARD_PATHS[user.userType],
  };
}

export function getRedirectPathForUserType(userType) {
  return ROLE_DASHBOARD_PATHS[userType] || "/auth/login";
}

export function getPortalPathForUserType(userType) {
  return ROLE_PORTAL_PATHS[userType] || "/auth/login";
}

export function getAllowedPathPrefixesForUserType(userType) {
  return ROLE_PATH_PREFIXES[userType] || [];
}

export function isPathAllowedForUserType(pathname, userType) {
  if (!pathname || !userType) return false;
  const prefixes = getAllowedPathPrefixesForUserType(userType);
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Only honor ?redirect= when it matches the logged-in user's role.
 * Prevents retailer → distributor login from opening retailer dashboard.
 */
export function resolvePostLoginRedirect(redirectPath, userType) {
  const fallback = getRedirectPathForUserType(userType);
  if (!redirectPath?.trim()) return fallback;

  let pathname = redirectPath.trim();
  try {
    if (pathname.startsWith("http")) {
      pathname = new URL(pathname).pathname;
    }
  } catch {
    return fallback;
  }

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  if (pathname.startsWith("/auth/")) return fallback;

  return isPathAllowedForUserType(pathname, userType) ? pathname : fallback;
}

export function getUnauthorizedRedirectForPath(pathname, userType) {
  if (isPathAllowedForUserType(pathname, userType)) return null;
  return getRedirectPathForUserType(userType);
}

export function extractAuthPayload(responseData) {
  const root =
    responseData && typeof responseData === "object" ? responseData : {};
  const data = root.data && typeof root.data === "object" ? root.data : root;

  const accessToken =
    data.accessToken ||
    data.token ||
    data.access_token ||
    root.accessToken ||
    root.token ||
    root.access_token ||
    null;

  const user = data.user || data.profile || root.user || root.profile || null;

  // verify-login-otp returns the JWT as `loginToken` (with user present)
  const loginTokenJwt =
    (data.loginToken || root.loginToken || "").toString().trim() || null;
  const resolvedAccessToken =
    accessToken ||
    (user && loginTokenJwt ? loginTokenJwt : null);

  const refreshToken =
    data.refreshToken ||
    data.refresh_token ||
    root.refreshToken ||
    root.refresh_token ||
    null;

  return {
    accessToken: resolvedAccessToken,
    refreshToken,
    user,
  };
}
