export type DmtTransferMode = "IMPS" | "NEFT";
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
}

export interface RegisterSenderPayload {
  mobile: string;
  aadhaarNumber: string;
}

export interface VerifyOtpPayload {
  mobile: string;
  otp: string;
  requestId?: string;
}

export interface AddBeneficiaryPayload {
  name: string;
  accountNumber: string;
  ifscCode: string;
  mobile: string;
  bankName?: string;
}

export interface VerifyBeneficiaryPayload {
  otp: string;
}

export interface TransferPayload {
  beneficiaryId: string;
  amount: number;
  transferMode: DmtTransferMode;
  remark?: string;
  otp?: string;
}

export interface TransferInitResponse {
  requiresOtp: boolean;
  requestId?: string;
  transaction?: DmtTransaction;
  charges?: number;
  gst?: number;
  netAmount?: number;
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
