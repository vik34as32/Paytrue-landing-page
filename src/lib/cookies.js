import Cookies from "js-cookie";
import { COOKIE_KEYS } from "@/src/constants/auth";

const DEFAULT_EXPIRY_DAYS = 1;
const REMEMBER_EXPIRY_DAYS = 30;

function getExpiryDays() {
  return Cookies.get(COOKIE_KEYS.remember) === "true"
    ? REMEMBER_EXPIRY_DAYS
    : DEFAULT_EXPIRY_DAYS;
}

export function setAccessToken(token, remember = false) {
  Cookies.set(COOKIE_KEYS.accessToken, token, {
    expires: remember ? REMEMBER_EXPIRY_DAYS : DEFAULT_EXPIRY_DAYS,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getAccessToken() {
  return Cookies.get(COOKIE_KEYS.accessToken) || null;
}

export function setRefreshToken(token, remember = false) {
  if (!token) return;
  Cookies.set(COOKIE_KEYS.refreshToken, token, {
    expires: remember ? REMEMBER_EXPIRY_DAYS : DEFAULT_EXPIRY_DAYS,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getRefreshToken() {
  return Cookies.get(COOKIE_KEYS.refreshToken) || null;
}

export function setUserCookie(user, remember = false) {
  Cookies.set(COOKIE_KEYS.user, JSON.stringify(user), {
    expires: remember ? REMEMBER_EXPIRY_DAYS : DEFAULT_EXPIRY_DAYS,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

export function getUserCookie() {
  const raw = Cookies.get(COOKIE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setRememberLogin(remember) {
  Cookies.set(COOKIE_KEYS.remember, remember ? "true" : "false", {
    expires: remember ? REMEMBER_EXPIRY_DAYS : DEFAULT_EXPIRY_DAYS,
    sameSite: "strict",
  });
}

export function clearAuthCookies() {
  const removeOptions = {
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  Object.values(COOKIE_KEYS).forEach((key) => {
    Cookies.remove(key, removeOptions);
    Cookies.remove(key);
    Cookies.remove(key, { path: "/" });
  });
}

export function persistAuthSession({ accessToken, refreshToken, user, remember }) {
  setRememberLogin(remember);
  setAccessToken(accessToken, remember);
  if (refreshToken) setRefreshToken(refreshToken, remember);
  if (user) setUserCookie(user, remember);
}
