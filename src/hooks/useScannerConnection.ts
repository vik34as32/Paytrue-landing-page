"use client";

import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getProvider } from "@/src/lib/biometric/BiometricFactory";
import { clearAllProviderCaches } from "@/src/lib/biometric/BiometricFactory";
import { bioLog } from "@/src/lib/biometric/biometricLogger";
import {
  formatMorphoRdError,
  MANTRA_RD_SETUP_HELP,
  MORPHO_RD_SETUP_HELP,
} from "@/src/lib/biometric/rdLocalUtils";
import { useRDService, type UseRDServiceOptions } from "@/src/hooks/useRDService";
import { selectAepsSelectedDevice } from "@/src/redux/slices/aepsSlice";
import type { BiometricDeviceType } from "@/src/types/biometric";
import type { RdServiceStatus } from "@/src/types/aeps";

export type ScannerConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "error";

export interface ScannerConnectionResult {
  state: ScannerConnectionState;
  rdStatus: RdServiceStatus;
  scannerModel: string;
  scannerSerial: string;
  message: string;
  error: string | null;
}

export interface UseScannerConnectionOptions extends UseRDServiceOptions {
  autoConnectOnMount?: boolean;
}

export function useScannerConnection(
  autoConnectOnMount = true,
  options: UseScannerConnectionOptions = {}
) {
  const { autoRefresh = true, pollIntervalMs = 10_000 } = options;
  const selectedDevice = useSelector(selectAepsSelectedDevice) as BiometricDeviceType;
  const device = selectedDevice || "MANTRA";
  const { status, refresh, isChecking } = useRDService({
    autoRefresh,
    pollIntervalMs,
  });

  const [connectionState, setConnectionState] = useState<ScannerConnectionState>("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [scannerModel, setScannerModel] = useState("");
  const [scannerSerial, setScannerSerial] = useState("");

  const connectScanner = useCallback(async (): Promise<ScannerConnectionResult> => {
    setConnectionState("connecting");
    setError(null);
    bioLog(device, "Connect scanner — clearing cache and discovering RD Service ...");
    clearAllProviderCaches();

    try {
      const rdStatus = await refresh(true);

      if (!rdStatus?.isRunning) {
        const msg =
          device === "MORPHO"
            ? `Morpho RD Service not found. ${MORPHO_RD_SETUP_HELP}`
            : `Mantra RD Service not found. ${MANTRA_RD_SETUP_HELP}`;
        throw new Error(msg);
      }

      const provider = getProvider(device);
      const deviceInfo = await provider.getDeviceInfo();

      const model =
        rdStatus.scannerModel ||
        deviceInfo?.parsed?.scannerModel ||
        (device === "MANTRA" ? "Mantra MFS110" : "Morpho MSO 1300");
      const serial =
        rdStatus.scannerSerialNumber ||
        deviceInfo?.parsed?.scannerSerialNumber ||
        "";

      setScannerModel(model);
      setScannerSerial(serial);
      setConnectionState("connected");

      const readyMsg =
        device === "MANTRA"
          ? `Mantra connected (${model}). Click "Start Finger Scan" — scanner light will glow.`
          : `Morpho connected (${model}). Click "Start Finger Scan" — place finger on scanner.`;

      setMessage(readyMsg);
      bioLog(device, "Scanner connected", { model, serial, baseUrl: rdStatus.baseUrl });

      return {
        state: "connected",
        rdStatus,
        scannerModel: model,
        scannerSerial: serial,
        message: readyMsg,
        error: null,
      };
    } catch (err) {
      const errMsg =
        device === "MORPHO"
          ? formatMorphoRdError(err)
          : err instanceof Error
            ? /ECONNREFUSED/i.test(err.message)
              ? `Mantra RD Service is not reachable. ${MANTRA_RD_SETUP_HELP}`
              : err.message
            : "Unable to connect scanner.";
      setConnectionState("error");
      setError(errMsg);
      setMessage("");
      return {
        state: "error",
        rdStatus: status,
        scannerModel: "",
        scannerSerial: "",
        message: "",
        error: errMsg,
      };
    }
  }, [device, refresh, status]);

  useEffect(() => {
    if (!autoConnectOnMount) return;
    connectScanner();
  }, [autoConnectOnMount, device]); // eslint-disable-line react-hooks/exhaustive-deps -- connect once per device

  const isConnected = connectionState === "connected" && status.isRunning;
  const isConnecting = connectionState === "connecting" || isChecking;

  return {
    device,
    rdStatus: status,
    connectionState,
    isConnected,
    isConnecting,
    scannerModel,
    scannerSerial,
    message,
    error,
    connectScanner,
    refreshConnection: connectScanner,
  };
}

export default useScannerConnection;
