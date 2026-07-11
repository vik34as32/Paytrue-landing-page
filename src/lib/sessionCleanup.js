import { clearAuthCookies } from "@/src/lib/cookies";
import { resetAppState } from "@/src/redux/actions";
import { store } from "@/src/redux/store";
import { clearDmtSessionStorage } from "@/src/lib/dmtSession";
import { AEPS_SESSION_KEY } from "@/src/lib/aepsSession";

const ZUSTAND_PERSIST_KEYS = [
  "retailer-data-storage",
  "retailer-wallet-storage",
];

const AUTH_LOCAL_STORAGE_KEYS = [
  AEPS_SESSION_KEY,
  "paytrue_retailer_theme",
  "paytrue_wallet_balance_hidden",
];

let sessionClearInProgress = false;

export function isSessionClearInProgress() {
  return sessionClearInProgress;
}

/**
 * Clears all client-side auth/session data.
 * Safe to call from logout, idle timeout, and 401 handlers.
 */
export function clearClientSession({ resetStore = true } = {}) {
  if (typeof window === "undefined") {
    clearAuthCookies();
    if (resetStore) {
      store.dispatch(resetAppState());
    }
    return;
  }

  sessionClearInProgress = true;

  try {
    clearAuthCookies();
    clearDmtSessionStorage();

    AUTH_LOCAL_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });

    ZUSTAND_PERSIST_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });

    if (resetStore) {
      store.dispatch(resetAppState());
    }
  } finally {
    sessionClearInProgress = false;
  }
}

/** Instant logout redirect — avoids slow client router + AuthGuard loader flash */
export function performLogoutRedirect(redirectTo = "/auth/login") {
  clearClientSession({ resetStore: true });

  if (typeof window !== "undefined") {
    window.location.replace(redirectTo);
  }
}
