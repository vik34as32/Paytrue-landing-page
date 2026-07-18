/**
 * InstantPay DMT eKYC PidOptions helpers.
 * GET /dmt/remitter/:mobile/pid-options → save referenceKey + pidOptions once per session.
 */

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return undefined;
}

export function extractPidOptionWadh(...sources: unknown[]): string | undefined {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const record = source as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : {};
    const deep =
      nested.data && typeof nested.data === "object"
        ? (nested.data as Record<string, unknown>)
        : {};
    const metadata =
      record.metadata && typeof record.metadata === "object"
        ? (record.metadata as Record<string, unknown>)
        : {};
    const nestedMeta =
      nested.metadata && typeof nested.metadata === "object"
        ? (nested.metadata as Record<string, unknown>)
        : {};
    const instantPay =
      metadata.instantPay && typeof metadata.instantPay === "object"
        ? (metadata.instantPay as Record<string, unknown>)
        : nestedMeta.instantPay && typeof nestedMeta.instantPay === "object"
          ? (nestedMeta.instantPay as Record<string, unknown>)
          : {};

    const found = pickString(
      record.pidOptionWadh,
      record.pid_option_wadh,
      record.wadh,
      nested.pidOptionWadh,
      nested.pid_option_wadh,
      nested.wadh,
      deep.pidOptionWadh,
      deep.pid_option_wadh,
      deep.wadh,
      metadata.pidOptionWadh,
      metadata.pid_option_wadh,
      metadata.wadh,
      nestedMeta.pidOptionWadh,
      nestedMeta.pid_option_wadh,
      nestedMeta.wadh,
      instantPay.pidOptionWadh,
      instantPay.pid_option_wadh,
      instantPay.wadh
    );
    if (found) return found;
  }
  return undefined;
}

export function extractReferenceKeyFromPidOptions(
  ...sources: unknown[]
): string | undefined {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const record = source as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : {};
    const deep =
      nested.data && typeof nested.data === "object"
        ? (nested.data as Record<string, unknown>)
        : {};

    const found = pickString(
      record.referenceKey,
      record.reference_key,
      nested.referenceKey,
      nested.reference_key,
      deep.referenceKey,
      deep.reference_key
    );
    if (found) return found;
  }
  return undefined;
}

/** Full PidOptions XML from API when provided */
export function extractPidOptionsXml(...sources: unknown[]): string | undefined {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    const record = source as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : {};

    const found = pickString(
      record.pidOptions,
      record.pid_options,
      record.pidOptionsXml,
      nested.pidOptions,
      nested.pid_options,
      nested.pidOptionsXml
    );
    if (found && /<\s*PidOptions\b/i.test(found)) return found;
  }
  return undefined;
}

/**
 * InstantPay PidOptions XML for RD Service.
 * Prefer API-provided XML; otherwise build from pidOptionWadh (never hardcode).
 */
export function buildRdPidOptionsXml(options: { wadh?: string } = {}): string {
  const wadh = (options.wadh ?? "").trim();

  return `<?xml version="1.0"?>
<PidOptions ver="1.0">
    <Opts
        fCount="1"
        fType="2"
        iCount="0"
        iType="0"
        pCount="0"
        pType="0"
        format="0"
        pidVer="2.0"
        timeout="20000"
        otp=""
        wadh="${wadh}"
        posh="UNKNOWN"/>
</PidOptions>`;
}

export interface RemitterPidOptionsResult {
  referenceKey: string;
  /** Full PidOptions XML passed to RD Service as-is */
  pidOptions: string;
  pidOptionWadh: string;
  raw?: Record<string, unknown>;
}

export function normalizeRemitterPidOptions(
  payload: unknown
): RemitterPidOptionsResult {
  const root =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const data =
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : root;

  const referenceKey = extractReferenceKeyFromPidOptions(data, root) || "";
  const pidOptionWadh = extractPidOptionWadh(data, root) || "";
  const fromApiXml = extractPidOptionsXml(data, root);
  const pidOptions =
    fromApiXml ||
    (pidOptionWadh ? buildRdPidOptionsXml({ wadh: pidOptionWadh }) : "");

  return {
    referenceKey,
    pidOptions,
    pidOptionWadh,
    raw: { root, data },
  };
}

export function logRdDebug(info: {
  referenceKey?: string | null;
  pidOptionWadh?: string | null;
  generatedXml?: string | null;
}): void {
  // eslint-disable-next-line no-console -- InstantPay DMT eKYC debug
  console.log("========== RD DEBUG ==========");
  // eslint-disable-next-line no-console
  console.log("referenceKey:", info.referenceKey || "(undefined)");
  // eslint-disable-next-line no-console
  console.log("pidOptionWadh:", info.pidOptionWadh || "(undefined)");
  // eslint-disable-next-line no-console
  console.log("Generated PidOptions XML:", info.generatedXml || "(not generated)");
  // eslint-disable-next-line no-console
  console.log("==============================");
}

export function logEkycDebug(info: {
  referenceKey?: string | null;
  pidLength?: number | null;
}): void {
  // eslint-disable-next-line no-console -- InstantPay DMT eKYC debug
  console.log("========== EKYC DEBUG ==========");
  // eslint-disable-next-line no-console
  console.log("referenceKey:", info.referenceKey || "(undefined)");
  // eslint-disable-next-line no-console
  console.log("PID Length:", info.pidLength ?? "(undefined)");
  // eslint-disable-next-line no-console
  console.log("===============================");
}

/** @deprecated */
export function logFrontendPidDebug(info: {
  apiPidOptionWadh?: string | null;
  reduxPidOptionWadh?: string | null;
  capturePidOptionWadh?: string | null;
  generatedXml?: string | null;
  undefinedAt?: string | null;
  flow?: string;
}): void {
  logRdDebug({
    referenceKey: null,
    pidOptionWadh:
      info.capturePidOptionWadh ||
      info.reduxPidOptionWadh ||
      info.apiPidOptionWadh ||
      null,
    generatedXml: info.generatedXml,
  });
}
