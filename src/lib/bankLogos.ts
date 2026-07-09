import type { BankApiInput, BankOption } from "@/types/bank";

/** Primary bank logos in public/indian-bank */
const INDIAN_BANK_BASE = "/indian-bank";

/** Fallback logos for banks not present in indian-bank */
const ASSETS_BANK_BASE = "/assets/banks";

const INDIAN_BANK_FILES = new Set([
  "apb",
  "ausfb",
  "axis",
  "bandhan",
  "bob",
  "boi",
  "bom",
  "canara",
  "cbi",
  "city",
  "csb",
  "cub",
  "dcb",
  "dhanlaxmi",
  "esaf",
  "federal",
  "fino",
  "hdfc",
  "icici",
  "idbi",
  "idfc",
  "indian",
  "indiapost",
  "indus",
  "iob",
  "jio",
  "jnk",
  "karnataka",
  "kotak",
  "kvb",
  "ntb",
  "paytm",
  "pnb",
  "psb",
  "rbl",
  "sbi",
  "sib",
  "tmb",
  "ubi",
  "uco",
  "ujjivan",
  "yes",
]);

/** Normalize bank names/codes into lookup keys. */
export function normalizeBankKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function indianBank(fileName: string): string {
  return `${INDIAN_BANK_BASE}/${fileName}`;
}

function assetsBank(fileName: string): string {
  return `${ASSETS_BANK_BASE}/${fileName}`;
}

const INDIAN_BANK_ALIASES: Record<string, string> = {
  sbi: indianBank("sbi.svg"),
  state_bank_of_india: indianBank("sbi.svg"),
  hdfc: indianBank("hdfc.svg"),
  hdfc_bank: indianBank("hdfc.svg"),
  icici: indianBank("icici.svg"),
  icici_bank: indianBank("icici.svg"),
  axis: indianBank("axis.svg"),
  axis_bank: indianBank("axis.svg"),
  pnb: indianBank("pnb.svg"),
  punjab_national_bank: indianBank("pnb.svg"),
  bob: indianBank("bob.svg"),
  bank_of_baroda: indianBank("bob.svg"),
  canara: indianBank("canara.svg"),
  canara_bank: indianBank("canara.svg"),
  union: indianBank("ubi.svg"),
  union_bank: indianBank("ubi.svg"),
  union_bank_of_india: indianBank("ubi.svg"),
  ubi: indianBank("ubi.svg"),
  indian: indianBank("indian.svg"),
  indian_bank: indianBank("indian.svg"),
  uco: indianBank("uco.svg"),
  uco_bank: indianBank("uco.svg"),
  boi: indianBank("boi.svg"),
  bank_of_india: indianBank("boi.svg"),
  cbi: indianBank("cbi.svg"),
  central_bank: indianBank("cbi.svg"),
  central_bank_of_india: indianBank("cbi.svg"),
  psb: indianBank("psb.svg"),
  punjab_and_sind_bank: indianBank("psb.svg"),
  idbi: indianBank("idbi.svg"),
  idbi_bank: indianBank("idbi.svg"),
  iob: indianBank("iob.svg"),
  indian_overseas_bank: indianBank("iob.svg"),
  bom: indianBank("bom.svg"),
  bank_of_maharashtra: indianBank("bom.svg"),
  kotak: indianBank("kotak.svg"),
  kotak_mahindra_bank: indianBank("kotak.svg"),
  indus: indianBank("indus.svg"),
  indusind: indianBank("indus.svg"),
  indusind_bank: indianBank("indus.svg"),
  yes: indianBank("yes.svg"),
  yes_bank: indianBank("yes.svg"),
  rbl: indianBank("rbl.svg"),
  rbl_bank: indianBank("rbl.svg"),
  federal: indianBank("federal.svg"),
  federal_bank: indianBank("federal.svg"),
  sib: indianBank("sib.svg"),
  south_indian_bank: indianBank("sib.svg"),
  bandhan: indianBank("bandhan.svg"),
  bandhan_bank: indianBank("bandhan.svg"),
  au: indianBank("ausfb.svg"),
  ausfb: indianBank("ausfb.svg"),
  au_small_finance_bank: indianBank("ausfb.svg"),
  ujjivan: indianBank("ujjivan.svg"),
  ujjivan_small_finance_bank: indianBank("ujjivan.svg"),
  esaf: indianBank("esaf.svg"),
  esaf_small_finance_bank: indianBank("esaf.svg"),
  karnataka: indianBank("karnataka.svg"),
  karnataka_bank: indianBank("karnataka.svg"),
  kvb: indianBank("kvb.svg"),
  karur_vysya_bank: indianBank("kvb.svg"),
  tmb: indianBank("tmb.svg"),
  tamilnad_mercantile_bank: indianBank("tmb.svg"),
  cub: indianBank("cub.svg"),
  city_union_bank: indianBank("cub.svg"),
  dcb: indianBank("dcb.svg"),
  dcb_bank: indianBank("dcb.svg"),
  csb: indianBank("csb.svg"),
  csb_bank: indianBank("csb.svg"),
  idfc: indianBank("idfc.svg"),
  idfc_first_bank: indianBank("idfc.svg"),
  city: indianBank("city.svg"),
  citi: indianBank("city.svg"),
  citi_bank: indianBank("city.svg"),
  fino: indianBank("fino.svg"),
  fino_payments_bank: indianBank("fino.svg"),
  dhanlaxmi: indianBank("dhanlaxmi.svg"),
  dhanlaxmi_bank: indianBank("dhanlaxmi.svg"),
  indiapost: indianBank("indiapost.svg"),
  india_post_payments_bank: indianBank("indiapost.svg"),
  jio: indianBank("jio.svg"),
  jio_payments_bank: indianBank("jio.svg"),
  paytm: indianBank("paytm.svg"),
  paytm_payments_bank: indianBank("paytm.svg"),
  apb: indianBank("apb.svg"),
  airtel_payments_bank: indianBank("apb.svg"),
  jnk: indianBank("jnk.svg"),
  jammu_and_kashmir_bank: indianBank("jnk.svg"),
  ntb: indianBank("ntb.svg"),
  nainital_bank: indianBank("ntb.svg"),
  // InstantPay IFSC aliases (ifscAlias from /dmt/banks API)
  sbin: indianBank("sbi.svg"),
  barb: indianBank("bob.svg"),
  punb: indianBank("pnb.svg"),
  ubin: indianBank("ubi.svg"),
  idib: indianBank("indian.svg"),
  bkid: indianBank("boi.svg"),
  kkkb: indianBank("kotak.svg"),
  kkbk: indianBank("kotak.svg"),
  utib: indianBank("axis.svg"),
  indb: indianBank("indus.svg"),
  icic: indianBank("icici.svg"),
  cbin: indianBank("cbi.svg"),
  cnrb: indianBank("canara.svg"),
  yesb: indianBank("yes.svg"),
  ratn: indianBank("rbl.svg"),
  fdrl: indianBank("federal.svg"),
  sibl: indianBank("sib.svg"),
  bdbl: indianBank("bandhan.svg"),
  aubl: indianBank("ausfb.svg"),
  ujvn: indianBank("ujjivan.svg"),
  esmf: indianBank("esaf.svg"),
  karb: indianBank("karnataka.svg"),
  kvbl: indianBank("kvb.svg"),
  tmbl: indianBank("tmb.svg"),
  ciub: indianBank("cub.svg"),
  dcbl: indianBank("dcb.svg"),
  csbk: indianBank("csb.svg"),
  idfb: indianBank("idfc.svg"),
  ibkl: indianBank("idbi.svg"),
  mahb: indianBank("bom.svg"),
  ucba: indianBank("uco.svg"),
  psib: indianBank("psb.svg"),
  jiop: indianBank("jio.svg"),
  pytm: indianBank("paytm.svg"),
};

/** Banks only available under public/assets/banks */
const ASSETS_BANK_ALIASES: Record<string, string> = {
  equitas: assetsBank("equitas.svg"),
  equitas_small_finance_bank: assetsBank("equitas.svg"),
  esfb: assetsBank("equitas.svg"),
  jana: assetsBank("jana.svg"),
  jana_small_finance_bank: assetsBank("jana.svg"),
  jsfb: assetsBank("jana.svg"),
  suryoday: assetsBank("suryoday.svg"),
  suryoday_small_finance_bank: assetsBank("suryoday.svg"),
  sury: assetsBank("suryoday.svg"),
  dbs: assetsBank("dbs.svg"),
  dbs_bank: assetsBank("dbs.svg"),
  dbss: assetsBank("dbs.svg"),
  hsbc: assetsBank("hsbc.svg"),
  hsbc_bank: assetsBank("hsbc.svg"),
  deutsche: assetsBank("deutsche.svg"),
  deutsche_bank: assetsBank("deutsche.svg"),
  deut: assetsBank("deutsche.svg"),
  scb: assetsBank("scb.svg"),
  standard_chartered: assetsBank("scb.svg"),
  standard_chartered_bank: assetsBank("scb.svg"),
  scbl: assetsBank("scb.svg"),
};

function collectLookupKeys(bank: BankApiInput | BankOption): string[] {
  const apiBank = bank as BankApiInput;
  const ifscRaw = (bank.ifscPrefix || apiBank.ifsc || "").trim().toUpperCase();
  const ifscPrefix = ifscRaw.length >= 4 ? ifscRaw.slice(0, 4) : ifscRaw;

  const keys = [
    bank.id,
    ifscPrefix,
    ifscRaw,
    bank.ifscPrefix,
    bank.shortName,
    bank.name,
    apiBank.operatorCode,
    apiBank.bankName,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeBankKey);

  return [...new Set(keys)];
}

function resolveFromAliases(keys: string[]): string {
  for (const key of keys) {
    if (INDIAN_BANK_ALIASES[key]) return INDIAN_BANK_ALIASES[key];
  }
  for (const key of keys) {
    if (INDIAN_BANK_FILES.has(key)) return indianBank(`${key}.svg`);
  }
  for (const key of keys) {
    if (ASSETS_BANK_ALIASES[key]) return ASSETS_BANK_ALIASES[key];
  }
  return "";
}

export function resolveBankLogoPath(bank: BankApiInput | BankOption): string {
  if (bank.logo?.trim()) return bank.logo.trim();

  const keys = collectLookupKeys(bank);
  const resolved = resolveFromAliases(keys);
  if (resolved) return resolved;

  const primaryKey = keys[0];
  if (primaryKey) {
    if (INDIAN_BANK_FILES.has(primaryKey)) return indianBank(`${primaryKey}.svg`);
    return assetsBank(`${primaryKey}.svg`);
  }

  return "";
}

export function resolveBankLogoFromIfsc(bankName: string, ifscCode?: string): string {
  return resolveBankLogoPath({
    name: bankName,
    shortName: bankName,
    ifscPrefix: ifscCode?.trim().slice(0, 4) || "",
  });
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
