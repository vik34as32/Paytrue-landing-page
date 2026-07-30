import { LOGIN_OTP_SESSION_KEY } from "@/src/constants/auth";

export interface LoginOtpSession {
  loginToken: string;
  remember: boolean;
  identifierHint?: string;
  createdAt: number;
}

export function saveLoginOtpSession(session: Omit<LoginOtpSession, "createdAt">) {
  if (typeof window === "undefined") return;
  const loginToken = String(session.loginToken || "").trim();
  // Never persist mobile/email as loginToken — verify API rejects it
  if (!loginToken) return;
  if (/^\d{10}$/.test(loginToken) || loginToken.includes("@")) return;

  const payload: LoginOtpSession = {
    ...session,
    loginToken,
    remember: Boolean(session.remember),
    createdAt: Date.now(),
  };
  try {
    sessionStorage.setItem(LOGIN_OTP_SESSION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getLoginOtpSession(): LoginOtpSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LOGIN_OTP_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoginOtpSession;
    if (!parsed?.loginToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getLoginToken(): string | null {
  return getLoginOtpSession()?.loginToken || null;
}

export function clearLoginOtpSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(LOGIN_OTP_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
