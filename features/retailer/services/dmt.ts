/**
 * Bank catalog for UI (logos from public/indian-bank).
 * Beneficiary registration still uses IFSC via backend API.
 */
import type { BankOption } from "@/types/bank";
import { resolveBankLogoPath } from "@/src/lib/bankLogos";

function bank(
  id: string,
  name: string,
  shortName: string,
  ifscPrefix: string
): BankOption {
  return {
    id,
    name,
    shortName,
    ifscPrefix,
    logo: resolveBankLogoPath({ id, name, shortName, ifscPrefix }),
  };
}

/** Every bank with a logo in public/indian-bank, plus extras from public/assets/banks. */
export const INDIAN_BANKS: BankOption[] = [
  bank("apb", "Airtel Payments Bank", "Airtel", "AIRP"),
  bank("ausfb", "AU Small Finance Bank", "AU SFB", "AUBL"),
  bank("axis", "Axis Bank", "Axis", "UTIB"),
  bank("bandhan", "Bandhan Bank", "Bandhan", "BDBL"),
  bank("bob", "Bank of Baroda", "BOB", "BARB"),
  bank("boi", "Bank of India", "BOI", "BKID"),
  bank("bom", "Bank of Maharashtra", "BOM", "MAHB"),
  bank("canara", "Canara Bank", "Canara", "CNRB"),
  bank("cbi", "Central Bank of India", "CBI", "CBIN"),
  bank("city", "Citibank", "Citi", "CITI"),
  bank("cub", "City Union Bank", "CUB", "CIUB"),
  bank("csb", "CSB Bank", "CSB", "CSBK"),
  bank("dcb", "DCB Bank", "DCB", "DCBL"),
  bank("deutsche", "Deutsche Bank", "Deutsche", "DEUT"),
  bank("dhanlaxmi", "Dhanlaxmi Bank", "Dhanlaxmi", "DLXB"),
  bank("dbs", "DBS Bank", "DBS", "DBSS"),
  bank("equitas", "Equitas Small Finance Bank", "Equitas", "ESFB"),
  bank("esaf", "ESAF Small Finance Bank", "ESAF", "ESMF"),
  bank("federal", "Federal Bank", "Federal", "FDRL"),
  bank("fino", "Fino Payments Bank", "Fino", "FINO"),
  bank("hdfc", "HDFC Bank", "HDFC", "HDFC"),
  bank("hsbc", "HSBC Bank", "HSBC", "HSBC"),
  bank("icici", "ICICI Bank", "ICICI", "ICIC"),
  bank("idbi", "IDBI Bank", "IDBI", "IBKL"),
  bank("idfc", "IDFC FIRST Bank", "IDFC FIRST", "IDFB"),
  bank("indian", "Indian Bank", "Indian Bank", "IDIB"),
  bank("indiapost", "India Post Payments Bank", "IPPB", "IPPB"),
  bank("iob", "Indian Overseas Bank", "IOB", "IOBA"),
  bank("indus", "IndusInd Bank", "IndusInd", "INDB"),
  bank("jnk", "Jammu and Kashmir Bank", "J&K Bank", "JAKA"),
  bank("jana", "Jana Small Finance Bank", "Jana", "JSFB"),
  bank("jio", "Jio Payments Bank", "Jio", "JIOP"),
  bank("karnataka", "Karnataka Bank", "Karnataka", "KARB"),
  bank("kvb", "Karur Vysya Bank", "KVB", "KVBL"),
  bank("kotak", "Kotak Mahindra Bank", "Kotak", "KKBK"),
  bank("ntb", "Nainital Bank", "Nainital", "NTBL"),
  bank("paytm", "Paytm Payments Bank", "Paytm", "PYTM"),
  bank("pnb", "Punjab National Bank", "PNB", "PUNB"),
  bank("psb", "Punjab & Sind Bank", "PSB", "PSIB"),
  bank("rbl", "RBL Bank", "RBL", "RATN"),
  bank("scb", "Standard Chartered Bank", "SCB", "SCBL"),
  bank("sbi", "State Bank of India", "SBI", "SBIN"),
  bank("sib", "South Indian Bank", "SIB", "SIBL"),
  bank("suryoday", "Suryoday Small Finance Bank", "Suryoday", "SURY"),
  bank("tmb", "Tamilnad Mercantile Bank", "TMB", "TMBL"),
  bank("uco", "UCO Bank", "UCO", "UCBA"),
  bank("ujjivan", "Ujjivan Small Finance Bank", "Ujjivan", "UJVN"),
  bank("ubi", "Union Bank of India", "Union Bank", "UBIN"),
  bank("yes", "Yes Bank", "Yes Bank", "YESB"),
];

export const BANK_LIST = INDIAN_BANKS.map((item) => item.name);

export function normalizeBanksFromApi(
  banks: Array<string | Partial<BankOption>>
): BankOption[] {
  return banks.map((item) => {
    if (typeof item === "string") {
      const slug = item.toLowerCase().replace(/\s+/g, "_");
      return bank(slug, item, item, "");
    }
    return bank(
      item.id ?? item.name?.toLowerCase().replace(/\s+/g, "_") ?? "bank",
      item.name ?? "Unknown Bank",
      item.shortName ?? item.name ?? "Bank",
      item.ifscPrefix ?? ""
    );
  });
}
