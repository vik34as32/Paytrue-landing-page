export type FundRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "processing";

export type PaymentMode =
  | "BANK_TRANSFER"
  | "CASH_DEPOSIT"
  | "NEFT"
  | "IMPS"
  | "RTGS"
  | "UPI";

export interface PaymentModeOption {
  value: PaymentMode;
  label: string;
}

export const PAYMENT_MODE_OPTIONS: PaymentModeOption[] = [
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CASH_DEPOSIT", label: "Cash Deposit" },
  { value: "NEFT", label: "NEFT" },
  { value: "IMPS", label: "IMPS" },
  { value: "RTGS", label: "RTGS" },
  { value: "UPI", label: "UPI" },
];

/** @deprecated use PAYMENT_MODE_OPTIONS */
export const PAYMENT_MODES: PaymentMode[] = PAYMENT_MODE_OPTIONS.map(
  (option) => option.value
);

export interface CompanyBankAccount {
  id: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branch?: string;
  upiId?: string;
  isActive?: boolean;
}

export interface FundRequest {
  id: string;
  requestId: string;
  referenceNumber?: string;
  amount: number;
  paymentMode: PaymentMode;
  utrNumber: string;
  paymentDate: string;
  remark: string;
  status: FundRequestStatus;
  createdBy: string;
  approvedBy: string;
  approvedDate: string;
  adminRemark?: string;
  createdAt: string;
  updatedAt: string;
  companyBankId?: string;
  companyBankName?: string;
  bankName?: string;
  receiptUrl?: string;
}

export interface CreateFundRequestPayload {
  amount: number;
  paymentMode: PaymentMode;
  companyBankAccountId: string;
  utrNumber?: string;
  bankName?: string;
  paymentDate: string;
  remark?: string;
  /** Pre-uploaded proof URL (JSON body only; prefer `receipt` file) */
  imageUrl?: string;
  /** Payment proof file — sent as multipart `image` field */
  receipt?: File;
  onUploadProgress?: (percent: number) => void;
}

export interface FundRequestListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FundRequestListResult {
  list: FundRequest[];
  total: number;
  page: number;
  limit: number;
}

export const FUND_REQUEST_STATUS_FILTERS = [
  "Pending",
  "Approved",
  "Declined",
] as const;

/** Internal value when no status chip is selected (shows all statuses). */
export type FundRequestStatusFilter =
  | (typeof FUND_REQUEST_STATUS_FILTERS)[number]
  | "All";
