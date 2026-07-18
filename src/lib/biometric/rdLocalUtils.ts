import {
  RD_SERVICE_PROTOCOLS,
} from "@/src/constants/aepsApi";

/** True when the portal itself is opened on the retailer's PC (local Next.js / localhost). */
export function isLocalAppHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname || "";
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "[::1]" ||
    host.endsWith(".local")
  );
}

/**
 * Prefer HTTPS RD endpoints when the portal is HTTPS to avoid mixed-content blocks.
 * HTTP is still tried first on HTTP portals (typical local next dev).
 */
export function getPreferredRdProtocols(): readonly string[] {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return ["https", "http"];
  }
  return RD_SERVICE_PROTOCOLS;
}

export const MORPHO_RD_SETUP_HELP =
  "Start Morpho RD L1 on this PC (ports 11100–11105). If the portal is HTTPS, open https://127.0.0.1:11100 in Chrome once, accept the certificate warning, then click Connect again.";

export const MANTRA_RD_SETUP_HELP =
  "Start Mantra L1 AVDM on this PC (ports 11100–11105). If the portal is HTTPS, open https://127.0.0.1:11100 in Chrome once, accept the certificate warning, then retry.";

/** Map Node/browser connection errors to retailer-friendly Morpho guidance. */
export function formatMorphoRdError(error: unknown, fallback?: string): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  if (/ECONNREFUSED/i.test(raw) || /127\.0\.0\.1:1110/i.test(raw)) {
    return `Morpho RD Service is not reachable on this PC. ${MORPHO_RD_SETUP_HELP}`;
  }

  if (/SSL|certificate|ERR_CERT/i.test(raw)) {
    return `Morpho HTTPS certificate is not trusted yet. Open https://127.0.0.1:11100 in Chrome, click Advanced → Proceed, then retry Connect.`;
  }

  if (/mixed content|insecure/i.test(raw)) {
    return `Browser blocked HTTP access to Morpho RD. ${MORPHO_RD_SETUP_HELP}`;
  }

  return (
    (raw && !/^connect\s+ECONNREFUSED/i.test(raw) ? raw : null) ||
    fallback ||
    `Morpho RD Service not found. ${MORPHO_RD_SETUP_HELP}`
  );
}

export function formatLocalRdProxyError(error: unknown, url?: string): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "Local RD capture failed.";

  if (/ECONNREFUSED/i.test(raw)) {
    return [
      "Cannot reach RD Service at",
      url || "127.0.0.1:11100",
      "from the application server.",
      "Morpho/Mantra RD must run on the retailer's PC (same machine as the browser).",
      MORPHO_RD_SETUP_HELP,
    ].join(" ");
  }

  return raw;
}
