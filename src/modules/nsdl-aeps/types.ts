export type NsdlServiceType =
  | "BALANCE_ENQUIRY"
  | "CASH_WITHDRAWAL"
  | "CASH_DEPOSIT"
  | "MINI_STATEMENT"
  | "AADHAAR_PE";

/** NiFi outlet-login auth type: 1 = Cash Withdrawal, 2 = Aadhaar Pe, 3 = Cash Deposit */
export type NsdlDailyLoginAuthType = "1" | "2" | "3";

export type NsdlTxnStatus = "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | string;

export type NsdlNextAction =
  | "SUBMIT_ONBOARDING"
  | "VERIFY_OTP"
  | "COMPLETE_EKYC"
  | "COMPLETE_VIDEO_KYC"
  | "AWAIT_ACTIVATION"
  | "DAILY_LOGIN"
  | "CONTACT_SUPPORT"
  | string;

export interface NsdlBank {
  name: string;
  iin: string;
}

export interface NsdlState {
  id: string;
  name: string;
}

export interface NsdlMerchant {
  merchantId: string | null;
  status: string;
  nextAction: NsdlNextAction;
  activated: boolean;
  dailyLoginStatus: string | null;
  lastDailyLoginAt: string | null;
  videoKycUrl: string | null;
  mobile: string | null;
  email: string | null;
  shopName: string | null;
  aadhaarMasked: string | null;
  bankIin: string | null;
}

/** Server-side step result for onboarding / daily login (no financial movement). */
export interface NsdlStepResult {
  success: boolean;
  status: string;
  message: string;
  nextAction?: NsdlNextAction;
  merchantId?: string | null;
  videoKycUrl?: string | null;
  transactionId?: string;
}

export interface NsdlMiniStatementRow {
  date: string;
  narration: string;
  amount: number;
  type: string;
  balance?: number;
}

export interface NsdlTransaction {
  id: string;
  transactionId: string;
  serviceType: NsdlServiceType | string;
  status: NsdlTxnStatus;
  message: string;
  amount: number;
  charges: number;
  commission: number;
  aadhaarMasked: string;
  bankIIN: string;
  bankName?: string;
  mobile?: string;
  bankReference: string;
  providerTransactionId: string;
  bankAccountBalance?: number;
  miniStatement: NsdlMiniStatementRow[];
  openingBalance?: number;
  closingBalance?: number;
  createdAt: string;
  completedAt?: string;
}

export interface NsdlTransactionInput {
  serviceType: NsdlServiceType;
  aadhaarNumber: string;
  mobile: string;
  bankIIN: string;
  amount?: number;
  pidBlock: string;
  latitude: string;
  longitude: string;
  mpin: string;
  idempotencyKey: string;
}

export interface NsdlLedgerRow {
  transactionId: string;
  reference: string;
  serviceType: string;
  amount: number;
  charges: number;
  commission: number;
  debit: number;
  credit: number;
  openingBalance: number | null;
  closingBalance: number | null;
  status: string;
  aadhaarMasked: string;
  bankIIN: string;
  bankReference: string;
  providerMessage: string;
  createdAt: string;
}

export interface NsdlLedgerResult {
  rows: NsdlLedgerRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  openingBalance: number;
  closingBalance: number;
  totalCredit: number;
  totalDebit: number;
}

export interface NsdlLedgerQuery {
  page?: number;
  limit?: number;
  status?: string;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
  transactionId?: string;
}

export interface NsdlOnboardInput {
  mobile: string;
  email: string;
  latitude: string;
  longitude: string;
  city: string;
  district: string;
  pincode: string;
  shopName: string;
  aadhaarNumber: string;
  pan: string;
  firstName: string;
  middleName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  mcc: string;
  gstin: string;
  businessPan: string;
  bankAccountNumber: string;
  ifsc: string;
  bankName: string;
  accountHolderName: string;
  shopAddress: string;
  shopCity: string;
  shopDistrict: string;
  shopState: string;
  shopPin: string;
  stateId: string;
}
