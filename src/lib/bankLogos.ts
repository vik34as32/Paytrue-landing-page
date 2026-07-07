import type { BankApiInput, BankOption } from "@/types/bank";

/** Bank logos live in public/indian-bank */
const BANK_ASSETS_BASE = "/indian-bank";

/** Normalize bank names/codes into lookup keys. */
export function normalizeBankKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function bankLogo(fileName: string): string {
  return `${BANK_ASSETS_BASE}/${fileName}`;
}

const BANK_LOGO_ALIASES: Record<string, string> = {
  sbi: bankLogo("sbi.svg"),
  state_bank_of_india: bankLogo("sbi.svg"),
  hdfc: bankLogo("hdfc.svg"),
  hdfc_bank: bankLogo("hdfc.svg"),
  icici: bankLogo("icici.svg"),
  icici_bank: bankLogo("icici.svg"),
  axis: bankLogo("axis.svg"),
  axis_bank: bankLogo("axis.svg"),
  pnb: bankLogo("pnb.svg"),
  punjab_national_bank: bankLogo("pnb.svg"),
  bob: bankLogo("bob.svg"),
  bank_of_baroda: bankLogo("bob.svg"),
  canara: bankLogo("canara.svg"),
  canara_bank: bankLogo("canara.svg"),
  union: bankLogo("ubi.svg"),
  union_bank: bankLogo("ubi.svg"),
  union_bank_of_india: bankLogo("ubi.svg"),
  ubi: bankLogo("ubi.svg"),
  indian: bankLogo("indian.svg"),
  indian_bank: bankLogo("indian.svg"),
  uco: bankLogo("uco.svg"),
  uco_bank: bankLogo("uco.svg"),
  boi: bankLogo("boi.svg"),
  bank_of_india: bankLogo("boi.svg"),
  cbi: bankLogo("cbi.svg"),
  central_bank: bankLogo("cbi.svg"),
  central_bank_of_india: bankLogo("cbi.svg"),
  psb: bankLogo("psb.svg"),
  punjab_and_sind_bank: bankLogo("psb.svg"),
  idbi: bankLogo("idbi.svg"),
  idbi_bank: bankLogo("idbi.svg"),
  iob: bankLogo("iob.svg"),
  indian_overseas_bank: bankLogo("iob.svg"),
  bom: bankLogo("bom.svg"),
  bank_of_maharashtra: bankLogo("bom.svg"),
  kotak: bankLogo("kotak.svg"),
  kotak_mahindra_bank: bankLogo("kotak.svg"),
  indus: bankLogo("indus.svg"),
  indusind: bankLogo("indus.svg"),
  indusind_bank: bankLogo("indus.svg"),
  yes: bankLogo("yes.svg"),
  yes_bank: bankLogo("yes.svg"),
  rbl: bankLogo("rbl.svg"),
  rbl_bank: bankLogo("rbl.svg"),
  federal: bankLogo("federal.svg"),
  federal_bank: bankLogo("federal.svg"),
  sib: bankLogo("sib.svg"),
  south_indian_bank: bankLogo("sib.svg"),
  bandhan: bankLogo("bandhan.svg"),
  bandhan_bank: bankLogo("bandhan.svg"),
  ausfb: bankLogo("ausfb.svg"),
  au: bankLogo("ausfb.svg"),
  au_small_finance_bank: bankLogo("ausfb.svg"),
  ujjivan: bankLogo("ujjivan.svg"),
  ujjivan_small_finance_bank: bankLogo("ujjivan.svg"),
  esaf: bankLogo("esaf.svg"),
  esaf_small_finance_bank: bankLogo("esaf.svg"),
  karnataka: bankLogo("karnataka.svg"),
  karnataka_bank: bankLogo("karnataka.svg"),
  kvb: bankLogo("kvb.svg"),
  karur_vysya_bank: bankLogo("kvb.svg"),
  tmb: bankLogo("tmb.svg"),
  tamilnad_mercantile_bank: bankLogo("tmb.svg"),
  cub: bankLogo("cub.svg"),
  city_union_bank: bankLogo("cub.svg"),
  dcb: bankLogo("dcb.svg"),
  dcb_bank: bankLogo("dcb.svg"),
  csb: bankLogo("csb.svg"),
  csb_bank: bankLogo("csb.svg"),
  idfc: bankLogo("idfc.svg"),
  idfc_first_bank: bankLogo("idfc.svg"),
  city: bankLogo("city.svg"),
  citi: bankLogo("city.svg"),
  citi_bank: bankLogo("city.svg"),
  dhanlaxmi: bankLogo("dhanlaxmi.svg"),
  dhanlaxmi_bank: bankLogo("dhanlaxmi.svg"),
  fino: bankLogo("fino.svg"),
  fino_payments_bank: bankLogo("fino.svg"),
  paytm: bankLogo("paytm.svg"),
  paytm_payments_bank: bankLogo("paytm.svg"),
  jio: bankLogo("jio.svg"),
  jio_payments_bank: bankLogo("jio.svg"),
  apb: bankLogo("apb.svg"),
  airtel_payments_bank: bankLogo("apb.svg"),
  indiapost: bankLogo("indiapost.svg"),
  india_post_payments_bank: bankLogo("indiapost.svg"),
  jnk: bankLogo("jnk.svg"),
  jammu_and_kashmir_bank: bankLogo("jnk.svg"),
  ntb: bankLogo("ntb.svg"),
  nainital_bank: bankLogo("ntb.svg"),
};

export function resolveBankLogoPath(bank: BankApiInput | BankOption): string {
  if (bank.logo?.trim()) return bank.logo.trim();

  const apiBank = bank as BankApiInput;
  const keys = [
    bank.id,
    bank.ifscPrefix,
    bank.shortName,
    bank.name,
    apiBank.operatorCode,
    apiBank.bankName,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeBankKey);

  for (const key of keys) {
    if (BANK_LOGO_ALIASES[key]) return BANK_LOGO_ALIASES[key];
  }

  const primaryKey = keys[0];
  if (primaryKey) return bankLogo(`${primaryKey}.svg`);

  return "";
}

export function normalizeBankOption(bank: BankApiInput | string): BankOption {
  if (typeof bank === "string") {
    const key = normalizeBankKey(bank);
    return {
      id: key || bank,
      name: bank,
      shortName: bank,
      ifscPrefix: "",
      logo: resolveBankLogoPath({ name: bank, id: key }),
    };
  }

  const name = bank.name || bank.bankName || bank.id || "Unknown Bank";
  const id = bank.id ?? normalizeBankKey(name);
  const shortName = bank.shortName ?? name;
  const ifscPrefix = bank.ifscPrefix ?? "";

  return {
    id,
    name,
    shortName,
    ifscPrefix,
    logo: resolveBankLogoPath({ ...bank, id, name, shortName, ifscPrefix }),
  };
}

export function normalizeBankList(
  banks: Array<BankApiInput | string>
): BankOption[] {
  return banks.map((bank) => normalizeBankOption(bank));
}

export function getBankValue(bank: BankOption): string {
  return bank.name;
}

/** Map AEPS bank list item to logo lookup input */
export function aepsBankToLogoInput(bank: {
  name: string;
  iin: string;
  bankCode?: string;
}): BankApiInput {
  return {
    id: bank.iin,
    name: bank.name,
    shortName: bank.name,
    operatorCode: bank.bankCode,
  };
}
