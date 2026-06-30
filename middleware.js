import { NextResponse } from "next/server";
import {
  COOKIE_KEYS,
  PROTECTED_PREFIXES,
  PUBLIC_PATHS,
  ROLE_DASHBOARD_PATHS,
} from "@/src/constants/auth";

const LOGIN_PATH = "/auth/login";

function isPublicPath(pathname) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  if (pathname.startsWith("/services")) return true;
  if (pathname.startsWith("/auth/login")) return true;
  return false;
}

function isProtectedPath(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_KEYS.accessToken)?.value;

  if (isProtectedPath(pathname) && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === LOGIN_PATH && token) {
    const userRaw = request.cookies.get(COOKIE_KEYS.user)?.value;
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        const dashboard = ROLE_DASHBOARD_PATHS[user.userType];
        if (dashboard) {
          return NextResponse.redirect(new URL(dashboard, request.url));
        }
      } catch {
        /* ignore parse errors */
      }
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
    "/rt/retailer/:path*",
    "/auth/login",
    "/unauthorized",
  ],
};
