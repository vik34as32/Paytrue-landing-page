"use client";

import { useCallback, useEffect, useRef } from "react";
import { generateSecurePassword } from "@/src/lib/passwordUtils";

const FILE_KEYS = new Set([
  "profileImage",
  "aadhaarFront",
  "aadhaarBack",
  "panCard",
  "ownerPhoto",
  "videoVerification",
  "passbookImage",
  "cancelledChequeImage",
]);

function stripFiles(values) {
  const draft = {};
  Object.entries(values || {}).forEach(([key, value]) => {
    if (FILE_KEYS.has(key)) return;
    if (value instanceof File) return;
    draft[key] = value;
  });
  return draft;
}

export function getUserFormDraftKey(userType, mode) {
  return `paytrue_user_form_draft_${userType}_${mode}`;
}

export function loadUserFormDraft(userType, mode) {
  if (typeof window === "undefined" || mode === "edit") return null;
  try {
    const raw = localStorage.getItem(getUserFormDraftKey(userType, mode));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.values ? parsed : null;
  } catch {
    return null;
  }
}

export function clearUserFormDraft(userType, mode) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getUserFormDraftKey(userType, mode));
}

export function useUserFormDraft({
  userType,
  mode,
  watch,
  reset,
  getValues,
  step,
  setStep,
  enabled = true,
}) {
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (!enabled || mode === "edit" || hydratedRef.current) return;
    const draft = loadUserFormDraft(userType, mode);
    if (draft?.values) {
      reset({
        ...draft.values,
        password: draft.values.password || generateSecurePassword(),
      });
      if (draft.step && draft.step >= 1 && draft.step <= 5) {
        setStep(draft.step);
      }
    }
    hydratedRef.current = true;
  }, [enabled, mode, reset, setStep, userType]);

  useEffect(() => {
    if (!enabled || mode === "edit") return;
    const subscription = watch((values) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(
            getUserFormDraftKey(userType, mode),
            JSON.stringify({ values: stripFiles(values), step })
          );
        } catch {
          /* quota exceeded — ignore */
        }
      }, 400);
    });
    return () => {
      subscription.unsubscribe();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [enabled, mode, step, userType, watch]);

  const clearDraft = useCallback(() => {
    clearUserFormDraft(userType, mode);
  }, [mode, userType]);

  return { clearDraft };
}
