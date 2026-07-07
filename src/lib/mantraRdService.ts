/**
 * @deprecated Import from @/src/lib/rdService instead.
 * Kept for backward compatibility with existing AEPS imports.
 */
export {
  checkRDService,
  getRdServiceStatus,
  discoverRDService,
  detectRdServiceBaseUrl,
  getDeviceInfo,
  captureFingerprint,
  captureFingerprintPid,
  getCurrentLocation,
  clearRdServiceCache,
  rdXhrRequest,
  default as mantraRdService,
} from "@/src/lib/rdService";

export type { RdDiscoveredEndpoint, RdRequestResult } from "@/src/lib/rdService";
export { RdRequestError } from "@/src/lib/rdService";
