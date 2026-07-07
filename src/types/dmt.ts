export type DmtTransferMode = "IMPS" | "NEFT" | "RTGS";
export type DmtVerificationStatus = "verified" | "pending" | "unverified" | "failed";
export type DmtTransactionStatus = "success" | "pending" | "failed" | "processing";

export interface DmtSender {
  id: string;
  mobile: string;
  name: string;
  firstName?: string;
  lastName?: string;
  verificationStatus: DmtVerificationStatus;
  beneficiaryCount: number;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed?: number;
  monthlyUsed?: number;
  isVerified: boolean;
}

export interface DmtBeneficiary {
  id: string;
  name: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  status: DmtVerificationStatus;
  isVerified: boolean;
  createdAt: string;
}

export interface DmtTransaction {
  id: string;
  transactionId: string;
  referenceNumber: string;
  rrn?: string;
  utr?: string;
  beneficiaryId: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  senderMobile: string;
  senderName: string;
  amount: number;
  charges: number;
  gst: number;
  transferMode: DmtTransferMode;
  status: DmtTransactionStatus;
  remark?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DmtDashboardStats {
  todayTransfers: number;
  successfulTransfers: number;
  pendingTransfers: number;
  failedTransfers: number;
  walletBalance: number;
  totalBeneficiaries: number;
  totalSenders: number;
  totalTransferAmount: number;
}

export interface DmtPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DmtPaginatedResponse<T> {
  items: T[];
  pagination: DmtPagination;
}

export interface CheckSenderResponse {
  exists: boolean;
  sender?: DmtSender | null;
  referenceKey?: string;
}

export interface RegisterSenderPayload {
  mobile: string;
  aadhaar: string;
  referenceKey?: string;
  firstName?: string;
  lastName?: string;
  pincode?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
  referenceKey?: string;
  requestId?: string;
}

export interface OtpActionResponse {
  message?: string;
  requestId?: string;
  referenceKey?: string;
}

export interface DmtBank {
  id: string;
  name: string;
  code?: string;
  ifsc?: string;
  instantPayBankId?: string | number;
}

export interface AddBeneficiaryPayload {
  senderMobile: string;
  name: string;
  accountNumber: string;
  ifscCode: string;
  mobile?: string;
  beneficiaryMobileNumber?: string;
  bankId?: string;
  instantPayBankId?: string | number;
}

export interface VerifyBeneficiaryPayload {
  otp: string;
  referenceKey: string;
}

export interface VerifyBeneficiaryDeletePayload {
  otp: string;
  referenceKey?: string;
}

export interface DeleteBeneficiaryResponse {
  message?: string;
  referenceKey?: string;
}

export interface GenerateTransactionOtpPayload {
  senderMobile: string;
  amount: number;
  referenceKey?: string;
}

export interface VerifyTransactionOtpPayload {
  senderMobile: string;
  otp: string;
  referenceKey: string;
  amount?: number;
}

export interface TransferPayload {
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

export interface TransferInitResponse {
  requiresOtp: boolean;
  requestId?: string;
  referenceKey?: string;
  reference?: string;
  transaction?: DmtTransaction;
  charges?: number;
  gst?: number;
  netAmount?: number;
}

export interface RemitterEkycPayload {
  mobile: string;
  referenceKey?: string;
  latitude: string;
  longitude: string;
  externalRef?: string;
  consentTaken: "Y" | "N";
  captureType?: "FINGER" | "FACE";
  pidData: string;
}

export interface RefundPayload {
  reason?: string;
  otp?: string;
  referenceKey?: string;
  ipayId?: string;
}

export interface DmtTransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: DmtTransactionStatus | "all";
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export type DmtErrorCode =
  | "INVALID_SENDER"
  | "BENEFICIARY_EXISTS"
  | "OTP_EXPIRED"
  | "INVALID_OTP"
  | "BANK_DOWN"
  | "TIMEOUT"
  | "INSUFFICIENT_BALANCE"
  | "TRANSACTION_FAILED"
  | "SERVER_ERROR"
  | "UNKNOWN";

export interface DmtApiError extends Error {
  status?: number;
  code?: DmtErrorCode;
  data?: unknown;
}
