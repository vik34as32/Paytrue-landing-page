"use client";

import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import { getProvider } from "@/src/lib/biometric/BiometricFactory";
import { getCurrentLocation } from "@/src/lib/rdService";
import { bioError, bioLog } from "@/src/lib/biometric/biometricLogger";
import { useRDService } from "@/src/hooks/useRDService";
import { selectAepsSelectedDevice } from "@/src/redux/slices/aepsSlice";
import type { BiometricDeviceType } from "@/src/types/biometric";
import type { AepsLocation, AepsPidCaptureResult, PidCaptureOptions } from "@/src/types/aeps";

export function useFingerprint() {
  const selectedDevice = useSelector(selectAepsSelectedDevice) as BiometricDeviceType;
  const device = selectedDevice || "MANTRA";
  const { status, refresh, canCapture } = useRDService();
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<AepsPidCaptureResult | null>(
    null
  );
  const [location, setLocation] = useState<AepsLocation | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchLocation = useCallback(async (): Promise<AepsLocation> => {
    setIsFetchingLocation(true);
    bioLog(device, "Fetching current location ...");
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      bioLog(device, "Location acquired", coords);
      return coords;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch location.";
      bioError(device, "Location denied or failed", message);
      throw error;
    } finally {
      setIsFetchingLocation(false);
    }
  }, [device]);

  const capture = useCallback(async (options?: PidCaptureOptions): Promise<AepsPidCaptureResult> => {
    setIsCapturing(true);
    const provider = getProvider(device);
    bioLog(device, "Capture Started — re-checking RD Service before capture ...");

    try {
      const rdStatus = await provider.checkRDService(true);

      if (!rdStatus.isRunning) {
        bioError(device, "RD Service Not Found — cannot capture");
        const fallbackMessage =
          device === "MORPHO"
            ? "Morpho RD Service not found. Ensure Morpho RD L1 is running."
            : "Mantra RD Service not found. Ensure Mantra L1 AVDM is running.";
        throw new Error(rdStatus.error || fallbackMessage);
      }

      bioLog(device, "RD Service is running — proceeding to fingerprint capture", {
        baseUrl: rdStatus.baseUrl,
        deviceReady: rdStatus.deviceReady,
        deviceConnected: rdStatus.deviceConnected,
      });

      if (!rdStatus.deviceReady) {
        bioLog(device, "Device not marked ready — attempting capture anyway");
      }

      const result = await provider.captureFingerprint(true, options);
      setLastCapture(result);
      bioLog(device, "PID XML received", { pidLength: result.pidData.length });
      await refresh(true);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Fingerprint capture failed.";
      bioError(device, "Capture Failed", message);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, [device, refresh]);

  const captureWithLocation = useCallback(async () => {
    bioLog(device, "Start flow — location + fingerprint capture");
    const coords = location ?? (await fetchLocation());
    const pid = await capture();
    return { ...coords, pidData: pid.pidData, capture: pid };
  }, [capture, device, fetchLocation, location]);

  return {
    rdStatus: status,
    selectedDevice: device,
    canCapture,
    refreshRdService: refresh,
    isCapturing,
    isFetchingLocation,
    lastCapture,
    location,
    fetchLocation,
    capture,
    captureWithLocation,
  };
}

export default useFingerprint;
