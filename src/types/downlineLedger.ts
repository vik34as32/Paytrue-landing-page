export type DownlineLedgerPortalRole = "dd" | "md";

export type DownlineLedgerServiceFilter =
  | "ALL"
  | "DMT"
  | "DMT2"
  | "DMT3"
  | "AEPS"
  | "UPI_ATM";

export type DownlineLedgerTxnTypeFilter = "ALL" | "CREDIT" | "DEBIT";

export type DownlineLedgerStatusFilter =
  | "ALL"
  | "SUCCESS"
  | "FAILED"
  | "PENDING"
  | "REVERSED";

export interface DownlineLedgerTransaction {
  id: string;
  retailerId: string;
  retailerName: string;
  retailerMobile: string;
  retailerCode: string;
  transactionId: string;
  referenceId: string;
  serviceType: string;
  serviceLabel: string;
  description: string;
  transactionType: "CREDIT" | "DEBIT" | string;
  transactionAmount: number;
  chargeAmount: number;
  gstAmount: number;
  commissionAmount: number;
  totalDebitAmount: number;
  creditedAmount: number;
  openingBalance: number;
  closingBalance: number;
  status: string;
  narration: string;
  createdAt: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  /** Beneficiary / customer mobile (not retailer). */
  beneficiaryMobile: string;
  /** Masked Aadhaar for AEPS rows. */
  aadhaarMasked: string;
}

export interface DownlineLedgerSummary {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalDebitAmount: number;
  totalCreditAmount: number;
  totalCharges: number;
  totalCommission: number;
}

export interface DownlineLedgerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DownlineLedgerListParams {
  page?: number;
  limit?: number;
  search?: string;
  retailerId?: string;
  serviceType?: DownlineLedgerServiceFilter | string;
  transactionType?: DownlineLedgerTxnTypeFilter | string;
  status?: DownlineLedgerStatusFilter | string;
  fromDate?: string;
  toDate?: string;
}

export interface DownlineLedgerResult {
  transactions: DownlineLedgerTransaction[];
  pagination: DownlineLedgerPagination;
  summary: DownlineLedgerSummary | null;
}
