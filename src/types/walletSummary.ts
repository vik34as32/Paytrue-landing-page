export type WalletSummaryTypeFilter = "ALL" | "CREDIT" | "DEDUCT";

export type WalletSummaryStatusFilter =
  | "All"
  | "SUCCESS"
  | "PENDING"
  | "PROCESSING"
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

export interface WalletSummaryTransaction {
  id: string;
  reference: string;
  type: "CREDIT" | "DEDUCT";
  operationType: string;
  action: string;
  amount: number;
  openingBalance: number;
  closingBalance: number;
  updatedBalance: number;
  status: string;
  remarks?: string | null;
  createdAt: string;
  date?: string;
  time?: string;
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
