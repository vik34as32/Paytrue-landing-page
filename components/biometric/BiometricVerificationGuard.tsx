"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/src/redux/types";
import { loadMerchantBiometricStatus } from "@/src/redux/thunks/merchantThunk";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";

interface BiometricVerificationGuardProps {
  children: React.ReactNode;
}

/** Loads merchant biometric status in background — no blocking modal */
export default function BiometricVerificationGuard({
  children,
}: BiometricVerificationGuardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const hydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    dispatch(loadMerchantBiometricStatus());
  }, [dispatch, hydrated, isAuthenticated]);

  return children;
}
