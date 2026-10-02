export type Dmt1TransferMode = "IMPS" | "NEFT" | "RTGS";

export type Dmt1TxnStatus =
  | "SUCCESS"
  | "PENDING"
  | "PROCESSING"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED";

export type Dmt1VerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "UNVERIFIED"
  | "FAILED";

export type Dmt1FlowStep =
  | "beneficiaries"
  | "add-beneficiary"
  | "transfer"
  | "commission"
  | "review"
  | "mpin"
  | "processing"
  | "status";

export type Dmt1Step =
  | "search"
  | "register"
  | "otp"
  | "start"
  | "beneficiary"
  | "transfer"
  | "commission"
  | "review"
  | "mpin"
  | "success";

export interface Dmt1Remitter {
  mobile: string;
  fullName: string;
  email?: string;
  otpVerified: boolean;
  registered: boolean;
  remitterId?: string;
}

export interface Dmt1Beneficiary {
  id: string;
  remitterId?: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountMasked?: string;
  ifsc: string;
  accountType?: string;
  mobile: string;
  email?: string;
  isVerified: boolean;
  verificationStatus: Dmt1VerificationStatus;
  verifiedAt?: string;
  createdAt?: string;
}

export interface Dmt1CommissionPreview {
  transferAmount: number;
  charges: number;
  commission: number;
  totalDebit: number;
  availableBalance: number;
  balanceAfterTransfer: number;
  transferMode: Dmt1TransferMode;
  currency: string;
}

export interface Dmt1Transaction {
  id: string;
  clientTxnId?: string;
  reference?: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  amount: number;
  charges?: number;
  commission?: number;
  totalDebit?: number;
  status: Dmt1TxnStatus;
  utr?: string;
  bankRef?: string;
  transferMode: Dmt1TransferMode;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
  failureReason?: string;
  bankName?: string;
  ifscCode?: string;
  accountNumber?: string;
  payerName?: string;
  payeeName?: string;
  openingBalance?: number;
  closingBalance?: number;
  beneficiary?: Dmt1Beneficiary;
  remitter?: {
    name?: string;
    mobile?: string;
    email?: string;
  };
}

export interface Dmt1PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Dmt1AddBeneficiaryInput {
  remitterMobile?: string;
  remitterId?: string;
  name: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: string;
}

export interface Dmt1TransferDraft {
  beneficiaryId: string;
  amount: number;
  transferMode: Dmt1TransferMode;
  remarks: string;
}

export interface Dmt1InitiateTransactionInput {
  beneficiaryId: string;
  amount: number;
  transferMode: Dmt1TransferMode;
  remarks?: string;
  mpin: string;
  /** InstantPay transaction OTP (4–8 digits) */
  otp: string;
  /** InstantPay reference key from biometric / generate-otp */
  referenceKey: string;
  latitude: string;
  longitude: string;
  clientTxnId?: string;
  externalRef?: string;
  payerName?: string;
  remitterMobile?: string;
  remitterMobileNumber?: string;
  email?: string;
  serviceId?: string;
  serviceCode?: string;
}

export interface Dmt1GenerateTxnOtpInput {
  remitterMobileNumber: string;
  amount: number;
  referenceKey?: string;
}

export interface Dmt1GenerateTxnOtpResult {
  message: string;
  referenceKey?: string;
  raw?: unknown;
}

export interface Dmt1RetailerContext {
  senderName: string;
  senderMobile: string;
  email: string;
}
