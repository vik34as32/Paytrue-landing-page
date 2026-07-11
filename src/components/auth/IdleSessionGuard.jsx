"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { useIdleLogout } from "@/src/hooks/useIdleLogout";
import { useAuthInit } from "@/src/hooks/useAuth";
import useLogout from "@/src/hooks/useLogout";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";

/**
 * Ends the session after 1 hour of inactivity — clears cookies via logoutUser.
 * Use inside authenticated portal layouts (RT / DD / MD).
 */
export default function IdleSessionGuard({ children }) {
  const logout = useLogout();
  useAuthInit();

  const hydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleIdleLogout = useCallback(() => {
    toast.info("You were logged out after 1 hour of inactivity.");
    logout({ showToast: false });
  }, [logout]);

  useIdleLogout({
    enabled: hydrated && isAuthenticated,
    onIdle: handleIdleLogout,
  });

  return children;
}
