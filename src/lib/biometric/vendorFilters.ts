/** Vendor-specific RD Service XML identification */

function isRdServiceXml(xml: string): boolean {
  const trimmed = (xml || "").trim();
  return /<\s*RDService\b/i.test(trimmed) || /<\s*DeviceInfo\b/i.test(trimmed);
}

/** Mantra-specific markers when both vendors may share port range */
export function isMantraSpecificRdXml(xml: string): boolean {
  const body = xml || "";
  return (
    /mantra/i.test(body) ||
    /\bmfs(?:100|110|\d*)\b/i.test(body) ||
    /mantrakey/i.test(body) ||
    /dpId=["']Mantra/i.test(body)
  );
}

/** Morpho-specific: NOT Mantra when both may share port range */
export function isMantraRdXml(xml: string): boolean {
  if (isMorphoRdXml(xml)) return false;
  return isRdServiceXml(xml);
}

export function isMorphoRdXml(xml: string): boolean {
  const body = xml || "";
  if (!isRdServiceXml(body)) return false;

  return (
    /morpho/i.test(body) ||
    /idemia/i.test(body) ||
    /mso[\s_-]?1300/i.test(body) ||
    /mso[\s_-]?tech/i.test(body) ||
    /safran/i.test(body) ||
    /info=["']Morpho/i.test(body) ||
    /mc=["']IDEMIA/i.test(body) ||
    /dpId=["'][^"']*morpho/i.test(body) ||
    /dpId=["'][^"']*idemia/i.test(body)
  );
}

/**
 * Accept RD endpoints for Morpho discovery when the response is valid RD XML
 * but does not include explicit Morpho branding (common on some L1 builds).
 */
export function isMorphoCandidateRdXml(xml: string): boolean {
  if (!isRdServiceXml(xml)) return false;
  if (isMorphoRdXml(xml)) return true;
  if (isMantraSpecificRdXml(xml)) return false;
  return true;
}
