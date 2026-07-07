import {
  captureMorphoFingerprint,
  checkMorphoRDService,
  clearMorphoRdCache,
  discoverMorphoRDService,
  getMorphoDeviceInfo,
} from "@/src/lib/biometric/MorphoRDService";
import type { RdDiscoveredEndpoint } from "@/src/lib/rdService";
import { bioLog } from "@/src/lib/biometric/biometricLogger";
import type { BiometricProvider } from "@/src/types/biometric";
import type { AepsPidCaptureResult, PidCaptureOptions, RdServiceStatus } from "@/src/types/aeps";

export class MorphoProvider implements BiometricProvider {
  readonly deviceType = "MORPHO" as const;
  readonly label = "Morpho MSO 1300 E3";

  clearCache(): void {
    clearMorphoRdCache();
  }

  async discoverRDService(forceRefresh = false): Promise<RdDiscoveredEndpoint | null> {
    bioLog(this.deviceType, "Starting discovery ...");
    const endpoint = await discoverMorphoRDService(forceRefresh);
    if (endpoint) {
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
    return checkMorphoRDService(forceRefresh);
  }

  async getDeviceInfo(endpoint?: RdDiscoveredEndpoint | null) {
    const resolved = endpoint ?? (await this.discoverRDService());
    if (!resolved) return null;
    return getMorphoDeviceInfo(resolved);
  }

  async captureFingerprint(
    forceRefresh = false,
    options?: PidCaptureOptions
  ): Promise<AepsPidCaptureResult> {
    bioLog(this.deviceType, "Capture Started");
    try {
      const result = await captureMorphoFingerprint(forceRefresh, options);
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

export const morphoProvider = new MorphoProvider();
