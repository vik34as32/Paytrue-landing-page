export type AepsLedgerStatus =
  | "SUCCESS"
  | "FAILED"
  | "PENDING"
  | "REFUNDED"
  | "REVERSED"
  | string;

export type AepsLedgerSortBy =
  | "createdAt"
  | "ledgerNo"
  | "transactionAmount"
  | "closingBalance"
  | string;

export type AepsLedgerSortOrder = "asc" | "desc";

export type AepsLedgerExportFormat = "csv" | "excel" | "xlsx";

export interface AepsLedgerRow {
  id: string;
  rowNumber: number;
  ledgerId: string;
  ledgerNo: string;
  date: string;
  time: string;
  createdAt: string;
  service: string;
  serviceLabel: string;
  description: string;
  status: AepsLedgerStatus;
  openingBalance: number;
  transactionAmount: number;
  charge: number;
  commission: number;
  tds: number;
  amountCr: number;
  amountDr: number;
  closingBalance: number;
  rrn: string;
  bank: string;
  remarks: string | null;
  transactionType: string;
}

export interface AepsLedgerMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  count: number;
}

export interface AepsLedgerWallet {
  balance: number;
  holdAmount?: number;
  status?: string | null;
}

export interface AepsLedgerListParams {
  page?: number;
  limit?: number;
  search?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  service?: string;
  sortBy?: AepsLedgerSortBy;
  sortOrder?: AepsLedgerSortOrder;
}

export interface AepsLedgerExportParams {
  fromDate: string;
  toDate: string;
  format: AepsLedgerExportFormat;
  search?: string;
  status?: string;
  service?: string;
  sortBy?: AepsLedgerSortBy;
  sortOrder?: AepsLedgerSortOrder;
}

export interface AepsLedgerResult {
  transactions: AepsLedgerRow[];
  wallet?: AepsLedgerWallet | null;
  meta: AepsLedgerMeta;
  filters?: {
    status?: string | null;
    service?: string | null;
    fromDate?: string | null;
    toDate?: string | null;
    search?: string | null;
    sortBy?: string;
    sortOrder?: AepsLedgerSortOrder;
  };
}
