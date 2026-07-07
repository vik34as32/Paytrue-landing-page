export interface AepsBiometricData {
  dc: string;
  ci: string;
  hmac: string;
  dpId: string;
  mc: string;
  pidDataType: string;
  sessionKey: string;
  mi: string;
  rdsId: string;
  rdsVer: string;
  pidData: string;
  biometricData: string;
  errCode: string;
  errInfo?: string;
  fCount?: string;
  fType: string;
  iCount: string;
  iType: string;
  pCount?: string;
  pType: string;
  srno: string;
  ts?: string;
  qScore?: string;
  nmPoints?: string;
  encryptedAadhaar?: string;
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

function readPidDataBlock(xml: string): string {
  return parseXmlTag(xml, "Data");
}

function readPidCaptureError(xml: string): string | null {
  const errInfo = parseXmlAttr(xml, "Resp", "errInfo");
  if (errInfo) return errInfo;

  const errCode = parseXmlAttr(xml, "Resp", "errCode");
  if (errCode && errCode !== "0") {
    return `Fingerprint capture failed (code ${errCode}).`;
  }

  return null;
}

/** Validates scanner PID XML before API submit */
export function assertPidCaptureXml(pidXml: string): void {
  const trimmed = (pidXml || "").trim();
  if (!trimmed || !/<\s*PidData\b/i.test(trimmed)) {
    throw new Error("Invalid PID XML received from scanner.");
  }

  const pidData = readPidDataBlock(trimmed);
  if (pidData) return;

  const captureError = readPidCaptureError(trimmed);
  if (captureError) {
    throw new Error(captureError);
  }

  throw new Error(
    "PID data block missing from scanner response. Place finger firmly and scan again."
  );
}

export function parsePidXmlToBiometricData(pidXml: string): AepsBiometricData {
  const trimmed = (pidXml || "").trim();
  assertPidCaptureXml(trimmed);

  const dc = parseXmlAttr(trimmed, "DeviceInfo", "dc");
  const dpId = parseXmlAttr(trimmed, "DeviceInfo", "dpId");
  const mi = parseXmlAttr(trimmed, "DeviceInfo", "mi");
  const mc = parseXmlAttr(trimmed, "DeviceInfo", "mc");
  const rdsId = parseXmlAttr(trimmed, "DeviceInfo", "rdsId");
  const rdsVer = parseXmlAttr(trimmed, "DeviceInfo", "rdsVer");
  const srno = parseXmlAttr(trimmed, "DeviceInfo", "srno") || dc;

  const ci = parseXmlAttr(trimmed, "Skey", "ci");
  const sessionKey = parseXmlTag(trimmed, "Skey");
  const hmac = parseXmlTag(trimmed, "Hmac");

  const pidDataType = parseXmlAttr(trimmed, "Data", "type") || "X";
  const pidData = readPidDataBlock(trimmed);

  const errCode = parseXmlAttr(trimmed, "Resp", "errCode") || "0";
  const errInfo = parseXmlAttr(trimmed, "Resp", "errInfo") || undefined;
  const fCount = parseXmlAttr(trimmed, "Resp", "fCount") || undefined;
  const fType = parseXmlAttr(trimmed, "Resp", "fType") || "2";
  const iCount = parseXmlAttr(trimmed, "Resp", "iCount") || "0";
  const iType = parseXmlAttr(trimmed, "Resp", "iType") || "0";
  const pCount = parseXmlAttr(trimmed, "Resp", "pCount") || undefined;
  const pType = parseXmlAttr(trimmed, "Resp", "pType") || "0";
  const qScore = parseXmlAttr(trimmed, "Resp", "qScore") || undefined;
  const nmPoints = parseXmlAttr(trimmed, "Resp", "nmPoints") || undefined;
  const ts = parseXmlAttr(trimmed, "Resp", "ts") || undefined;

  if (!pidData) {
    const captureError = readPidCaptureError(trimmed);
    throw new Error(
      captureError ||
        "PID data block missing from scanner response. Place finger firmly and scan again."
    );
  }

  if (!dc || !ci || !hmac || !sessionKey) {
    throw new Error("Incomplete biometric capture. Please scan fingerprint again.");
  }

  return {
    dc,
    ci,
    hmac,
    dpId,
    mc,
    pidDataType,
    sessionKey,
    mi,
    rdsId,
    rdsVer,
    pidData,
    biometricData: pidData,
    errCode,
    errInfo,
    fCount,
    fType,
    iCount,
    iType,
    pCount,
    pType,
    srno,
    ts,
    qScore,
    nmPoints,
  };
}

export function createAepsExternalRef(prefix = "AEPS"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
