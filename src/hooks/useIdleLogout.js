"use client";

import { useCallback, useEffect, useRef } from "react";
import { IDLE_SESSION_TIMEOUT_MS } from "@/src/constants/auth";

const ACTIVITY_EVENTS = [
  "mousedown",
  "mousemove",
  "keydown",
  "scroll",
  "touchstart",
  "click",
  "wheel",
];

/**
 * Logs out the user after {@link IDLE_SESSION_TIMEOUT_MS} with no activity.
 * Resets the timer on mouse, keyboard, scroll, and touch events.
 */
export function useIdleLogout({ enabled = true, onIdle }) {
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const onIdleRef = useRef(onIdle);
  const firedRef = useRef(false);

  onIdleRef.current = onIdle;

  const logoutIfIdle = useCallback(() => {
    if (!enabled || firedRef.current) return;
    const idleFor = Date.now() - lastActivityRef.current;
    if (idleFor >= IDLE_SESSION_TIMEOUT_MS) {
      firedRef.current = true;
      onIdleRef.current?.();
    }
  }, [enabled]);

  const resetActivity = useCallback(() => {
    if (!enabled) return;
    lastActivityRef.current = Date.now();
    firedRef.current = false;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(logoutIfIdle, IDLE_SESSION_TIMEOUT_MS);
  }, [enabled, logoutIfIdle]);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    firedRef.current = false;
    resetActivity();

    const handleActivity = () => resetActivity();

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        logoutIfIdle();
        if (!firedRef.current) {
          resetActivity();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(logoutIfIdle, 60_000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [enabled, resetActivity, logoutIfIdle]);
}

export default useIdleLogout;
