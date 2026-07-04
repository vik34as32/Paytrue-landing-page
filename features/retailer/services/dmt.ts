/**
 * Bank catalog for UI hints only.
 * Beneficiary registration uses IFSC via backend API — no mock DMT APIs here.
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

export const INDIAN_BANKS: BankOption[] = [
  bank("sbi", "State Bank of India", "SBI", "SBIN"),
  bank("hdfc", "HDFC Bank", "HDFC", "HDFC"),
  bank("icici", "ICICI Bank", "ICICI", "ICIC"),
  bank("axis", "Axis Bank", "Axis", "UTIB"),
  bank("pnb", "Punjab National Bank", "PNB", "PUNB"),
  bank("bob", "Bank of Baroda", "BOB", "BARB"),
  bank("idfc", "IDFC FIRST Bank", "IDFC FIRST", "IDFB"),
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
