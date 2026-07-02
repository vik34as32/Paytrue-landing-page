export type TransactionType = "debit" | "credit";
export type TransactionStatus = "success" | "pending" | "failed";

export interface StatementTransaction {
  id: string;
  referenceNumber: string;
  createdAt: string;
  service: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  openingBalance: number;
  balanceAfter: number;
  senderName: string;
  receiverName: string;
  mobile: string;
  remark: string;
}

export interface ReceiptCustomerInfo {
  customerName: string;
  mobile: string;
  retailerId: string;
  outletName: string;
  location: string;
}

export interface ReceiptViewModel {
  receiptNo: string;
  transactionId: string;
  date: string;
  time: string;
  dateTime: string;
  status: TransactionStatus;
  statusLabel: string;
  statusBadge: string;
  operator: string;
  service: string;
  description: string;
  amount: number;
  charge: number;
  gst: number;
  commission: number;
  netDebit: number;
  netAmount: number;
  openingBalance: number;
  closingBalance: number;
  referenceNumber: string;
  bankReference: string;
  paymentMode: string;
  transactionType: TransactionType;
  remark: string;
  customer: ReceiptCustomerInfo;
  qrPayload: string;
}

export const PAYTRUE_LOGO_PATH = "/images/paytrue-logo.png";
export const PAYTRUE_WEBSITE = "https://paytrue.co.in";
export const PAYTRUE_SUPPORT_EMAIL = "support@paytrue.co.in";
export const PAYTRUE_CUSTOMER_CARE = "+91 98765 43210";
