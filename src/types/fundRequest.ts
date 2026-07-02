export type FundRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type PaymentMode =
  | "UPI"
  | "IMPS"
  | "NEFT"
  | "RTGS"
  | "Cash Deposit"
  | "Bank Transfer";

export interface FundRequest {
  id: string;
  requestId: string;
  amount: number;
  paymentMode: PaymentMode;
  utrNumber: string;
  paymentDate: string;
  remark: string;
  status: FundRequestStatus;
  createdBy: string;
  approvedBy: string;
  approvedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFundRequestPayload {
  amount: number;
  paymentMode: PaymentMode;
  utrNumber?: string;
  paymentDate: string;
  remark?: string;
  createdBy: string;
}

export const PAYMENT_MODES: PaymentMode[] = [
  "UPI",
  "IMPS",
  "NEFT",
  "RTGS",
  "Cash Deposit",
  "Bank Transfer",
];

export const FUND_REQUEST_STATUS_FILTERS = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Cancelled",
] as const;

export type FundRequestStatusFilter =
  (typeof FUND_REQUEST_STATUS_FILTERS)[number];
