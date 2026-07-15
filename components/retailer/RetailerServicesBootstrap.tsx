"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";
import { ensureRetailerServicesLoaded } from "@/features/retailer/store/retailerServicesStore";

/**
 * Loads GET /retailer/services once after retailer auth is ready.
 * IDs are cached globally; UI never shows serviceId/serviceCode.
 */
export default function RetailerServicesBootstrap() {
  const hydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || startedRef.current) return;
    startedRef.current = true;
    void ensureRetailerServicesLoaded().catch(() => {
      // Silent on bootstrap — request paths will surface errors if needed.
      startedRef.current = false;
    });
  }, [hydrated, isAuthenticated]);

  return null;
}
