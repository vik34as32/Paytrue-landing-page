import {
  RD_CAPTURE_TIMEOUT_MS,
  RD_PROBE_TIMEOUT_MS,
  RD_SERVICE_HOSTS,
  RD_SERVICE_PATHS,
  RD_SERVICE_PORTS,
  RD_SERVICE_PROTOCOLS,
} from "@/src/constants/aepsApi";
import {
  rdXhrRequest,
  RdRequestError,
  resolveRdProviderLabel,
  type RdDiscoveredEndpoint,
  type RdRequestResult,
} from "@/src/lib/rdService";
import { isMorphoRdXml } from "@/src/lib/biometric/vendorFilters";
import { bioError, bioLog, bioLogAttempt, bioWarn } from "@/src/lib/biometric/biometricLogger";
import { assertPidCaptureXml } from "@/src/lib/pidParser";
import type { AepsPidCaptureResult, PidCaptureOptions, RdServiceStatus } from "@/src/types/aeps";

const DEVICE_TYPE = "MORPHO" as const;

const RD_METHOD = {
  discover: "RDSERVICE",
  deviceInfo: "DEVICEINFO",
  capture: "CAPTURE",
} as const;

/** Morpho may expose alternate interface paths from RDSERVICE response */
const MORPHO_FALLBACK_PATHS = {
  capture: ["/capture", "/rd/capture"],
  deviceInfo: ["/getDeviceInfo", "/rd/info", "/rd/deviceinfo"],
};

let cachedEndpoint: RdDiscoveredEndpoint | null = null;

function parseXmlAttr(xml: string, tag: string, attr: string): string {
  const tagRegex = new RegExp(`<${tag}[^>]*>`, "i");
  const tagMatch = xml.match(tagRegex)?.[0] ?? "";
  const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, "i");
  return tagMatch.match(attrRegex)?.[1]?.trim() ?? "";
}

function parseInterfacePath(xml: string, interfaceId: string): string {
  const regex = new RegExp(
    `<Interface[^>]*id\\s*=\\s*["']${interfaceId}["'][^>]*path\\s*=\\s*["']([^"']*)["']`,
    "i"
  );
  const reverseRegex = new RegExp(
    `<Interface[^>]*path\\s*=\\s*["']([^"']*)["'][^>]*id\\s*=\\s*["']${interfaceId}["']`,
    "i"
  );
  return xml.match(regex)?.[1]?.trim() || xml.match(reverseRegex)?.[1]?.trim() || "";
}

function isRdServiceXml(body: string): boolean {
  const trimmed = (body || "").trim();
  return /<\s*RDService\b/i.test(trimmed) || /<\s*DeviceInfo\b/i.test(trimmed);
}

/**
 * Morpho Interface paths may be absolute host paths e.g. /127.0.0.1:11100/capture
 */
export function resolveMorphoRdUrl(baseUrl: string, path: string): string {
  if (!path) return `${baseUrl}${RD_SERVICE_PATHS.capture}`;
  if (/^https?:\/\//i.test(path)) return path;
  if (/^\/127\.0\.0\.1:\d+/i.test(path) || /^\/localhost:\d+/i.test(path)) {
    return `http://${path.slice(1)}`;
  }
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildMorphoPidOptions(options: PidCaptureOptions = {}): string {
  const env = options.env ?? "P";
  const wadh = options.wadh?.trim();
  const wadhAttr = wadh ? ` wadh="${wadh}"` : "";

  return `<?xml version="1.0"?>
<PidOptions ver="1.0">
  <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="${env}"${wadhAttr} />
</PidOptions>`;
}

function mapServiceStatusToFlags(serviceStatus: string): {
  deviceConnected: boolean;
  deviceReady: boolean;
} {
  const normalized = (serviceStatus || "").toUpperCase();
  if (!normalized) return { deviceConnected: false, deviceReady: false };
  if (normalized === "NOTREADY" || normalized === "BUSY") {
    return { deviceConnected: true, deviceReady: false };
  }
  if (/READY|USED/.test(normalized)) {
    return { deviceConnected: true, deviceReady: true };
  }
  return { deviceConnected: true, deviceReady: false };
}

function emptyStatus(error: string | null = null): RdServiceStatus {
  return {
    isRunning: false,
    baseUrl: null,
    rdVersion: "",
    serviceStatus: "",
    deviceConnected: false,
    deviceReady: false,
    scannerModel: "",
    scannerSerialNumber: "",
    provider: "",
    lastCheckedAt: new Date().toISOString(),
    error,
  };
}

function parseDeviceInfoXml(xml: string): Partial<RdServiceStatus> {
  const deviceStatus = parseXmlAttr(xml, "DeviceInfo", "status");
  const scannerModel =
    parseXmlAttr(xml, "DeviceInfo", "mi") ||
    parseXmlAttr(xml, "DeviceInfo", "dpId") ||
    "Morpho MSO 1300 E3";
  const scannerSerialNumber =
    parseXmlAttr(xml, "DeviceInfo", "dc") ||
    parseXmlAttr(xml, "DeviceInfo", "serialNumber") ||
    "";
  const manufacturerId = parseXmlAttr(xml, "DeviceInfo", "mi") || "";
  const provider = resolveRdProviderLabel(manufacturerId, "IDEMIA Morpho");
  const rdVersion = parseXmlAttr(xml, "DeviceInfo", "rdsVer") || "";

  const flags = deviceStatus
    ? mapServiceStatusToFlags(deviceStatus)
    : {
        deviceConnected: Boolean(scannerModel || scannerSerialNumber),
        deviceReady: Boolean(scannerModel || scannerSerialNumber),
      };

  return {
    rdVersion,
    serviceStatus: deviceStatus,
    deviceConnected: flags.deviceConnected,
    deviceReady: flags.deviceReady,
    scannerModel,
    scannerSerialNumber,
    provider,
  };
}

async function tryMorphoDiscovery(
  protocol: string,
  host: string,
  port: number
): Promise<RdDiscoveredEndpoint | null> {
  const baseUrl = `${protocol}://${host}:${port}`;

  const attempts: Array<{ method: string; url: string }> = [
    { method: RD_METHOD.discover, url: baseUrl },
    { method: RD_METHOD.discover, url: `${baseUrl}/` },
    { method: RD_METHOD.deviceInfo, url: `${baseUrl}${RD_SERVICE_PATHS.info}` },
    { method: "GET", url: `${baseUrl}${RD_SERVICE_PATHS.info}` },
  ];

  for (const attempt of attempts) {
    bioLogAttempt(
      DEVICE_TYPE,
      protocol,
      host,
      port,
      attempt.method,
      attempt.url.replace(baseUrl, "") || "/"
    );

    try {
      const response: RdRequestResult = await rdXhrRequest(
        attempt.method,
        attempt.url,
        null,
        RD_PROBE_TIMEOUT_MS
      );

      if (!isRdServiceXml(response.body)) {
        bioWarn(DEVICE_TYPE, "Not RD XML", {
          url: attempt.url,
          status: response.status,
        });
        continue;
      }

      if (!isMorphoRdXml(response.body)) {
        bioWarn(DEVICE_TYPE, "Vendor mismatch — not Morpho RD Service", {
          url: attempt.url,
          bodyPreview: response.body.slice(0, 200),
        });
        continue;
      }

      bioLog(DEVICE_TYPE, "RD Service Found", {
        baseUrl,
        protocol,
        port,
        method: attempt.method,
      });

      const capturePath =
        parseInterfacePath(response.body, "CAPTURE") ||
        MORPHO_FALLBACK_PATHS.capture[0];
      const deviceInfoPath =
        parseInterfacePath(response.body, "DEVICEINFO") ||
        MORPHO_FALLBACK_PATHS.deviceInfo[0];

      return {
        baseUrl,
        protocol: protocol as "http" | "https",
        host,
        port,
        capturePath,
        deviceInfoPath,
        rdVersion: parseXmlAttr(response.body, "RDService", "ver"),
        serviceStatus: parseXmlAttr(response.body, "RDService", "status"),
        rawInfoXml: response.body,
      };
    } catch (error) {
      if (error instanceof RdRequestError) {
        bioWarn(DEVICE_TYPE, `${error.type}: ${error.message}`, { url: error.url });
      } else {
        bioWarn(DEVICE_TYPE, "Discovery failed", { url: attempt.url, error });
      }
    }
  }

  return null;
}

export async function discoverMorphoRDService(
  forceRefresh = false
): Promise<RdDiscoveredEndpoint | null> {
  bioLog(DEVICE_TYPE, "Starting Morpho RD Service discovery ...");

  if (!forceRefresh && cachedEndpoint) {
    return cachedEndpoint;
  }

  for (const protocol of RD_SERVICE_PROTOCOLS) {
    bioLog(DEVICE_TYPE, `Trying ${protocol.toUpperCase()} ...`);
    for (const host of RD_SERVICE_HOSTS) {
      for (const port of RD_SERVICE_PORTS) {
        const found = await tryMorphoDiscovery(protocol, host, port);
        if (found) {
          cachedEndpoint = found;
          return found;
        }
      }
    }
  }

  bioError(DEVICE_TYPE, "Morpho RD Service Not Found");
  return null;
}

export function clearMorphoRdCache(): void {
  cachedEndpoint = null;
}

async function resolveEndpoint(forceRefresh: boolean): Promise<RdDiscoveredEndpoint | null> {
  if (!forceRefresh && cachedEndpoint) return cachedEndpoint;
  return discoverMorphoRDService(forceRefresh);
}

export async function getMorphoDeviceInfo(
  endpoint: RdDiscoveredEndpoint
): Promise<{ xml: string; parsed: Partial<RdServiceStatus> } | null> {
  const paths = [
    endpoint.deviceInfoPath,
    ...MORPHO_FALLBACK_PATHS.deviceInfo,
    RD_SERVICE_PATHS.deviceInfo,
  ];

  const uniquePaths = [...new Set(paths.filter(Boolean))];

  for (const path of uniquePaths) {
    const url = resolveMorphoRdUrl(endpoint.baseUrl, path);
    const methods = [RD_METHOD.deviceInfo, "GET"];

    for (const method of methods) {
      bioLog(DEVICE_TYPE, "Fetching device info", { url, method });
      try {
        const response = await rdXhrRequest(method, url, null, RD_PROBE_TIMEOUT_MS);

        if (/<\s*DeviceInfo\b/i.test(response.body)) {
          return { xml: response.body, parsed: parseDeviceInfoXml(response.body) };
        }

        if (isMorphoRdXml(response.body)) {
          const serviceStatus = parseXmlAttr(response.body, "RDService", "status");
          const flags = mapServiceStatusToFlags(serviceStatus);
          return {
            xml: response.body,
            parsed: {
              serviceStatus,
              rdVersion: parseXmlAttr(response.body, "RDService", "ver"),
              deviceConnected: flags.deviceConnected,
              deviceReady: flags.deviceReady,
              scannerModel: "Morpho MSO 1300 E3",
              scannerSerialNumber: parseXmlAttr(response.body, "DeviceInfo", "dc") || "",
              provider: "IDEMIA Morpho",
            },
          };
        }
      } catch (error) {
        bioWarn(DEVICE_TYPE, "Device info request failed", { url, method, error });
      }
    }
  }

  return null;
}

export async function checkMorphoRDService(forceRefresh = false): Promise<RdServiceStatus> {
  const endpoint = await resolveEndpoint(forceRefresh);

  if (!endpoint) {
    return emptyStatus(
      "Morpho RD Service not installed or not running. Install Morpho MSO 1300 E3 RD L1 (ports 11100–11105)."
    );
  }

  const serviceFlags = mapServiceStatusToFlags(endpoint.serviceStatus);
  let status: RdServiceStatus = {
    isRunning: true,
    baseUrl: endpoint.baseUrl,
    rdVersion: endpoint.rdVersion,
    serviceStatus: endpoint.serviceStatus,
    deviceConnected: serviceFlags.deviceConnected,
    deviceReady: serviceFlags.deviceReady,
    scannerModel: "",
    scannerSerialNumber: "",
    provider: "IDEMIA Morpho",
    lastCheckedAt: new Date().toISOString(),
    error: null,
  };

  const deviceInfo = await getMorphoDeviceInfo(endpoint);
  if (deviceInfo?.parsed) {
    status = {
      ...status,
      ...deviceInfo.parsed,
      isRunning: true,
      baseUrl: endpoint.baseUrl,
      provider: deviceInfo.parsed.provider || "IDEMIA Morpho",
      lastCheckedAt: new Date().toISOString(),
      error: null,
    };
  }

  if (status.isRunning && !status.scannerModel) {
    status.scannerModel = "Morpho MSO 1300 E3";
  }

  if (status.isRunning && !status.deviceConnected) {
    status.error =
      "Morpho device not connected. Plug in MSO 1300 E3 and replug once.";
  } else if (status.isRunning && !status.deviceReady) {
    status.error =
      "Morpho scanner connected but not ready. Check RD Service status.";
  }

  bioLog(DEVICE_TYPE, "RD Service status", {
    isRunning: status.isRunning,
    baseUrl: status.baseUrl,
    deviceReady: status.deviceReady,
    scannerModel: status.scannerModel,
  });

  return status;
}

export async function captureMorphoFingerprint(
  forceRefresh = false,
  options: PidCaptureOptions = {}
): Promise<AepsPidCaptureResult> {
  bioLog(DEVICE_TYPE, "Capture Started");

  const endpoint = await resolveEndpoint(forceRefresh);
  if (!endpoint) {
    bioError(DEVICE_TYPE, "Capture Failed — Morpho RD Service not discovered");
    throw new Error(
      "Morpho RD Service not found. Ensure Morpho RD L1 service is running."
    );
  }

  const capturePaths = [
    endpoint.capturePath,
    ...MORPHO_FALLBACK_PATHS.capture,
    RD_SERVICE_PATHS.capture,
  ];
  const uniquePaths = [...new Set(capturePaths.filter(Boolean))];

  let lastError: Error | null = null;

  for (const path of uniquePaths) {
    const captureUrl = resolveMorphoRdUrl(endpoint.baseUrl, path);
    bioLog(DEVICE_TYPE, "Sending CAPTURE request", { url: captureUrl });

    for (const method of [RD_METHOD.capture, "POST"]) {
      try {
        const response = await rdXhrRequest(
          method,
          captureUrl,
          buildMorphoPidOptions(options),
          RD_CAPTURE_TIMEOUT_MS
        );

        const pidXml = (response.body || "").trim();

        if (pidXml && /<\s*PidData\b/i.test(pidXml)) {
          try {
            assertPidCaptureXml(pidXml);
          } catch (validationError) {
            lastError =
              validationError instanceof Error
                ? validationError
                : new Error("Morpho capture failed.");
            bioError(DEVICE_TYPE, "Capture Failed — PID validation", {
              url: captureUrl,
              error: lastError.message,
            });
            continue;
          }

          bioLog(DEVICE_TYPE, "Capture Success — PID XML received", {
            url: captureUrl,
            pidLength: pidXml.length,
            hasWadh: Boolean(options.wadh?.trim()),
          });
          return {
            pidData: pidXml,
            capturedAt: new Date().toISOString(),
          };
        }

        const errCode = parseXmlAttr(pidXml, "Resp", "errCode");
        const errInfo = parseXmlAttr(pidXml, "Resp", "errInfo");
        lastError = new Error(
          errInfo ||
            (errCode
              ? `Morpho capture failed (code ${errCode})`
              : "Morpho capture failed.")
        );
        bioError(DEVICE_TYPE, "Capture Failed — invalid PID", {
          url: captureUrl,
          errCode,
          errInfo,
        });
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error("Morpho capture failed.");
        bioError(DEVICE_TYPE, "Capture Failed", { url: captureUrl, method, error });
      }
    }
  }

  bioError(DEVICE_TYPE, "Capture Failed — all attempts exhausted");
  throw lastError ?? new Error("Morpho capture failed.");
}

export default {
  discoverMorphoRDService,
  checkMorphoRDService,
  getMorphoDeviceInfo,
  captureMorphoFingerprint,
  clearMorphoRdCache,
  resolveMorphoRdUrl,
};
