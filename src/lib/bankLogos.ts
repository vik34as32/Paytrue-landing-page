import type { BankApiInput, BankOption } from "@/types/bank";

/** Bank logos live in public/assets/banks */
const BANK_ASSETS_BASE = "/assets/banks";

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
  union: bankLogo("union.svg"),
  union_bank: bankLogo("union.svg"),
  union_bank_of_india: bankLogo("union.svg"),
  ubi: bankLogo("union.svg"),
  indian: bankLogo("indian_bank.svg"),
  indian_bank: bankLogo("indian_bank.svg"),
  uco: bankLogo("uco.svg"),
  uco_bank: bankLogo("uco.svg"),
  boi: bankLogo("boi.svg"),
  bank_of_india: bankLogo("boi.svg"),
  cbi: bankLogo("central_bank.svg"),
  central_bank: bankLogo("central_bank.svg"),
  central_bank_of_india: bankLogo("central_bank.svg"),
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
  indus: bankLogo("indusind.svg"),
  indusind: bankLogo("indusind.svg"),
  indusind_bank: bankLogo("indusind.svg"),
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
  au: bankLogo("au.svg"),
  ausfb: bankLogo("au.svg"),
  au_small_finance_bank: bankLogo("au.svg"),
  ujjivan: bankLogo("ujjivan.svg"),
  ujjivan_small_finance_bank: bankLogo("ujjivan.svg"),
  esaf: bankLogo("esaf.svg"),
  esaf_small_finance_bank: bankLogo("esaf.svg"),
  equitas: bankLogo("equitas.svg"),
  equitas_small_finance_bank: bankLogo("equitas.svg"),
  jana: bankLogo("jana.svg"),
  jana_small_finance_bank: bankLogo("jana.svg"),
  suryoday: bankLogo("suryoday.svg"),
  suryoday_small_finance_bank: bankLogo("suryoday.svg"),
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
  city: bankLogo("citi.svg"),
  citi: bankLogo("citi.svg"),
  citi_bank: bankLogo("citi.svg"),
  dbs: bankLogo("dbs.svg"),
  dbs_bank: bankLogo("dbs.svg"),
  hsbc: bankLogo("hsbc.svg"),
  hsbc_bank: bankLogo("hsbc.svg"),
  deutsche: bankLogo("deutsche.svg"),
  deutsche_bank: bankLogo("deutsche.svg"),
  scb: bankLogo("scb.svg"),
  standard_chartered: bankLogo("scb.svg"),
  standard_chartered_bank: bankLogo("scb.svg"),
  // InstantPay IFSC aliases (ifscAlias from /dmt/banks API)
  sbin: bankLogo("sbi.svg"),
  barb: bankLogo("bob.svg"),
  punb: bankLogo("pnb.svg"),
  ubin: bankLogo("union.svg"),
  idib: bankLogo("indian_bank.svg"),
  bkid: bankLogo("boi.svg"),
  kkkb: bankLogo("kotak.svg"),
  kkbk: bankLogo("kotak.svg"),
  utib: bankLogo("axis.svg"),
  indb: bankLogo("indusind.svg"),
  icic: bankLogo("icici.svg"),
  cbin: bankLogo("central_bank.svg"),
  cnrb: bankLogo("canara.svg"),
  yesb: bankLogo("yes.svg"),
  ratn: bankLogo("rbl.svg"),
  fdrl: bankLogo("federal.svg"),
  sibl: bankLogo("sib.svg"),
  bdbl: bankLogo("bandhan.svg"),
  aubl: bankLogo("au.svg"),
  ujvn: bankLogo("ujjivan.svg"),
  esmf: bankLogo("esaf.svg"),
  esfb: bankLogo("equitas.svg"),
  sury: bankLogo("suryoday.svg"),
  karb: bankLogo("karnataka.svg"),
  kvbl: bankLogo("kvb.svg"),
  tmbl: bankLogo("tmb.svg"),
  ciub: bankLogo("cub.svg"),
  dcbl: bankLogo("dcb.svg"),
  csbk: bankLogo("csb.svg"),
  dbss: bankLogo("dbs.svg"),
  scbl: bankLogo("scb.svg"),
  hsbc: bankLogo("hsbc.svg"),
  deut: bankLogo("deutsche.svg"),
  idfb: bankLogo("idfc.svg"),
  jsfb: bankLogo("jana.svg"),
  ibkl: bankLogo("idbi.svg"),
  mahb: bankLogo("bom.svg"),
  ucba: bankLogo("uco.svg"),
  psib: bankLogo("psb.svg"),
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
