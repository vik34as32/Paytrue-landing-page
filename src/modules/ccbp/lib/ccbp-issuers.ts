import { resolveBankLogoPath } from "@/src/lib/bankLogos";
import type { CcbpIssuer } from "../types";

function cc(
  id: string,
  name: string,
  shortName: string,
  ifscPrefix: string,
  cardFrom: string,
  cardTo: string
): CcbpIssuer {
  return {
    id,
    name,
    shortName,
    ifscPrefix,
    logoSrc: resolveBankLogoPath({ id, name, shortName, ifscPrefix }),
    cardFrom,
    cardTo,
  };
}

/** All Indian credit-card issuers shown to the retailer (searchable). */
export const CCBP_ISSUERS: CcbpIssuer[] = [
  cc("sbi", "SBI Card", "SBI Card", "SBIN", "#1e3a8a", "#2563eb"),
  cc("hdfc", "HDFC Bank Credit Card", "HDFC", "HDFC", "#0b1f4a", "#1565d8"),
  cc("icici", "ICICI Bank Credit Card", "ICICI", "ICIC", "#7f1d1d", "#ea580c"),
  cc("axis", "Axis Bank Credit Card", "Axis", "UTIB", "#581c87", "#7c3aed"),
  cc("kotak", "Kotak Mahindra Credit Card", "Kotak", "KKBK", "#9a3412", "#ea580c"),
  cc("yes", "Yes Bank Credit Card", "Yes Bank", "YESB", "#134e4a", "#0d9488"),
  cc("indusind", "IndusInd Bank Credit Card", "IndusInd", "INDB", "#7f1d1d", "#b91c1c"),
  cc("rbl", "RBL Bank Credit Card", "RBL", "RATN", "#1e3a8a", "#0ea5e9"),
  cc("idfc", "IDFC FIRST Credit Card", "IDFC FIRST", "IDFB", "#9a3412", "#c2410c"),
  cc("bob", "Bank of Baroda Credit Card", "BoB", "BARB", "#ea580c", "#b45309"),
  cc("pnb", "PNB Credit Card", "PNB", "PUNB", "#1d4ed8", "#0f172a"),
  cc("canara", "Canara Bank Credit Card", "Canara", "CNRB", "#facc15", "#854d0e"),
  cc("union", "Union Bank Credit Card", "Union Bank", "UBIN", "#b45309", "#7c2d12"),
  cc("boi", "Bank of India Credit Card", "Bank of India", "BKID", "#1d4ed8", "#1e3a8a"),
  cc("indian", "Indian Bank Credit Card", "Indian Bank", "IDIB", "#0f766e", "#115e59"),
  cc("idbi", "IDBI Bank Credit Card", "IDBI", "IBKL", "#1e3a8a", "#2563eb"),
  cc("federal", "Federal Bank Credit Card", "Federal", "FDRL", "#166534", "#22c55e"),
  cc("scb", "Standard Chartered Credit Card", "StanChart", "SCBL", "#0f766e", "#134e4a"),
  cc("hsbc", "HSBC Credit Card", "HSBC", "HSBC", "#7f1d1d", "#dc2626"),
  cc("citi", "Citi Credit Card", "Citi", "CITI", "#1d4ed8", "#0f172a"),
  cc("au", "AU Bank Credit Card", "AU Bank", "AUBL", "#ea580c", "#9a3412"),
  cc("bandhan", "Bandhan Bank Credit Card", "Bandhan", "BDBL", "#7c2d12", "#ea580c"),
  cc("sib", "South Indian Bank Credit Card", "SIB", "SIBL", "#1d4ed8", "#0ea5e9"),
  cc("csb", "CSB Bank Credit Card", "CSB", "CSBK", "#0f766e", "#115e59"),
  cc("kvb", "Karur Vysya Credit Card", "KVB", "KVBL", "#7c2d12", "#b45309"),
  cc("karnataka", "Karnataka Bank Credit Card", "Karnataka", "KARB", "#1e3a8a", "#2563eb"),
  cc("cub", "City Union Bank Credit Card", "CUB", "CIUB", "#0f766e", "#14b8a6"),
  cc("dcb", "DCB Bank Credit Card", "DCB", "DCBL", "#7c3aed", "#4c1d95"),
  cc("equitas", "Equitas SFB Credit Card", "Equitas", "ESFB", "#7c2d12", "#f97316"),
  cc("fino", "Fino Bank Credit Card", "Fino", "FINO", "#365314", "#84cc16"),
  cc("bom", "Bank of Maharashtra Credit Card", "BoM", "MAHB", "#7c2d12", "#ea580c"),
  cc("uco", "UCO Bank Credit Card", "UCO", "UCBA", "#1d4ed8", "#1e3a8a"),
  cc("cbi", "Central Bank Credit Card", "Central Bank", "CBIN", "#1e3a8a", "#2563eb"),
  cc("iob", "Indian Overseas Bank Credit Card", "IOB", "IOBA", "#7c2d12", "#ea580c"),
  cc("psb", "Punjab & Sind Bank Credit Card", "PSB", "PSIB", "#1d4ed8", "#0f172a"),
  cc("jnk", "J&K Bank Credit Card", "J&K Bank", "JAKA", "#1e3a8a", "#dc2626"),
  cc("dbs", "DBS Bank Credit Card", "DBS", "DBSS", "#0f172a", "#dc2626"),
  cc("deutsche", "Deutsche Bank Credit Card", "Deutsche", "DEUT", "#0f172a", "#2563eb"),
  cc("tmb", "Tamilnad Mercantile Credit Card", "TMB", "TMBL", "#7c2d12", "#f59e0b"),
  cc("ujjivan", "Ujjivan SFB Credit Card", "Ujjivan", "UJVN", "#7c2d12", "#ea580c"),
  cc("esaf", "ESAF SFB Credit Card", "ESAF", "ESMF", "#166534", "#22c55e"),
  cc("jana", "Jana SFB Credit Card", "Jana", "JSFB", "#1e3a8a", "#0ea5e9"),
  cc("amex", "American Express", "Amex", "AMEX", "#1e3a8a", "#0f172a"),
];

export function getCcbpIssuer(id: string | undefined | null): CcbpIssuer | undefined {
  if (!id) return undefined;
  return CCBP_ISSUERS.find((item) => item.id === id);
}

export const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
