export const DMT_NEXT_ACTIONS = [
  "REGISTER",
  "VERIFY_OTP",
  "BIO_AUTH",
  "ADD_BENEFICIARY",
  "BENEFICIARY_OTP",
  "SELECT_BENEFICIARY",
  "GENERATE_TRANSACTION_OTP",
  "TRANSFER",
  "SUCCESS",
  "FAILED",
  "SENDER_PROFILE",
] as const;

export type DmtNextAction = (typeof DMT_NEXT_ACTIONS)[number];

export type DmtTransferMode = "IMPS" | "NEFT";

export interface DmtWorkflowResponse<T = Record<string, unknown>> {
  success: boolean;
  nextAction: DmtNextAction | null;
  message?: string;
  data?: T;
  referenceKey?: string;
  sender?: DmtSender;
  beneficiary?: DmtBeneficiary;
  beneficiaries?: DmtBeneficiary[];
  transaction?: DmtTransaction;
  [key: string]: unknown;
}

export interface DmtSender {
  id?: string;
  mobile: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  pincode?: string;
  state?: string;
  city?: string;
  address?: string;
  dob?: string;
  verificationStatus?: string;
  isVerified?: boolean;
  beneficiaryCount?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
}

export interface DmtBeneficiary {
  id: string;
  name: string;
  mobile?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  isVerified?: boolean;
  status?: string;
}

export interface DmtTransaction {
  id?: string;
  transactionId?: string;
  referenceNumber?: string;
  reference?: string;
  utr?: string;
  rrn?: string;
  amount: number;
  beneficiaryName?: string;
  bankName?: string;
  accountNumber?: string;
  transferMode?: DmtTransferMode;
  status?: string;
  message?: string;
  reason?: string;
}

export interface SearchSenderRequest {
  mobile: string;
}

export interface RegisterSenderRequest {
  mobile: string;
  aadhaar: string;
  name?: string;
  referenceKey?: string;
}

export interface VerifySenderOtpRequest {
  mobile: string;
  otp: string;
  referenceKey?: string;
}

export interface BioAuthRequest {
  mobile: string;
  referenceKey?: string;
  latitude: string;
  longitude: string;
  consentTaken: "Y" | "N";
  captureType?: "FINGER" | "FACE";
  pidData: string;
  externalRef?: string;
}

export interface AddBeneficiaryRequest {
  senderMobile: string;
  name: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  bankId?: string;
  beneficiaryMobileNumber?: string;
}

export interface VerifyBeneficiaryOtpRequest {
  beneficiaryId: string;
  otp: string;
  referenceKey: string;
  senderMobile: string;
}

export interface DeleteBeneficiaryRequest {
  beneficiaryId: string;
  senderMobile: string;
  otp?: string;
  referenceKey?: string;
}

export interface GenerateTransactionOtpRequest {
  senderMobile: string;
  amount: number;
  beneficiaryId: string;
  transferMode: DmtTransferMode;
  referenceKey?: string;
}

export interface VerifyTransactionOtpRequest {
  senderMobile: string;
  otp: string;
  referenceKey: string;
  amount: number;
  beneficiaryId: string;
  transferMode: DmtTransferMode;
}

export interface TransferRequest {
  senderMobile: string;
  beneficiaryId: string;
  amount: number;
  transferMode: DmtTransferMode;
  otp: string;
  referenceKey: string;
  latitude: string;
  longitude: string;
  remarks?: string;
}

export interface DmtBank {
  id: string;
  name: string;
}
