"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProvider } from "@/src/lib/biometric/BiometricFactory";
import { bioLog } from "@/src/lib/biometric/biometricLogger";
import {
  selectAepsSelectedDevice,
  setDeviceStatus,
} from "@/src/redux/slices/aepsSlice";
import type { BiometricDeviceType } from "@/src/types/biometric";
import type { RdServiceStatus } from "@/src/types/aeps";

const DEFAULT_STATUS: RdServiceStatus = {
  isRunning: false,
  baseUrl: null,
  rdVersion: "",
  serviceStatus: "",
  deviceConnected: false,
  deviceReady: false,
  scannerModel: "",
  scannerSerialNumber: "",
  provider: "",
  lastCheckedAt: "",
  error: null,
};

interface UseRDServiceOptions {
  pollIntervalMs?: number;
  autoRefresh?: boolean;
}

export function useRDService(options: UseRDServiceOptions = {}) {
  const { pollIntervalMs = 12_000, autoRefresh = true } = options;
  const dispatch = useDispatch();
  const selectedDevice = useSelector(selectAepsSelectedDevice) as BiometricDeviceType;
  const [status, setStatus] = useState<RdServiceStatus>(DEFAULT_STATUS);
  const [isChecking, setIsChecking] = useState(true);
  const [hasCommunicated, setHasCommunicated] = useState(false);
  const mountedRef = useRef(true);
  const deviceRef = useRef(selectedDevice);

  useEffect(() => {
    deviceRef.current = selectedDevice;
  }, [selectedDevice]);

  const refresh = useCallback(
    async (forceRefresh = false) => {
      const device = deviceRef.current || "MANTRA";
      const provider = getProvider(device);
      setIsChecking(true);
      bioLog(device, forceRefresh ? "Refreshing RD Service (forced) ..." : "Refreshing RD Service ...");

      try {
        const next = await provider.checkRDService(forceRefresh);
        if (mountedRef.current && deviceRef.current === device) {
          setStatus(next);
          setHasCommunicated(next.isRunning);
          dispatch(setDeviceStatus(next));
        }
        return next;
      } finally {
        if (mountedRef.current) {
          setIsChecking(false);
        }
      }
    },
    [dispatch]
  );

  useEffect(() => {
    mountedRef.current = true;
    setStatus(DEFAULT_STATUS);
    setHasCommunicated(false);
    refresh(true);

    if (!autoRefresh) {
      return () => {
        mountedRef.current = false;
      };
    }

    const timer = setInterval(() => refresh(false), pollIntervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [autoRefresh, pollIntervalMs, refresh, selectedDevice]);

  return {
    status,
    isChecking,
    hasCommunicated,
    refresh,
    selectedDevice: selectedDevice || "MANTRA",
    isReady: status.isRunning && status.deviceConnected && status.deviceReady,
    canCapture: status.isRunning,
  };
}

export default useRDService;
