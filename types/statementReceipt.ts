export type TransactionType = "debit" | "credit";
export type TransactionStatus = "success" | "pending" | "failed" | "expired";
export type StatementSource = "dmt" | "upi-atm" | "aeps";

export type AepsTransactionTypeCode =
  | "BALANCE_ENQUIRY"
  | "CASH_WITHDRAWAL"
  | "MINI_STATEMENT"
  | "CASH_DEPOSIT"
  | "AADHAAR_PAY";

export interface StatementTransaction {
  id: string;
  referenceNumber: string;
  createdAt: string;
  service: string;
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  debitAmount?: number;
  creditAmount?: number;
  /** Principal / transfer amount shown in statement table */
  transferAmount?: number;
  /** AEPS cash withdrawal principal amount */
  withdrawalAmount?: number;
  /** Fee / charge deducted for the transaction */
  deductionAmount?: number;
  /** Retailer commission earned on the transaction */
  commission?: number;
  openingBalance: number;
  balanceAfter: number;
  senderName: string;
  receiverName: string;
  mobile: string;
  remark: string;
  source?: StatementSource;
  bankReference?: string;
  transferMode?: string;
  charges?: number;
  bankName?: string;
  accountNumber?: string;
  /** UPI payer VPA (e.g. user@okhdfcbank) */
  vpa?: string;
  /** Provider / UPI txn id (e.g. P260717…) */
  upiTxnId?: string;
  /** UPI ATM QR image (data URL or http URL) */
  qrImage?: string;
  /** UPI pay deep-link string */
  qrString?: string;
  /** Masked Aadhaar for AEPS (e.g. XXXXXXXX4382) */
  aadhaarMasked?: string;
  accountHolderName?: string;
  ifscCode?: string;
  bankBranch?: string;
  bankAddress?: string;
  bankCity?: string;
  bankState?: string;
  aepsTransactionType?: AepsTransactionTypeCode | string;
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
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  bankBranch?: string;
  bankAddress?: string;
  bankCity?: string;
  bankState?: string;
  txnMobile?: string;
  aepsTransactionLabel?: string;
  showWalletBalance?: boolean;
  showBankDetailsCard?: boolean;
}

export const PAYTRUE_LOGO_PATH = "/images/paytrue-logo.png";
export const PAYTRUE_WEBSITE = "https://paytrue.co.in";
export const PAYTRUE_SUPPORT_EMAIL = "support@paytrue.co.in";
export const PAYTRUE_CUSTOMER_CARE = "+91 98765 43210";
