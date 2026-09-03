export type Dmt2Gender = "male" | "female" | "other" | "";
export type Dmt2TransferMode = "IMPS" | "NEFT" | "RTGS";
export type Dmt2TxnStatus =
  | "SUCCESS"
  | "PROCESSING"
  | "PENDING"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED";
export type Dmt2Step =
  | "search"
  | "register"
  | "otp"
  | "beneficiary"
  | "transfer"
  | "txnOtp"
  | "success";

export interface Dmt2Retailer {
  mobile: string;
  fullName: string;
  gender: Dmt2Gender;
  otpVerified: boolean;
  registered: boolean;
  remitterId?: string;
}

export interface Dmt2Beneficiary {
  id: string;
  retailerMobile: string;
  remitterId?: string;
  name: string;
  accountNumber: string;
  accountMasked?: string;
  ifsc: string;
  accountType?: string;
  mobile: string;
  verified?: boolean;
  createdAt: string;
}

export interface Dmt2TransferDraft {
  amount: number;
  mode: Dmt2TransferMode;
  purpose: string;
  referenceId: string;
}

export interface Dmt2Transaction {
  id: string;
  customerName: string;
  accountNumber: string;
  ifsc: string;
  customerMobile: string;
  amount: number;
  mode: Dmt2TransferMode;
  purpose: string;
  referenceId: string;
  status: Dmt2TxnStatus;
  createdAt: string;
}

export interface SearchRetailerResult {
  found: boolean;
  retailer: Dmt2Retailer | null;
}

export interface MockOtpResult {
  success: boolean;
  message: string;
  payload?: unknown;
}
