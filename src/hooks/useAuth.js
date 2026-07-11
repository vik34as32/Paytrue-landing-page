"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setUnauthorizedHandler } from "@/src/lib/axios";
import { getRedirectPathForUserType } from "@/src/lib/authUtils";
import { performLogoutRedirect } from "@/src/lib/sessionCleanup";
import { hydrateAuth } from "@/src/redux/thunks/authThunk";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";
import { USER_TYPES } from "@/src/constants/auth";

const ROLE_PREFIX_MAP = {
  [USER_TYPES.MASTER_DISTRIBUTOR]: "/md",
  [USER_TYPES.DISTRIBUTOR]: "/dd",
  [USER_TYPES.RETAILER]: "/rt/retailer",
};

export function useAuthInit() {
  const dispatch = useDispatch();
  const hydrated = useSelector(selectAuthHydrated);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      toast.error("Your session has expired. Please login again.");
      performLogoutRedirect("/auth/login");
    });
    dispatch(hydrateAuth());
  }, [dispatch]);

  return hydrated;
}

export function useRequireAuth(allowedTypes = []) {
  const router = useRouter();
  const hydrated = useAuthInit();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      window.location.replace("/auth/login");
      return;
    }

    if (
      allowedTypes.length &&
      user?.userType &&
      !allowedTypes.includes(user.userType)
    ) {
      router.replace(getRedirectPathForUserType(user.userType) || "/unauthorized");
    }
  }, [hydrated, isAuthenticated, user, allowedTypes, router]);

  return { hydrated, isAuthenticated, user };
}

export function getRolePrefix(userType) {
  return ROLE_PREFIX_MAP[userType] || null;
}
