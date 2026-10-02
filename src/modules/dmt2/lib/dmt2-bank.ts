import type { Dmt2Beneficiary } from "../types";

const IFSC_BANK_NAMES: Record<string, string> = {
  SBIN: "State Bank of India",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  PUNB: "Punjab National Bank",
  BARB: "Bank of Baroda",
  CNRB: "Canara Bank",
  UBIN: "Union Bank of India",
  IDIB: "Indian Bank",
  UCBA: "UCO Bank",
  BKID: "Bank of India",
  CBIN: "Central Bank of India",
  PSIB: "Punjab & Sind Bank",
  IBKL: "IDBI Bank",
  IOBA: "Indian Overseas Bank",
  MAHB: "Bank of Maharashtra",
  KKBK: "Kotak Mahindra Bank",
  INDB: "IndusInd Bank",
  YESB: "Yes Bank",
  RATN: "RBL Bank",
  FDRL: "Federal Bank",
  SIBL: "South Indian Bank",
  BDBL: "Bandhan Bank",
  AUBL: "AU Small Finance Bank",
  UJVN: "Ujjivan Small Finance Bank",
  ESMF: "ESAF Small Finance Bank",
  ESFB: "Equitas Small Finance Bank",
  JSFB: "Jana Small Finance Bank",
  SURY: "Suryoday Small Finance Bank",
  KARB: "Karnataka Bank",
  KVBL: "Karur Vysya Bank",
  TMBL: "Tamilnad Mercantile Bank",
  CIUB: "City Union Bank",
  DCBL: "DCB Bank",
  CSBK: "CSB Bank",
  IDFB: "IDFC FIRST Bank",
  CITI: "Citibank",
  FINO: "Fino Payments Bank",
  DLXB: "Dhanlaxmi Bank",
  IPOS: "India Post Payments Bank",
  JIOP: "Jio Payments Bank",
  PYTM: "Paytm Payments Bank",
  AIRP: "Airtel Payments Bank",
  JAKA: "Jammu & Kashmir Bank",
  NTBL: "Nainital Bank",
  HSBC: "HSBC Bank",
  SCBL: "Standard Chartered Bank",
  DBSS: "DBS Bank",
  DEUT: "Deutsche Bank",
};

export function ifscPrefix(ifsc: string): string {
  return String(ifsc || "").trim().toUpperCase().slice(0, 4);
}

export function resolveDmt2BankName(
  beneficiary: Pick<Dmt2Beneficiary, "ifsc" | "bankName">
): string {
  const fromApi = String(beneficiary.bankName || "").trim();
  if (fromApi) return fromApi;
  const prefix = ifscPrefix(beneficiary.ifsc);
  return IFSC_BANK_NAMES[prefix] || (prefix ? `${prefix} Bank` : "Bank");
}

/** Groups digits in fours for readability; keeps masked chars (X/*) as-is. */
export function formatAccountNumber(accountNumber: string): string {
  const raw = String(accountNumber || "").replace(/\s+/g, "");
  if (!raw) return "—";
  return raw.replace(/(.{4})(?=.)/g, "$1 ");
}

/** Hidden payout remark (max 50) — never shown or edited in UI. */
export function buildDmt2TransferRemarks(amount: number, accountNumber: string): string {
  const n = Math.trunc(Number.isFinite(amount) ? amount : 0);
  const account = String(accountNumber || "").replace(/\s+/g, "");
  return `Rs ${n} sent to A/c ${account}`.slice(0, 50);
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowHundred(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
}

function belowThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return [hundreds ? `${ONES[hundreds]} Hundred` : "", rest ? belowHundred(rest) : ""]
    .filter(Boolean)
    .join(" ");
}

/** Indian numbering (Lakh / Crore) for amount confirmation. */
export function amountInWords(amount: number): string {
  let n = Math.floor(Number(amount) || 0);
  if (n <= 0) return "";
  const parts: string[] = [];
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  if (crore) parts.push(`${belowThousand(crore)} Crore`);
  if (lakh) parts.push(`${belowHundred(lakh)} Lakh`);
  if (thousand) parts.push(`${belowHundred(thousand)} Thousand`);
  if (n) parts.push(belowThousand(n));
  return `Rupees ${parts.join(" ")} Only`;
}
