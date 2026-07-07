"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  hydrateSelectedDevice,
  selectAepsSelectedDevice,
  setSelectedDevice,
} from "@/src/redux/slices/aepsSlice";
import { clearAllProviderCaches } from "@/src/lib/biometric/BiometricFactory";
import {
  BIOMETRIC_DEVICE_STORAGE_KEY,
  type BiometricDeviceType,
} from "@/src/types/biometric";
import { bioLog } from "@/src/lib/biometric/biometricLogger";

export function useBiometricDevice() {
  const dispatch = useDispatch();
  const selectedDevice = useSelector(selectAepsSelectedDevice) as BiometricDeviceType;

  const changeDevice = useCallback(
    (device: BiometricDeviceType) => {
      if (device === selectedDevice) return;
      bioLog(device, "Device selection changed");
      clearAllProviderCaches();
      dispatch(setSelectedDevice(device));
      if (typeof window !== "undefined") {
        localStorage.setItem(BIOMETRIC_DEVICE_STORAGE_KEY, device);
      }
    },
    [dispatch, selectedDevice]
  );

  const hydrateDevice = useCallback(
    (device: BiometricDeviceType) => {
      dispatch(hydrateSelectedDevice(device));
    },
    [dispatch]
  );

  return {
    selectedDevice: selectedDevice || "MANTRA",
    changeDevice,
    hydrateDevice,
  };
}

export default useBiometricDevice;
