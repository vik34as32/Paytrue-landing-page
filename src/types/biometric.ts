import type { AepsPidCaptureResult, PidCaptureOptions, RdServiceStatus } from "@/src/types/aeps";
import type { RdDiscoveredEndpoint } from "@/src/lib/rdService";

export type BiometricDeviceType = "MANTRA" | "MORPHO";

export interface BiometricProvider {
  readonly deviceType: BiometricDeviceType;
  readonly label: string;
  discoverRDService(forceRefresh?: boolean): Promise<RdDiscoveredEndpoint | null>;
  checkRDService(forceRefresh?: boolean): Promise<RdServiceStatus>;
  getDeviceInfo(
    endpoint?: RdDiscoveredEndpoint | null
  ): Promise<{ xml: string; parsed: Partial<RdServiceStatus> } | null>;
  captureFingerprint(
    forceRefresh?: boolean,
    options?: PidCaptureOptions
  ): Promise<AepsPidCaptureResult>;
  clearCache(): void;
}

export interface ScannerInfo {
  model: string;
  serial: string;
  rdVersion: string;
  provider: string;
  baseUrl: string | null;
  deviceType: BiometricDeviceType;
}

export const BIOMETRIC_DEVICE_OPTIONS: Array<{
  value: BiometricDeviceType;
  label: string;
  description: string;
}> = [
  {
    value: "MANTRA",
    label: "Mantra L1",
    description: "Mantra MFS110 / L1 AVDM",
  },
  {
    value: "MORPHO",
    label: "Morpho MSO 1300 E3",
    description: "IDEMIA Morpho RD L1",
  },
];

export const BIOMETRIC_DEVICE_STORAGE_KEY = "aeps_selected_device";
