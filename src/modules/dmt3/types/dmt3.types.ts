export type Dmt3TransferMode = "IMPS" | "NEFT" | "RTGS";

export type Dmt3TxnStatus =
  | "SUCCESS"
  | "PENDING"
  | "PROCESSING"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED";

export type Dmt3VerificationStatus =
  | "VERIFIED"
  | "PENDING"
  | "UNVERIFIED"
  | "FAILED";

export type Dmt3FlowStep =
  | "beneficiaries"
  | "add-beneficiary"
  | "transfer"
  | "commission"
  | "review"
  | "mpin"
  | "processing"
  | "status";

export type Dmt3Step =
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

export interface Dmt3Remitter {
  mobile: string;
  fullName: string;
  email?: string;
  otpVerified: boolean;
  registered: boolean;
  remitterId?: string;
}

export interface Dmt3Beneficiary {
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
  verificationStatus: Dmt3VerificationStatus;
  verifiedAt?: string;
  createdAt?: string;
}

export interface Dmt3CommissionPreview {
  transferAmount: number;
  charges: number;
  commission: number;
  totalDebit: number;
  availableBalance: number;
  balanceAfterTransfer: number;
  transferMode: Dmt3TransferMode;
  currency: string;
}

export interface Dmt3Transaction {
  id: string;
  clientTxnId?: string;
  reference?: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  amount: number;
  charges?: number;
  commission?: number;
  totalDebit?: number;
  status: Dmt3TxnStatus;
  utr?: string;
  bankRef?: string;
  transferMode: Dmt3TransferMode;
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
  beneficiary?: Dmt3Beneficiary;
  remitter?: {
    name?: string;
    mobile?: string;
    email?: string;
  };
}

export interface Dmt3PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Dmt3AddBeneficiaryInput {
  remitterMobile?: string;
  remitterId?: string;
  name: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType?: string;
}

export interface Dmt3TransferDraft {
  beneficiaryId: string;
  amount: number;
  transferMode: Dmt3TransferMode;
  remarks: string;
}

export interface Dmt3InitiateTransactionInput {
  beneficiaryId: string;
  amount: number;
  transferMode: Dmt3TransferMode;
  remarks?: string;
  mpin: string;
  latitude: string;
  longitude: string;
  clientTxnId?: string;
  payerName?: string;
  remitterMobile?: string;
  email?: string;
  serviceId?: string;
  serviceCode?: string;
}

export interface Dmt3RetailerContext {
  senderName: string;
  senderMobile: string;
  email: string;
}
