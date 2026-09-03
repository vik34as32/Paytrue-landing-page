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
  | "start"
  | "beneficiary"
  | "transfer"
  | "commission"
  | "review"
  | "mpin"
  | "success";

export interface Dmt3Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  accountMasked?: string;
  ifsc: string;
  mobile: string;
  verificationStatus: Dmt3VerificationStatus;
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
  beneficiaryId?: string;
  beneficiaryName: string;
  amount: number;
  charges?: number;
  commission?: number;
  totalDebit?: number;
  status: Dmt3TxnStatus;
  utr?: string;
  transferMode: Dmt3TransferMode;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
  failureReason?: string;
}

export interface Dmt3PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Dmt3AddBeneficiaryInput {
  name: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
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
  remarks: string;
  mpin: string;
  latitude: string;
  longitude: string;
  clientTxnId: string;
  senderName: string;
  senderMobile: string;
  email: string;
}

export interface Dmt3RetailerContext {
  senderName: string;
  senderMobile: string;
  email: string;
}
