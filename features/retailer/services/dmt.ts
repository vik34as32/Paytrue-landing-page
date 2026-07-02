import type { Beneficiary, DMTTransfer } from "@/types/retailer";
import type { BankOption } from "@/types/bank";
import { resolveBankLogoPath } from "@/src/lib/bankLogos";

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchBeneficiaries(): Promise<Beneficiary[]> {
  await delay();
  return [
    {
      id: "ben_001",
      name: "Rahul Sharma",
      mobile: "9876543210",
      bankName: "State Bank of India",
      accountNumber: "123456789012",
      ifscCode: "SBIN0001234",
      createdAt: "2026-01-15T10:00:00.000Z",
    },
    {
      id: "ben_002",
      name: "Priya Patel",
      mobile: "9123456789",
      bankName: "HDFC Bank",
      accountNumber: "987654321098",
      ifscCode: "HDFC0001234",
      createdAt: "2026-02-20T14:30:00.000Z",
    },
  ];
}

export async function validateIFSC(ifsc: string): Promise<boolean> {
  await delay(400);
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}

export async function initiateDMTTransfer(payload: {
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  remark: string;
}): Promise<DMTTransfer> {
  await delay(1200);
  return {
    id: `dmt_${Date.now()}`,
    beneficiaryId: payload.beneficiaryId,
    beneficiaryName: payload.beneficiaryName,
    amount: payload.amount,
    remark: payload.remark,
    status: "success",
    createdAt: new Date().toISOString(),
  };
}

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
  bank("canara", "Canara Bank", "Canara", "CNRB"),
  bank("union", "Union Bank of India", "Union Bank", "UBIN"),
  bank("indian_bank", "Indian Bank", "Indian Bank", "IDIB"),
  bank("uco", "UCO Bank", "UCO", "UCBA"),
  bank("boi", "Bank of India", "BOI", "BKID"),
  bank("central_bank", "Central Bank of India", "Central Bank", "CBIN"),
  bank("psb", "Punjab & Sind Bank", "P&S Bank", "PSIB"),
  bank("idbi", "IDBI Bank", "IDBI", "IBKL"),
  bank("iob", "Indian Overseas Bank", "IOB", "IOBA"),
  bank("bom", "Bank of Maharashtra", "BOM", "MAHB"),
  bank("kotak", "Kotak Mahindra Bank", "Kotak", "KKBK"),
  bank("indusind", "IndusInd Bank", "IndusInd", "INDB"),
  bank("yes", "Yes Bank", "Yes Bank", "YESB"),
  bank("rbl", "RBL Bank", "RBL", "RATN"),
  bank("federal", "Federal Bank", "Federal", "FDRL"),
  bank("sib", "South Indian Bank", "SIB", "SIBL"),
  bank("bandhan", "Bandhan Bank", "Bandhan", "BDBL"),
  bank("au", "AU Small Finance Bank", "AU SFB", "AUBL"),
  bank("ujjivan", "Ujjivan Small Finance Bank", "Ujjivan", "UJVN"),
  bank("equitas", "Equitas Small Finance Bank", "Equitas", "ESFB"),
  bank("esaf", "ESAF Small Finance Bank", "ESAF", "ESAF"),
  bank("jana", "Jana Small Finance Bank", "Jana", "JSFB"),
  bank("suryoday", "Suryoday Small Finance Bank", "Suryoday", "SURY"),
  bank("karnataka", "Karnataka Bank", "Karnataka", "KARB"),
  bank("kvb", "Karur Vysya Bank", "KVB", "KVBL"),
  bank("tmb", "Tamilnad Mercantile Bank", "TMB", "TMBL"),
  bank("cub", "City Union Bank", "CUB", "CIUB"),
  bank("dcb", "DCB Bank", "DCB", "DCBL"),
  bank("csb", "CSB Bank", "CSB", "CSBK"),
  bank("dbs", "DBS Bank India", "DBS", "DBSS"),
  bank("scb", "Standard Chartered Bank", "SCB", "SCBL"),
  bank("hsbc", "HSBC India", "HSBC", "HSBC"),
  bank("deutsche", "Deutsche Bank India", "Deutsche", "DEUT"),
  bank("citi", "Citi Bank", "Citi", "CITI"),
  bank("idfc", "IDFC FIRST Bank", "IDFC FIRST", "IDFB"),
];

/** Backward-compatible bank name list used by existing DMT flows. */
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
