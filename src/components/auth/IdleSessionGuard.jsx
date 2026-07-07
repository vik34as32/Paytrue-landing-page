"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useIdleLogout } from "@/src/hooks/useIdleLogout";
import { useAuthInit } from "@/src/hooks/useAuth";
import { logoutUser } from "@/src/redux/thunks/authThunk";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";

/**
 * Ends the session after 1 hour of inactivity — clears cookies via logoutUser.
 * Use inside authenticated portal layouts (RT / DD / MD).
 */
export default function IdleSessionGuard({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  useAuthInit();

  const hydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleIdleLogout = useCallback(async () => {
    await dispatch(logoutUser());
    toast.info("You were logged out after 1 hour of inactivity.");
    router.replace("/auth/login");
  }, [dispatch, router]);

  useIdleLogout({
    enabled: hydrated && isAuthenticated,
    onIdle: handleIdleLogout,
  });

  return children;
}
