"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { logoutUser } from "@/src/redux/thunks/authThunk";

/**
 * Clears auth cookies + Redux session and navigates to login.
 */
export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();

  const logout = useCallback(
    async ({ showToast = true, redirectTo = "/auth/login" } = {}) => {
      await dispatch(logoutUser());
      if (showToast) {
        toast.success("Logged out successfully");
      }
      router.replace(redirectTo);
    },
    [dispatch, router]
  );

  return logout;
}

export default useLogout;
