export type WalletSummaryTypeFilter = "ALL" | "CREDIT" | "DEDUCT";

export type WalletSummaryStatusFilter =
  | "All"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED"
  | "REFUNDED";

export interface WalletSummaryPerformer {
  id: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  userCode?: string | null;
  role?: string | null;
  roleLabel?: string | null;
}

/** Unified wallet ledger row (API: Retailer wallet ledger) */
export interface WalletSummaryTransaction {
  id: string;
  rowNumber: number;
  ledgerId: string;
  ledgerNo: string;
  date: string;
  time: string;
  createdAt: string;
  transactionId: string;
  referenceId: string;
  /** Legacy alias used by older exports */
  reference: string;
  service: string;
  serviceLabel: string;
  serviceType: string;
  transactionType: string;
  description: string;
  status: string;
  openingBalance: number;
  transactionAmount: number;
  charge: number;
  gst: number;
  commission: number;
  tds: number;
  amountCr: number;
  amountDr: number;
  closingBalance: number;
  walletType: string;
  remarks?: string | null;
  /** Legacy fields kept for older table/export paths */
  type: "CREDIT" | "DEDUCT";
  operationType: string;
  action: string;
  amount: number;
  updatedBalance: number;
  performedBy?: WalletSummaryPerformer | null;
  message?: string | null;
}

export interface WalletSummaryUser {
  id: string;
  role: string;
  roleLabel: string;
}

export interface WalletSummaryWallet {
  balance: number;
  holdAmount: number;
  status: string | null;
}

export interface WalletSummaryFilters {
  type: WalletSummaryTypeFilter;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
  search: string | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface WalletSummaryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  count: number;
}

export interface WalletSummaryListParams {
  page?: number;
  limit?: number;
  type?: WalletSummaryTypeFilter;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface WalletSummaryResult {
  user: WalletSummaryUser;
  wallet: WalletSummaryWallet;
  filters: WalletSummaryFilters;
  transactions: WalletSummaryTransaction[];
  meta: WalletSummaryMeta;
}

export type WalletSummaryPortalRole = "md" | "dd" | "rt";
