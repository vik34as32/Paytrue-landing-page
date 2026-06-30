import {
  USER_TYPE_LABELS,
  ROLE_DASHBOARD_PATHS,
  ROLE_PORTAL_PATHS,
} from "@/src/constants/auth";

export function normalizeUser(user) {
  if (!user) return null;

  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    ...user,
    name: fullName || user.name || user.email,
    roleLabel: USER_TYPE_LABELS[user.userType] || user.userType,
    userId: user.id || user.userId || user._id,
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

export function extractAuthPayload(responseData) {
  const data = responseData?.data || responseData;
  const accessToken =
    data?.accessToken || data?.token || data?.access_token || null;
  const refreshToken = data?.refreshToken || data?.refresh_token || null;
  const user = data?.user || data?.profile || null;
  return { accessToken, refreshToken, user };
}
