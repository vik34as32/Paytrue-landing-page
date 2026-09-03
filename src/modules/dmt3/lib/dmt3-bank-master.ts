import { INDIAN_BANKS } from "@/features/retailer/services/dmt";
import { normalizeBankOption } from "@/src/lib/bankLogos";
import type { BankOption } from "@/types/bank";
import type { DmtBank } from "@/src/modules/dmt/types";

function ifscPrefixOf(value?: string): string {
  const raw = String(value || "")
    .trim()
    .toUpperCase();
  return raw.length >= 4 ? raw.slice(0, 4) : raw;
}

/**
 * Full InstantPay /dmt/banks list with logos.
 * Each bankId stays a separate row (do not collapse by IFSC alias).
 */
export function mergeDmt3BankMaster(apiBanks: DmtBank[]): BankOption[] {
  if (!apiBanks.length) return INDIAN_BANKS;

  return apiBanks.map((bank) => {
    const prefix = ifscPrefixOf(bank.ifscPrefix || bank.ifsc || bank.code);
    return normalizeBankOption({
      id: String(bank.instantPayBankId || bank.id || bank.name),
      name: bank.name,
      shortName: bank.name,
      ifscPrefix: prefix,
      ifsc: bank.ifsc,
      operatorCode: bank.code,
    });
  });
}

export function ifscGlobalFromBank(bank?: DmtBank | null): string {
  return String(bank?.ifscGlobal || "").trim().toUpperCase();
}
