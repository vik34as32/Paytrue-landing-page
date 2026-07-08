import {
  RD_CAPTURE_TIMEOUT_MS,
  RD_PROBE_TIMEOUT_MS,
  RD_SERVICE_HOSTS,
  RD_SERVICE_PATHS,
  RD_SERVICE_PORTS,
  RD_SERVICE_PROTOCOLS,
} from "@/src/constants/aepsApi";
import { rdError, rdLog, rdLogAttempt, rdLogResult, rdWarn } from "@/src/lib/rdServiceLogger";
import { formatGeoLocation } from "@/src/lib/geoUtils";
import { assertPidCaptureXml } from "@/src/lib/pidParser";
import type { AepsPidCaptureResult, PidCaptureOptions, RdServiceStatus } from "@/src/types/aeps";

/** Custom HTTP methods per UIDAI / Mantra RD Service specification */
const RD_METHOD = {
  discover: "RDSERVICE",
  deviceInfo: "DEVICEINFO",
  capture: "CAPTURE",
} as const;

export interface RdDiscoveredEndpoint {
  baseUrl: string;
  protocol: "http" | "https";
  host: string;
  port: number;
  capturePath: string;
  deviceInfoPath: string;
  rdVersion: string;
  serviceStatus: string;
  rawInfoXml: string;
}

export interface RdRequestResult {
  url: string;
  method: string;
  status: number;
  statusText: string;
  body: string;
}

export type RdRequestErrorType =
  | "timeout"
  | "connection_refused"
  | "ssl_error"
  | "network"
  | "empty"
  | "aborted";

export class RdRequestError extends Error {
  type: RdRequestErrorType;
  url: string;
  method: string;

  constructor(
    type: RdRequestErrorType,
    url: string,
    method: string,
    message: string
  ) {
    super(message);
    this.name = "RdRequestError";
    this.type = type;
    this.url = url;
    this.method = method;
  }
}

function parseXmlTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  return xml.match(regex)?.[1]?.trim() ?? "";
}

function parseXmlAttr(xml: string, tag: string, attr: string): string {
  const tagRegex = new RegExp(`<${tag}[^>]*>`, "i");
  const tagMatch = xml.match(tagRegex)?.[0] ?? "";
  const attrRegex = new RegExp(`${attr}\\s*=\\s*["']([^"']*)["']`, "i");
  return tagMatch.match(attrRegex)?.[1]?.trim() ?? "";
}

/** DeviceInfo `mc` is a certificate blob — not a human-readable provider label */
export function looksLikeRdCertificate(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 80 || /^MII[A-Za-z0-9+/]+=*$/.test(trimmed);
}

export function resolveRdProviderLabel(value: string | undefined, fallback: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed || looksLikeRdCertificate(trimmed)) return fallback;
  if (/MFS/i.test(trimmed)) return "Mantra L1";
  if (/Morpho|MSO|IDEMIA/i.test(trimmed)) return "IDEMIA Morpho";
  return trimmed.length > 48 ? fallback : trimmed;
}

export function formatRdDeviceSubtitle(status: RdServiceStatus): string {
  const model = status.scannerModel?.trim();
  if (model && !looksLikeRdCertificate(model)) {
    return `${model} — RD Service & scanner`;
  }

  const provider = status.provider?.trim();
  if (provider && !looksLikeRdCertificate(provider)) {
    return `${provider} — RD Service & scanner`;
  }

  return "Biometric RD Service & scanner";
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
  if (!trimmed) return false;
  return /<\s*RDService\b/i.test(trimmed) || /<\s*DeviceInfo\b/i.test(trimmed);
}

function classifyXhrFailure(
  url: string,
  method: string,
  protocol: string,
  xhr: XMLHttpRequest
): RdRequestError {
  if (protocol === "https") {
    rdError("SSL failure or HTTPS handshake failed", { url, method });
    return new RdRequestError(
      "ssl_error",
      url,
      method,
      "HTTPS RD Service request failed (SSL/certificate)."
    );
  }

  rdError("Connection refused or network error", { url, method, readyState: xhr.readyState });
  return new RdRequestError(
    "connection_refused",
    url,
    method,
    "Could not connect to RD Service on this endpoint."
  );
}

/**
 * Low-level RD communication via XMLHttpRequest.
 * Supports custom methods: RDSERVICE, DEVICEINFO, CAPTURE (not standard GET/POST).
 */
export function rdXhrRequest(
  method: string,
  url: string,
  body: string | null = null,
  timeoutMs = RD_PROBE_TIMEOUT_MS
): Promise<RdRequestResult> {
  if (typeof window === "undefined" || typeof XMLHttpRequest === "undefined") {
    return Promise.reject(
      new RdRequestError("network", url, method, "RD Service requires a browser environment.")
    );
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    try {
      xhr.open(method, url, true);
    } catch (error) {
      rdError("Failed to open XHR", { url, method, error });
      reject(
        new RdRequestError(
          "network",
          url,
          method,
          error instanceof Error ? error.message : "Invalid RD Service URL."
        )
      );
      return;
    }

    xhr.timeout = timeoutMs;

    if (body) {
      try {
        xhr.setRequestHeader("Content-Type", "text/xml; charset=UTF-8");
      } catch {
        // Some browsers restrict headers on certain methods — continue anyway
      }
    }

    xhr.onload = () => {
      const responseBody = xhr.responseText ?? "";
      rdLogResult("RD response received", {
        url,
        method,
        status: xhr.status,
        statusText: xhr.statusText,
        bodyLength: responseBody.length,
        bodyPreview: responseBody.slice(0, 400),
      });

      if (!responseBody.trim()) {
        rdWarn("Empty response body", { url, method, status: xhr.status });
      }

      resolve({
        url,
        method,
        status: xhr.status,
        statusText: xhr.statusText,
        body: responseBody,
      });
    };

    xhr.onerror = () => {
      const protocol = url.startsWith("https") ? "https" : "http";
      reject(classifyXhrFailure(url, method, protocol, xhr));
    };

    xhr.ontimeout = () => {
      rdError("Request timeout", { url, method, timeoutMs });
      reject(
        new RdRequestError("timeout", url, method, "RD Service request timed out.")
      );
    };

    xhr.onabort = () => {
      reject(new RdRequestError("aborted", url, method, "RD Service request aborted."));
    };

    try {
      xhr.send(body);
    } catch (error) {
      rdError("XHR send failed", { url, method, error });
      reject(
        new RdRequestError(
          "network",
          url,
          method,
          error instanceof Error ? error.message : "Failed to send RD Service request."
        )
      );
    }
  });
}

async function tryRdCommunication(
  protocol: string,
  host: string,
  port: number,
  vendorFilter?: (xml: string) => boolean
): Promise<RdDiscoveredEndpoint | null> {
  const baseUrl = `${protocol}://${host}:${port}`;

  const discoveryAttempts: Array<{ method: string; url: string }> = [
    { method: RD_METHOD.discover, url: baseUrl },
    { method: RD_METHOD.discover, url: `${baseUrl}/` },
    { method: "GET", url: `${baseUrl}${RD_SERVICE_PATHS.info}` },
    { method: RD_METHOD.deviceInfo, url: `${baseUrl}${RD_SERVICE_PATHS.info}` },
  ];

  for (const attempt of discoveryAttempts) {
    rdLogAttempt(protocol, host, port, attempt.method, attempt.url.replace(baseUrl, "") || "/");

    try {
      const response = await rdXhrRequest(attempt.method, attempt.url, null, RD_PROBE_TIMEOUT_MS);

      if (!isRdServiceXml(response.body)) {
        rdWarn("Response is not RD Service XML — skipping endpoint", {
          url: attempt.url,
          method: attempt.method,
          status: response.status,
          body: response.body.slice(0, 200),
        });
        continue;
      }

      if (vendorFilter && !vendorFilter(response.body)) {
        rdWarn("RD Service found but vendor filter did not match — skipping", {
          url: attempt.url,
          bodyPreview: response.body.slice(0, 200),
        });
        continue;
      }

      rdLog("RD Service Found", {
        baseUrl,
        protocol,
        port,
        method: attempt.method,
        status: response.status,
      });

      const capturePath =
        parseInterfacePath(response.body, "CAPTURE") || RD_SERVICE_PATHS.capture;
      const deviceInfoPath =
        parseInterfacePath(response.body, "DEVICEINFO") ||
        RD_SERVICE_PATHS.info;

      return {
        baseUrl,
        protocol: protocol as "http" | "https",
        host,
        port,
        capturePath: capturePath.startsWith("/") ? capturePath : `/${capturePath}`,
        deviceInfoPath: deviceInfoPath.startsWith("/") ? deviceInfoPath : `/${deviceInfoPath}`,
        rdVersion: parseXmlAttr(response.body, "RDService", "ver"),
        serviceStatus: parseXmlAttr(response.body, "RDService", "status"),
        rawInfoXml: response.body,
      };
    } catch (error) {
      if (error instanceof RdRequestError) {
        rdWarn(`${error.type}: ${error.message}`, { url: error.url, method: error.method });
      } else {
        rdWarn("Discovery attempt failed", { url: attempt.url, error });
      }
    }
  }

  return null;
}

/**
 * Scan all host × port × protocol combinations and return the first working RD endpoint.
 */
export async function discoverRDService(
  vendorFilter?: (xml: string) => boolean
): Promise<RdDiscoveredEndpoint | null> {
  rdLog("Starting RD Service discovery ...");

  for (const protocol of RD_SERVICE_PROTOCOLS) {
    rdLog(`Trying ${protocol.toUpperCase()} protocol ...`);

    for (const host of RD_SERVICE_HOSTS) {
      for (const port of RD_SERVICE_PORTS) {
        const found = await tryRdCommunication(protocol, host, port, vendorFilter);
        if (found) {
          return found;
        }
      }
    }
  }

  rdError("RD Service Not Found — tested all hosts, ports, and protocols.");
  return null;
}

let cachedEndpoint: RdDiscoveredEndpoint | null = null;

export function clearRdServiceCache(): void {
  cachedEndpoint = null;
}

export function getCachedRdEndpoint(): RdDiscoveredEndpoint | null {
  return cachedEndpoint;
}

async function resolveEndpoint(
  forceRefresh = false,
  vendorFilter?: (xml: string) => boolean
): Promise<RdDiscoveredEndpoint | null> {
  if (!forceRefresh && cachedEndpoint) {
    return cachedEndpoint;
  }
  cachedEndpoint = await discoverRDService(vendorFilter);
  return cachedEndpoint;
}

function buildPidOptions(options: PidCaptureOptions = {}): string {
  const env = options.env ?? "P";
  const wadh = options.wadh?.trim();
  const wadhAttr = wadh ? ` wadh="${wadh}"` : "";

  return `<?xml version="1.0"?>
<PidOptions ver="1.0">
  <Opts fCount="1" fType="2" iCount="0" pCount="0" format="0" pidVer="2.0" timeout="20000" posh="UNKNOWN" env="${env}"${wadhAttr} />
  <CustOpts>
    <Param name="mantrakey" value="" />
  </CustOpts>
</PidOptions>`;
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

function mapServiceStatusToFlags(serviceStatus: string): {
  deviceConnected: boolean;
  deviceReady: boolean;
} {
  const normalized = (serviceStatus || "").toUpperCase();
  if (!normalized) {
    return { deviceConnected: false, deviceReady: false };
  }
  if (normalized === "NOTREADY" || normalized === "BUSY") {
    return { deviceConnected: true, deviceReady: false };
  }
  if (/READY|USED/.test(normalized)) {
    return { deviceConnected: true, deviceReady: true };
  }
  return { deviceConnected: true, deviceReady: false };
}

function parseDeviceInfoXml(xml: string): Partial<RdServiceStatus> {
  const deviceStatus = parseXmlAttr(xml, "DeviceInfo", "status");
  const scannerModel =
    parseXmlAttr(xml, "DeviceInfo", "mi") ||
    parseXmlAttr(xml, "DeviceInfo", "dpId") ||
    parseXmlTag(xml, "mi");
  const scannerSerialNumber =
    parseXmlAttr(xml, "DeviceInfo", "dc") ||
    parseXmlTag(xml, "dc");
  const manufacturerId =
    parseXmlAttr(xml, "DeviceInfo", "mi") || parseXmlTag(xml, "mi");
  const provider = resolveRdProviderLabel(manufacturerId, "Mantra");
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
    scannerModel: scannerModel || "Mantra MFS110",
    scannerSerialNumber,
    provider,
  };
}

/**
 * Fetch device info using DEVICEINFO custom method (falls back to GET).
 */
export async function getDeviceInfo(
  endpoint: RdDiscoveredEndpoint
): Promise<{ xml: string; parsed: Partial<RdServiceStatus> } | null> {
  const url = `${endpoint.baseUrl}${endpoint.deviceInfoPath}`;
  const attempts = [
    { method: RD_METHOD.deviceInfo, path: endpoint.deviceInfoPath },
    { method: "GET", path: endpoint.deviceInfoPath },
    { method: RD_METHOD.deviceInfo, path: RD_SERVICE_PATHS.deviceInfo },
    { method: "GET", path: RD_SERVICE_PATHS.deviceInfo },
  ];

  for (const attempt of attempts) {
    const attemptUrl = `${endpoint.baseUrl}${attempt.path}`;
    rdLog("Fetching device info", { url: attemptUrl, method: attempt.method });

    try {
      const response = await rdXhrRequest(
        attempt.method,
        attemptUrl,
        null,
        RD_PROBE_TIMEOUT_MS
      );

      if (/<\s*DeviceInfo\b/i.test(response.body)) {
        rdLog("Device info received", {
          url: attemptUrl,
          bodyPreview: response.body.slice(0, 400),
        });
        return { xml: response.body, parsed: parseDeviceInfoXml(response.body) };
      }

      if (isRdServiceXml(response.body)) {
        rdLog("RDService info used for device status", { url: attemptUrl });
        const serviceStatus = parseXmlAttr(response.body, "RDService", "status");
        const flags = mapServiceStatusToFlags(serviceStatus);
        return {
          xml: response.body,
          parsed: {
            serviceStatus,
            rdVersion: parseXmlAttr(response.body, "RDService", "ver"),
            deviceConnected: flags.deviceConnected,
            deviceReady: flags.deviceReady,
            scannerModel: parseXmlAttr(response.body, "DeviceInfo", "mi") || "Mantra MFS110",
            scannerSerialNumber: parseXmlAttr(response.body, "DeviceInfo", "dc") || "",
            provider: "Mantra",
          },
        };
      }

      rdWarn("Device info response not recognized", {
        url: attemptUrl,
        status: response.status,
        body: response.body.slice(0, 200),
      });
    } catch (error) {
      rdWarn("Device info request failed", { url: attemptUrl, error });
    }
  }

  return null;
}

/**
 * Verify RD Service is reachable and return full device status.
 */
export async function checkRDService(
  forceRefresh = false,
  vendorFilter?: (xml: string) => boolean
): Promise<RdServiceStatus> {
  const endpoint = await resolveEndpoint(forceRefresh, vendorFilter);

  if (!endpoint) {
    return emptyStatus(
      "RD Service not found. Ensure Mantra L1 AVDM is running (ports 11100–11105)."
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
    provider: "Mantra",
    lastCheckedAt: new Date().toISOString(),
    error: null,
  };

  const deviceInfo = await getDeviceInfo(endpoint);
  if (deviceInfo?.parsed) {
    status = {
      ...status,
      ...deviceInfo.parsed,
      isRunning: true,
      baseUrl: endpoint.baseUrl,
      lastCheckedAt: new Date().toISOString(),
      error: null,
    };
  }

  if (!status.deviceConnected && status.isRunning) {
    status.deviceConnected = serviceFlags.deviceConnected;
    status.deviceReady = serviceFlags.deviceReady;
  }

  if (status.isRunning && !status.scannerModel) {
    status.scannerModel = "Mantra MFS110";
  }

  if (status.isRunning && !status.deviceConnected) {
    status.error =
      "Mantra device not detected. Connect MFS110 and unplug/replug once.";
  } else if (status.isRunning && !status.deviceReady) {
    status.error =
      "Scanner connected but not ready. Wait a moment or replug the device.";
  }

  rdLogResult("RD Service status", {
    isRunning: status.isRunning,
    baseUrl: status.baseUrl,
    serviceStatus: status.serviceStatus,
    deviceConnected: status.deviceConnected,
    deviceReady: status.deviceReady,
    scannerModel: status.scannerModel,
    scannerSerialNumber: status.scannerSerialNumber,
    rdVersion: status.rdVersion,
  });

  return status;
}

function normalizeRdPath(path: string): string {
  if (!path?.trim()) return "";
  const trimmed = path.trim();
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function alternateBaseUrls(baseUrl: string): string[] {
  const urls = [baseUrl];
  if (baseUrl.includes("127.0.0.1")) {
    urls.push(baseUrl.replace("127.0.0.1", "localhost"));
  } else if (baseUrl.includes("localhost")) {
    urls.push(baseUrl.replace("localhost", "127.0.0.1"));
  }
  return [...new Set(urls)];
}

function buildMantraCaptureUrls(endpoint: RdDiscoveredEndpoint): string[] {
  const xmlPath = endpoint.rawInfoXml
    ? parseInterfacePath(endpoint.rawInfoXml, "CAPTURE")
    : "";

  const paths = [xmlPath, endpoint.capturePath, RD_SERVICE_PATHS.capture]
    .map(normalizeRdPath)
    .filter((path, index, list) => path && list.indexOf(path) === index);

  const urls: string[] = [];
  for (const base of alternateBaseUrls(endpoint.baseUrl)) {
    for (const path of paths) {
      urls.push(`${base}${path}`);
    }
  }
  return [...new Set(urls)];
}

/**
 * Mantra RD Service capture — UIDAI spec uses custom HTTP verb CAPTURE (never POST).
 * Matches official Mantra SDK: xhr.open('CAPTURE', url), responseType text, no extra headers.
 */
export function rdCaptureRequest(
  url: string,
  pidOptionsXml: string,
  timeoutMs = RD_CAPTURE_TIMEOUT_MS
): Promise<RdRequestResult> {
  if (typeof window === "undefined" || typeof XMLHttpRequest === "undefined") {
    return Promise.reject(
      new RdRequestError(
        "network",
        url,
        RD_METHOD.capture,
        "RD capture requires a browser environment."
      )
    );
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    try {
      xhr.open(RD_METHOD.capture, url, true);
      xhr.responseType = "text";
    } catch (error) {
      reject(
        new RdRequestError(
          "network",
          url,
          RD_METHOD.capture,
          error instanceof Error ? error.message : "Invalid capture URL."
        )
      );
      return;
    }

    xhr.timeout = timeoutMs;

    xhr.onload = () => {
      const responseBody = xhr.responseText ?? "";
      rdLogResult("RD CAPTURE response", {
        url,
        status: xhr.status,
        statusText: xhr.statusText,
        bodyLength: responseBody.length,
        bodyPreview: responseBody.slice(0, 400),
      });

      if (xhr.status === 405) {
        reject(
          new RdRequestError(
            "network",
            url,
            RD_METHOD.capture,
            "Capture endpoint rejected CAPTURE method (405). Update Mantra L1 AVDM."
          )
        );
        return;
      }

      if (xhr.status >= 400) {
        reject(
          new RdRequestError(
            "network",
            url,
            RD_METHOD.capture,
            `Capture request failed (HTTP ${xhr.status}).`
          )
        );
        return;
      }

      resolve({
        url,
        method: RD_METHOD.capture,
        status: xhr.status,
        statusText: xhr.statusText,
        body: responseBody,
      });
    };

    xhr.onerror = () => {
      const protocol = url.startsWith("https") ? "https" : "http";
      reject(classifyXhrFailure(url, RD_METHOD.capture, protocol, xhr));
    };

    xhr.ontimeout = () => {
      reject(
        new RdRequestError(
          "timeout",
          url,
          RD_METHOD.capture,
          "Fingerprint capture timed out. Place finger on scanner and retry."
        )
      );
    };

    xhr.onabort = () => {
      reject(
        new RdRequestError("aborted", url, RD_METHOD.capture, "Fingerprint capture aborted.")
      );
    };

    try {
      xhr.send(pidOptionsXml);
    } catch (error) {
      reject(
        new RdRequestError(
          "network",
          url,
          RD_METHOD.capture,
          error instanceof Error ? error.message : "Failed to send capture request."
        )
      );
    }
  });
}

async function captureFingerprintViaLocalProxy(
  endpoint: RdDiscoveredEndpoint,
  pidOptionsXml: string
): Promise<RdRequestResult> {
  const captureUrls = buildMantraCaptureUrls(endpoint);
  rdLog("Trying local RD capture proxy", { captureUrls });

  const response = await fetch("/api/local-rd/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      captureUrls,
      pidOptions: pidOptionsXml,
    }),
  });

  const payload = (await response.json()) as {
    success?: boolean;
    body?: string;
    url?: string;
    error?: string;
  };

  if (!response.ok || !payload.success || !payload.body) {
    throw new Error(payload.error || "Local RD capture proxy failed.");
  }

  return {
    url: payload.url || captureUrls[0] || endpoint.baseUrl,
    method: RD_METHOD.capture,
    status: 200,
    statusText: "OK",
    body: payload.body,
  };
}

function parseCaptureResponse(
  response: RdRequestResult,
  options: PidCaptureOptions
): AepsPidCaptureResult {
  const pidXml = (response.body || "").trim();

  if (pidXml && /<\s*PidData\b/i.test(pidXml)) {
    assertPidCaptureXml(pidXml);
    rdLog("Capture Success", {
      url: response.url,
      method: response.method,
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
  throw new Error(
    errInfo || (errCode ? `Capture failed (code ${errCode})` : "Fingerprint capture failed.")
  );
}

async function tryCaptureAtUrls(
  captureUrls: string[],
  pidOptionsXml: string,
  options: PidCaptureOptions
): Promise<AepsPidCaptureResult> {
  let lastError: Error | null = null;

  for (const url of captureUrls) {
    rdLog("Sending CAPTURE request", { url });
    try {
      const response = await rdCaptureRequest(url, pidOptionsXml, RD_CAPTURE_TIMEOUT_MS);
      return parseCaptureResponse(response, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Fingerprint capture failed.");
      rdError("Capture Failed", { url, method: RD_METHOD.capture, error: lastError.message });
    }
  }

  throw lastError ?? new Error("Fingerprint capture failed.");
}

/**
 * Capture fingerprint PID XML from Mantra device via CAPTURE method.
 */
export async function captureFingerprint(
  endpointOverride?: RdDiscoveredEndpoint | null,
  options: PidCaptureOptions = {}
): Promise<AepsPidCaptureResult> {
  rdLog("Capture Started");

  const endpoint = endpointOverride ?? (await resolveEndpoint(false));
  if (!endpoint) {
    rdError("Capture Failed — RD Service not discovered");
    throw new Error(
      "RD Service not found. Ensure Mantra L1 AVDM is running on port 11100."
    );
  }

  const pidOptionsXml = buildPidOptions(options);
  const captureUrls = buildMantraCaptureUrls(endpoint);

  try {
    return await tryCaptureAtUrls(captureUrls, pidOptionsXml, options);
  } catch (browserError) {
    rdWarn("Browser CAPTURE failed — trying local RD proxy", { error: browserError });
  }

  try {
    const proxyResponse = await captureFingerprintViaLocalProxy(endpoint, pidOptionsXml);
    return parseCaptureResponse(proxyResponse, options);
  } catch (proxyError) {
    rdError("Capture Failed — browser and proxy attempts exhausted", { error: proxyError });
    throw proxyError instanceof Error
      ? proxyError
      : new Error("Fingerprint capture failed.");
  }
}

export async function getCurrentLocation(): Promise<{
  latitude: string;
  longitude: string;
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Location is not supported in this browser.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(
          formatGeoLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        );
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(new Error("Location permission denied. Allow location to continue."));
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(new Error("Location request timed out. Please retry."));
          return;
        }
        reject(new Error("Unable to fetch current location."));
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
    );
  });
}

/** Backward-compatible aliases */
export const getRdServiceStatus = checkRDService;
export const detectRdServiceBaseUrl = async (): Promise<string | null> => {
  const endpoint = await discoverRDService();
  return endpoint?.baseUrl ?? null;
};
export const captureFingerprintPid = async (
  baseUrl?: string | null
): Promise<AepsPidCaptureResult> => {
  if (baseUrl && cachedEndpoint?.baseUrl === baseUrl) {
    return captureFingerprint(cachedEndpoint);
  }
  if (baseUrl) {
    clearRdServiceCache();
    cachedEndpoint = {
      baseUrl,
      protocol: baseUrl.startsWith("https") ? "https" : "http",
      host: baseUrl.includes("localhost") ? "localhost" : "127.0.0.1",
      port: Number(baseUrl.split(":").pop()) || 11100,
      capturePath: RD_SERVICE_PATHS.capture,
      deviceInfoPath: RD_SERVICE_PATHS.info,
      rdVersion: "",
      serviceStatus: "",
      rawInfoXml: "",
    };
  }
  return captureFingerprint();
};

export default {
  discoverRDService,
  checkRDService,
  getDeviceInfo,
  captureFingerprint,
  getCurrentLocation,
  clearRdServiceCache,
  getCachedRdEndpoint,
  rdXhrRequest,
  rdCaptureRequest,
};
