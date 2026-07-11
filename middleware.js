import { NextResponse } from "next/server";
import {
  COOKIE_KEYS,
  PROTECTED_PREFIXES,
  PUBLIC_PATHS,
  ROLE_DASHBOARD_PATHS,
  ROLE_PATH_PREFIXES,
} from "@/src/constants/auth";

const LOGIN_PATH = "/auth/login";

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith("/services")) return true;
  if (pathname.startsWith("/auth/login")) return true;
  if (pathname.startsWith("/auth/forgot-password")) return true;
  if (pathname.startsWith("/auth/reset-password")) return true;
  return false;
}

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function parseUserCookie(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isPathAllowedForUserType(pathname, userType) {
  const prefixes = ROLE_PATH_PREFIXES[userType] || [];
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_KEYS.accessToken)?.value;
  const user = parseUserCookie(request.cookies.get(COOKIE_KEYS.user)?.value);

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedPath(pathname) && token && user?.userType) {
    if (!isPathAllowedForUserType(pathname, user.userType)) {
      const dashboard = ROLE_DASHBOARD_PATHS[user.userType];
      if (dashboard) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (pathname === LOGIN_PATH && token && user?.userType) {
    const dashboard = ROLE_DASHBOARD_PATHS[user.userType];
    if (dashboard) {
      return NextResponse.redirect(new URL(dashboard, request.url));
    }
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/md/:path*",
    "/dd/:path*",
    "/dashboard/:path*",
    "/rt/retailer",
    "/rt/retailer/:path*",
    "/rt/balance-transfer",
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/unauthorized",
  ],
};
