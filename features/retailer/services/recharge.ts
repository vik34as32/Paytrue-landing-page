import type { RechargeOperator, RechargePlan } from "@/types/retailer";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const MOBILE_OPERATORS: RechargeOperator[] = [
  { id: "airtel", name: "Airtel", type: "mobile" },
  { id: "jio", name: "Jio", type: "mobile" },
  { id: "vi", name: "Vi", type: "mobile" },
  { id: "bsnl", name: "BSNL", type: "mobile" },
];

export const DTH_OPERATORS: RechargeOperator[] = [
  { id: "tata_sky", name: "Tata Play", type: "dth" },
  { id: "dish_tv", name: "Dish TV", type: "dth" },
  { id: "airtel_dth", name: "Airtel DTH", type: "dth" },
  { id: "sun_direct", name: "Sun Direct", type: "dth" },
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
