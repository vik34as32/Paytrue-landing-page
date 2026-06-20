import type { Beneficiary, DMTTransfer } from "@/types/retailer";

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

export const BANK_LIST = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "Union Bank of India",
];
