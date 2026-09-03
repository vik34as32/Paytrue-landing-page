import { getCcbpIssuer } from "./ccbp-issuers";
import type { CcbpIssuer } from "../types";

export type CcbpNetwork = "VISA" | "MASTERCARD" | "RUPAY" | "AMEX" | "DINERS" | "UNKNOWN";

export function detectCardNetwork(value: string): CcbpNetwork {
  const d = value.replace(/\D/g, "");
  if (!d) return "UNKNOWN";
  if (/^3[47]/.test(d)) return "AMEX";
  if (/^(36|38|30[0-5]|3095)/.test(d)) return "DINERS";
  if (/^(5[1-5])/.test(d)) return "MASTERCARD";
  if (/^2/.test(d) && d.length >= 4) {
    const n = Number(d.slice(0, 4));
    if (n >= 2221 && n <= 2720) return "MASTERCARD";
  }
  if (/^(508|606|607|608|652|653|81|82)/.test(d)) return "RUPAY";
  if (/^60/.test(d) && d.length >= 2) return "RUPAY";
  if (/^65/.test(d) && d.length >= 2) return "RUPAY";
  if (d.startsWith("4")) return "VISA";
  return "UNKNOWN";
}

export function networkLabel(network: CcbpNetwork): string {
  if (network === "UNKNOWN") return "";
  if (network === "MASTERCARD") return "Mastercard";
  if (network === "RUPAY") return "RuPay";
  if (network === "AMEX") return "American Express";
  if (network === "DINERS") return "Diners Club";
  return "Visa";
}

/** Longest-prefix match of Indian credit-card IINs → issuer id. */
const BIN_ISSUER: Array<[string, string]> = [
  ["403562", "icici"],
  ["431581", "icici"],
  ["549777", "icici"],
  ["522708", "icici"],
  ["508627", "icici"],
  ["607384", "icici"],
  ["414367", "hdfc"],
  ["419773", "hdfc"],
  ["405533", "hdfc"],
  ["416021", "hdfc"],
  ["524271", "hdfc"],
  ["552433", "hdfc"],
  ["526416", "hdfc"],
  ["521333", "hdfc"],
  ["400776", "hdfc"],
  ["526431", "sbi"],
  ["532667", "sbi"],
  ["437547", "sbi"],
  ["524354", "sbi"],
  ["652179", "sbi"],
  ["531848", "sbi"],
  ["407621", "axis"],
  ["517651", "axis"],
  ["413387", "axis"],
  ["376966", "axis"],
  ["464106", "kotak"],
  ["512119", "kotak"],
  ["421362", "kotak"],
  ["404652", "yes"],
  ["407220", "yes"],
  ["421782", "yes"],
  ["537616", "indusind"],
  ["414725", "indusind"],
  ["554639", "rbl"],
  ["464107", "rbl"],
  ["438628", "scb"],
  ["450644", "scb"],
  ["455788", "hsbc"],
  ["456364", "hsbc"],
  ["652245", "bob"],
  ["508755", "bob"],
  ["3769", "axis"],
  ["3774", "hdfc"],
  ["3793", "sbi"],
];

export function detectIssuerFromBin(value: string): CcbpIssuer | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) {
    if (detectCardNetwork(digits) === "AMEX" && digits.length >= 2) {
      return getCcbpIssuer("amex") ?? null;
    }
    return null;
  }

  const ranked = [...BIN_ISSUER].sort((a, b) => b[0].length - a[0].length);
  for (const [prefix, issuerId] of ranked) {
    if (digits.startsWith(prefix)) {
      return getCcbpIssuer(issuerId) ?? null;
    }
  }

  if (detectCardNetwork(digits) === "AMEX") {
    return getCcbpIssuer("amex") ?? null;
  }

  return null;
}
