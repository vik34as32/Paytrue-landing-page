"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { performLogoutRedirect } from "@/src/lib/sessionCleanup";

/**
 * Clears session and navigates to login immediately (full page redirect).
 */
export function useLogout() {
  const logout = useCallback(
    ({ showToast = true, redirectTo = "/auth/login" } = {}) => {
      if (showToast) {
        toast.success("Logged out successfully");
      }
      performLogoutRedirect(redirectTo);
    },
    []
  );

  return logout;
}

export default useLogout;
