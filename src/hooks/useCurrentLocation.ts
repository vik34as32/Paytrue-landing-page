"use client";

import { useCallback, useEffect, useState } from "react";
import { getCurrentLocation } from "@/src/lib/rdService";

export type CurrentLocationCoords = {
  latitude: string;
  longitude: string;
};

/**
 * Fetch the device's current GPS latitude / longitude.
 * Uses the shared `getCurrentLocation()` from rdService (no Delhi fallback).
 *
 * Not for AEPS Merchant Login — that flow already uses useFingerprint().
 */
export function useCurrentLocation(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = false } = options;
  const [location, setLocation] = useState<CurrentLocationCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async (): Promise<CurrentLocationCoords> => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      return coords;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to fetch current location.";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;
    void fetchLocation().catch(() => {
      /* error state already set */
    });
  }, [autoFetch, fetchLocation]);

  return {
    location,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    loading,
    error,
    fetchLocation,
  };
}
