export type WalletRole = "md" | "dd" | "rt";

export type ReceiverUserType =
  | "MASTER_DISTRIBUTOR"
  | "DISTRIBUTOR"
  | "RETAILER";

export interface WalletBalance {
  currentBalance: number;
  holdBalance: number;
  availableBalance: number;
  lastUpdated: string | null;
  /** Backward-compatible alias used by portal strip & balance transfer */
  balance: number;
}

export interface WalletRoleState extends WalletBalance {
  loading: boolean;
  error: string | null;
}

export interface WalletTransferPayload {
  receiverId: string;
  amount: number;
  description: string;
  role: WalletRole;
}

export interface WalletDeductPayload {
  userId: string;
  amount: number;
  description: string;
  role: WalletRole;
}

export interface WalletTransferRecord {
  id: string;
  transactionId: string;
  date: string;
  sender: string;
  receiver: string;
  userType: string;
  transactionType: string;
  amount: number;
  credit: number;
  debit: number;
  openingBalance: number;
  closingBalance: number;
  status: string;
  remark: string;
  description: string;
}

export interface TransferHistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}

export interface TransferHistoryState {
  list: WalletTransferRecord[];
  total: number;
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  dateFrom: string;
  dateTo: string;
  loading: boolean;
  error: string | null;
}

export interface ReceiverOption {
  id: string;
  label: string;
  userType: ReceiverUserType;
}
