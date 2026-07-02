export type OperatorServiceType =
  | "mobile"
  | "postpaid"
  | "dth"
  | "fasttag"
  | "broadband"
  | "electricity"
  | "gas"
  | "water"
  | "insurance"
  | "credit-card";

export interface OperatorOption {
  id: string;
  name: string;
  operatorCode?: string;
  operatorName?: string;
}

export type OperatorInput =
  | OperatorOption
  | string
  | {
      id?: string;
      name?: string;
      operatorCode?: string;
      operatorName?: string;
    };

const SERVICE_FOLDERS: Record<OperatorServiceType, string> = {
  mobile: "mobile",
  postpaid: "postpaid",
  dth: "dth",
  fasttag: "fasttag",
  broadband: "broadband",
  electricity: "electricity",
  gas: "gas",
  water: "water",
  insurance: "insurance",
  "credit-card": "credit-card",
};

/** Normalize operator codes/names into lookup keys. */
export function normalizeOperatorKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function assetPath(serviceType: OperatorServiceType, fileName: string): string {
  const folder = SERVICE_FOLDERS[serviceType];
  return `/assets/operators/${folder}/${fileName}`;
}

/** Cross-service aliases when the same brand appears in multiple categories. */
const GLOBAL_OPERATOR_ALIASES: Record<string, string> = {
  airtel: assetPath("mobile", "airtel.svg"),
  jio: assetPath("mobile", "jio.svg"),
  vi: assetPath("mobile", "vi.svg"),
  vodafone: assetPath("mobile", "vi.svg"),
  idea: assetPath("mobile", "vi.svg"),
  bsnl: assetPath("mobile", "bsnl.svg"),
  mtnl: assetPath("mobile", "mtnl.svg"),
  tata_play: assetPath("dth", "tata_play.svg"),
  tata_sky: assetPath("dth", "tata_play.svg"),
  dish_tv: assetPath("dth", "dish_tv.svg"),
  airtel_dth: assetPath("dth", "airtel_dth.svg"),
  airtel_digital_tv: assetPath("dth", "airtel_dth.svg"),
  sun_direct: assetPath("dth", "sun_direct.svg"),
  d2h: assetPath("dth", "d2h.svg"),
  videocon_d2h: assetPath("dth", "d2h.svg"),
};

const OPERATOR_LOGO_MAP: Record<
  OperatorServiceType,
  Record<string, string>
> = {
  mobile: {
    airtel: assetPath("mobile", "airtel.svg"),
    jio: assetPath("mobile", "jio.svg"),
    vi: assetPath("mobile", "vi.svg"),
    bsnl: assetPath("mobile", "bsnl.svg"),
    mtnl: assetPath("mobile", "mtnl.svg"),
  },
  postpaid: {
    airtel_postpaid: assetPath("postpaid", "airtel.svg"),
    airtel: assetPath("postpaid", "airtel.svg"),
    jio_postpaid: assetPath("postpaid", "jio.svg"),
    jio: assetPath("postpaid", "jio.svg"),
    vi_postpaid: assetPath("postpaid", "vi.svg"),
    vi: assetPath("postpaid", "vi.svg"),
    bsnl_postpaid: assetPath("postpaid", "bsnl.svg"),
    bsnl: assetPath("postpaid", "bsnl.svg"),
    mtnl_postpaid: assetPath("postpaid", "mtnl.svg"),
    mtnl: assetPath("postpaid", "mtnl.svg"),
  },
  dth: {
    tata_play: assetPath("dth", "tata_play.svg"),
    tata_sky: assetPath("dth", "tata_play.svg"),
    airtel_dth: assetPath("dth", "airtel_dth.svg"),
    airtel_digital_tv: assetPath("dth", "airtel_dth.svg"),
    dish_tv: assetPath("dth", "dish_tv.svg"),
    sun_direct: assetPath("dth", "sun_direct.svg"),
    d2h: assetPath("dth", "d2h.svg"),
  },
  fasttag: {
    paytm_fastag: assetPath("fasttag", "paytm.svg"),
    paytm: assetPath("fasttag", "paytm.svg"),
    icici_fastag: assetPath("fasttag", "icici.svg"),
    icici: assetPath("fasttag", "icici.svg"),
    axis_fastag: assetPath("fasttag", "axis.svg"),
    axis: assetPath("fasttag", "axis.svg"),
    hdfc_fastag: assetPath("fasttag", "hdfc.svg"),
    hdfc: assetPath("fasttag", "hdfc.svg"),
    kotak_fastag: assetPath("fasttag", "kotak.svg"),
    kotak: assetPath("fasttag", "kotak.svg"),
    idfc_fastag: assetPath("fasttag", "idfc.svg"),
    idfc: assetPath("fasttag", "idfc.svg"),
    sbi_fastag: assetPath("fasttag", "sbi.svg"),
    sbi: assetPath("fasttag", "sbi.svg"),
    equitas_fastag: assetPath("fasttag", "equitas.svg"),
    equitas: assetPath("fasttag", "equitas.svg"),
    federal_fastag: assetPath("fasttag", "federal.svg"),
    federal: assetPath("fasttag", "federal.svg"),
    indian_bank_fastag: assetPath("fasttag", "indian_bank.svg"),
    indian_bank: assetPath("fasttag", "indian_bank.svg"),
  },
  broadband: {
    airtel_broadband: assetPath("broadband", "airtel.svg"),
    airtel: assetPath("broadband", "airtel.svg"),
    jio_fiber: assetPath("broadband", "jio.svg"),
    jio: assetPath("broadband", "jio.svg"),
    act_fibernet: assetPath("broadband", "act.svg"),
    act: assetPath("broadband", "act.svg"),
    hathway: assetPath("broadband", "hathway.svg"),
    bsnl_broadband: assetPath("broadband", "bsnl.svg"),
    bsnl: assetPath("broadband", "bsnl.svg"),
  },
  electricity: {
    bses_rajdhani: assetPath("electricity", "bses.svg"),
    bses_yamuna: assetPath("electricity", "bses.svg"),
    tata_power_delhi: assetPath("electricity", "tata_power.svg"),
    msedcl_maharashtra: assetPath("electricity", "msedcl.svg"),
    bescom_karnataka: assetPath("electricity", "bescom.svg"),
    tangedco_tamil_nadu: assetPath("electricity", "tangedco.svg"),
  },
  gas: {
    indane_gas: assetPath("gas", "indane.svg"),
    hp_gas: assetPath("gas", "hp.svg"),
    bharat_gas: assetPath("gas", "bharat.svg"),
    mahanagar_gas: assetPath("gas", "mahanagar.svg"),
    gujarat_gas: assetPath("gas", "gujarat_gas.svg"),
  },
  water: {
    delhi_jal_board: assetPath("water", "delhi_jal.svg"),
    bmc_mumbai: assetPath("water", "bmc.svg"),
    bwssb_bangalore: assetPath("water", "bwssb.svg"),
    chennai_metro_water: assetPath("water", "chennai_metro.svg"),
    hyderabad_water_board: assetPath("water", "hyderabad.svg"),
  },
  insurance: {
    lic_of_india: assetPath("insurance", "lic.svg"),
    lic: assetPath("insurance", "lic.svg"),
    hdfc_life: assetPath("insurance", "hdfc_life.svg"),
    icici_prudential: assetPath("insurance", "icici_pru.svg"),
    sbi_life: assetPath("insurance", "sbi_life.svg"),
    max_life_insurance: assetPath("insurance", "max_life.svg"),
    bajaj_allianz: assetPath("insurance", "bajaj_allianz.svg"),
  },
  "credit-card": {
    hdfc_bank_credit_card: assetPath("credit-card", "hdfc.svg"),
    icici_bank_credit_card: assetPath("credit-card", "icici.svg"),
    sbi_card: assetPath("credit-card", "sbi.svg"),
    axis_bank_credit_card: assetPath("credit-card", "axis.svg"),
    kotak_credit_card: assetPath("credit-card", "kotak.svg"),
    yes_bank_credit_card: assetPath("credit-card", "yes_bank.svg"),
  },
};

function collectLookupKeys(operator: OperatorInput): string[] {
  if (typeof operator === "string") {
    return [normalizeOperatorKey(operator)];
  }

  const keys = [
    operator.operatorCode,
    operator.id,
    operator.operatorName,
    operator.name,
  ]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map(normalizeOperatorKey);

  return [...new Set(keys)];
}

export function normalizeOperatorInput(
  operator: OperatorInput
): OperatorOption {
  if (typeof operator === "string") {
    return {
      id: operator,
      name: operator,
      operatorName: operator,
    };
  }

  const name = operator.name ?? operator.operatorName ?? operator.id ?? "";
  const id =
    operator.id ??
    operator.operatorCode ??
    normalizeOperatorKey(name) ??
    name;

  return {
    id,
    name,
    operatorCode: operator.operatorCode ?? operator.id,
    operatorName: operator.operatorName ?? operator.name,
  };
}

export function resolveOperatorLogoPath(
  serviceType: OperatorServiceType,
  operator: OperatorInput
): string {
  const keys = collectLookupKeys(operator);
  const serviceMap = OPERATOR_LOGO_MAP[serviceType] ?? {};

  for (const key of keys) {
    if (serviceMap[key]) return serviceMap[key];
    if (GLOBAL_OPERATOR_ALIASES[key]) return GLOBAL_OPERATOR_ALIASES[key];
  }

  const primaryKey = keys[0];
  if (primaryKey) {
    return `/assets/operators/${SERVICE_FOLDERS[serviceType]}/${primaryKey}.svg`;
  }

  return "";
}

export function normalizeOperatorsList(
  operators: OperatorInput[]
): OperatorOption[] {
  return operators.map((operator) => normalizeOperatorInput(operator));
}
