"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUnauthorizedHandler } from "@/src/lib/axios";
import { hydrateAuth, logoutUser } from "@/src/redux/thunks/authThunk";
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
  const router = useRouter();
  const hydrated = useSelector(selectAuthHydrated);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      dispatch(logoutUser());
      router.replace("/auth/login");
    });
    dispatch(hydrateAuth());
  }, [dispatch, router]);

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
      router.replace("/auth/login");
      return;
    }

    if (allowedTypes.length && user?.userType && !allowedTypes.includes(user.userType)) {
      router.replace("/unauthorized");
    }
  }, [hydrated, isAuthenticated, user, allowedTypes, router]);

  return { hydrated, isAuthenticated, user };
}

export function getRolePrefix(userType) {
  return ROLE_PREFIX_MAP[userType] || null;
}
