/** Vendor-specific RD Service XML identification */

/** Morpho-specific: NOT Mantra when both may share port range */
export function isMantraRdXml(xml: string): boolean {
  if (isMorphoRdXml(xml)) return false;
  const trimmed = (xml || "").trim();
  return /<\s*RDService\b/i.test(trimmed) || /<\s*DeviceInfo\b/i.test(trimmed);
}

export function isMorphoRdXml(xml: string): boolean {
  const body = xml || "";
  if (!/<\s*RDService\b/i.test(body) && !/<\s*DeviceInfo\b/i.test(body)) {
    return false;
  }
  return (
    /morpho/i.test(body) ||
    /idemia/i.test(body) ||
    /mso1300/i.test(body) ||
    /info=["']Morpho/i.test(body) ||
    /mc=["']IDEMIA/i.test(body)
  );
}
