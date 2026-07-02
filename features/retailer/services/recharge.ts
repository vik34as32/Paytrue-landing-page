import type { RechargeOperator, RechargePlan } from "@/types/retailer";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const MOBILE_OPERATORS: RechargeOperator[] = [
  { id: "airtel", name: "Airtel", type: "mobile" },
  { id: "jio", name: "Jio", type: "mobile" },
  { id: "vi", name: "Vi", type: "mobile" },
  { id: "bsnl", name: "BSNL", type: "mobile" },
  { id: "mtnl", name: "MTNL", type: "mobile" },
];

export const POSTPAID_OPERATORS: RechargeOperator[] = [
  { id: "airtel_postpaid", name: "Airtel Postpaid", type: "postpaid" },
  { id: "jio_postpaid", name: "Jio Postpaid", type: "postpaid" },
  { id: "vi_postpaid", name: "Vi Postpaid", type: "postpaid" },
  { id: "bsnl_postpaid", name: "BSNL Postpaid", type: "postpaid" },
  { id: "mtnl_postpaid", name: "MTNL Postpaid", type: "postpaid" },
];

export const DTH_OPERATORS: RechargeOperator[] = [
  { id: "tata_play", name: "Tata Play", type: "dth" },
  { id: "airtel_dth", name: "Airtel Digital TV", type: "dth" },
  { id: "dish_tv", name: "Dish TV", type: "dth" },
  { id: "sun_direct", name: "Sun Direct", type: "dth" },
  { id: "d2h", name: "d2h", type: "dth" },
];

export const FASTAG_OPERATORS: RechargeOperator[] = [
  { id: "paytm_fastag", name: "Paytm FASTag", type: "fastag" },
  { id: "icici_fastag", name: "ICICI FASTag", type: "fastag" },
  { id: "axis_fastag", name: "Axis FASTag", type: "fastag" },
  { id: "hdfc_fastag", name: "HDFC FASTag", type: "fastag" },
  { id: "kotak_fastag", name: "Kotak FASTag", type: "fastag" },
  { id: "idfc_fastag", name: "IDFC FASTag", type: "fastag" },
  { id: "sbi_fastag", name: "SBI FASTag", type: "fastag" },
  { id: "equitas_fastag", name: "Equitas FASTag", type: "fastag" },
  { id: "federal_fastag", name: "Federal FASTag", type: "fastag" },
  { id: "indian_bank_fastag", name: "Indian Bank FASTag", type: "fastag" },
];

export const RECHARGE_PLANS: RechargePlan[] = [
  {
    id: "plan_1",
    operatorId: "jio",
    amount: 199,
    validity: "28 Days",
    description: "2GB/Day + Unlimited Calls",
  },
  {
    id: "plan_2",
    operatorId: "jio",
    amount: 299,
    validity: "28 Days",
    description: "2GB/Day + OTT Benefits",
  },
  {
    id: "plan_3",
    operatorId: "airtel",
    amount: 249,
    validity: "28 Days",
    description: "1.5GB/Day + Unlimited Calls",
  },
  {
    id: "plan_4",
    operatorId: "vi",
    amount: 179,
    validity: "28 Days",
    description: "1GB/Day + Unlimited Calls",
  },
];

export async function fetchRechargePlans(
  operatorId: string
): Promise<RechargePlan[]> {
  await delay();
  return RECHARGE_PLANS.filter((p) => p.operatorId === operatorId);
}

export async function processRecharge(payload: {
  operatorId: string;
  mobile: string;
  amount: number;
}): Promise<{ success: boolean; transactionId: string }> {
  await delay(1000);
  return {
    success: true,
    transactionId: `rch_${Date.now()}`,
  };
}

export const ELECTRICITY_BOARDS = [
  "BSES Rajdhani",
  "BSES Yamuna",
  "Tata Power Delhi",
  "MSEDCL Maharashtra",
  "BESCOM Karnataka",
  "TANGEDCO Tamil Nadu",
];

export const GAS_PROVIDERS = [
  "Indane Gas",
  "HP Gas",
  "Bharat Gas",
  "Mahanagar Gas",
  "Gujarat Gas",
];

export const BROADBAND_PROVIDERS = [
  "Airtel Broadband",
  "Jio Fiber",
  "ACT Fibernet",
  "Hathway",
  "BSNL Broadband",
];
