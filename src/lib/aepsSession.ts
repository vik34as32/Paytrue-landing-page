import { isTodayLoginDate } from "@/src/lib/aepsUtils";
import {
  hydrateAepsLogin,
  resetAepsSession,
} from "@/src/redux/slices/aepsSlice";

export const AEPS_BASE_PATH = "/rt/retailer/aeps";
export const AEPS_LOGIN_PATH = `${AEPS_BASE_PATH}/login`;
export const AEPS_SESSION_KEY = "aeps_session";

export type AepsStoredSession = {
  isDailyLoginComplete?: boolean;
  lastLoginDate?: string | null;
  agentName?: string;
  loginMessage?: string;
};

/** Valid only when daily login succeeded and session is for today */
export function isAepsDailyLoginDone(
  session: AepsStoredSession | null | undefined
): boolean {
  if (!session?.isDailyLoginComplete) return false;
  return isTodayLoginDate(session.lastLoginDate);
}

export function readAepsSessionFromStorage(): AepsStoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(AEPS_SESSION_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as AepsStoredSession;
  } catch {
    return null;
  }
}

export function readAepsLoginDoneFromStorage(): boolean {
  return isAepsDailyLoginDone(readAepsSessionFromStorage());
}

export function clearAepsSessionStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AEPS_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function saveAepsSessionToStorage(session: AepsStoredSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AEPS_SESSION_KEY, JSON.stringify(session));
}

export function isPublicAepsPath(pathname: string): boolean {
  return pathname === AEPS_BASE_PATH || pathname === AEPS_LOGIN_PATH;
}

/** Load valid session into Redux; clear stale or expired sessions */
export function initAepsSession(dispatch: (action: unknown) => void): boolean {
  const session = readAepsSessionFromStorage();
  if (session && isAepsDailyLoginDone(session)) {
    dispatch(hydrateAepsLogin(session));
    return true;
  }
  clearAepsSessionStorage();
  dispatch(resetAepsSession());
  return false;
}
