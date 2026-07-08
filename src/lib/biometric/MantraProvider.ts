import {
  captureFingerprint,
  checkRDService,
  clearRdServiceCache,
  discoverRDService,
  getCachedRdEndpoint,
  getDeviceInfo,
  type RdDiscoveredEndpoint,
} from "@/src/lib/rdService";
import { isMantraRdXml } from "@/src/lib/biometric/vendorFilters";
import type { AepsPidCaptureResult, PidCaptureOptions, RdServiceStatus } from "@/src/types/aeps";
import type { BiometricProvider } from "@/src/types/biometric";
import { bioLog } from "@/src/lib/biometric/biometricLogger";

let cachedEndpoint: RdDiscoveredEndpoint | null = null;

export class MantraProvider implements BiometricProvider {
  readonly deviceType = "MANTRA" as const;
  readonly label = "Mantra L1";

  clearCache(): void {
    cachedEndpoint = null;
    clearRdServiceCache();
  }

  async discoverRDService(forceRefresh = false): Promise<RdDiscoveredEndpoint | null> {
    bioLog(this.deviceType, "Starting discovery ...");
    if (!forceRefresh && cachedEndpoint) {
      return cachedEndpoint;
    }
    this.clearCache();
    const endpoint = await discoverRDService(isMantraRdXml);
    if (endpoint) {
      cachedEndpoint = endpoint;
      bioLog(this.deviceType, "RD Service Found", endpoint.baseUrl);
    } else {
      bioLog(this.deviceType, "RD Service Not Found");
    }
    return endpoint;
  }

  async checkRDService(forceRefresh = false): Promise<RdServiceStatus> {
    bioLog(this.deviceType, "Checking RD Service ...");
    if (forceRefresh) {
      this.clearCache();
    }
    const status = await checkRDService(forceRefresh, isMantraRdXml);
    cachedEndpoint = getCachedRdEndpoint();
    if (!cachedEndpoint && status.baseUrl) {
      cachedEndpoint = await discoverRDService(isMantraRdXml);
    }
    return {
      ...status,
      provider: status.provider || "Mantra",
    };
  }

  async getDeviceInfo(endpoint?: RdDiscoveredEndpoint | null) {
    const resolved = endpoint ?? cachedEndpoint ?? (await this.discoverRDService());
    if (!resolved) return null;
    return getDeviceInfo(resolved);
  }

  async captureFingerprint(
    forceRefresh = false,
    options?: PidCaptureOptions
  ): Promise<AepsPidCaptureResult> {
    bioLog(this.deviceType, "Capture Started");
    if (forceRefresh || !cachedEndpoint) {
      await this.checkRDService(forceRefresh);
    }
    try {
      const result = await captureFingerprint(cachedEndpoint, options);
      bioLog(this.deviceType, "Capture Success — PID XML received", {
        pidLength: result.pidData.length,
      });
      return result;
    } catch (error) {
      bioLog(this.deviceType, "Capture Failed", error);
      throw error;
    }
  }
}

export const mantraProvider = new MantraProvider();
