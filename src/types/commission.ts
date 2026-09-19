export type CommissionPortalRole = "rt" | "dd" | "md";

export interface CommissionWallet {
  balance: number;
  availableBalance: number;
  holdAmount: number;
  status?: string | null;
  currency?: string | null;
  serviceName?: string | null;
  lastUpdated?: string | null;
  walletType?: string | null;
}

export interface CommissionLedgerEntry {
  id: string;
  walletId: string;
  userId: string;
  transactionId: string;
  openingBalance: number;
  closingBalance: number;
  amount: number;
  creditDebit: "CREDIT" | "DEBIT" | string;
  serviceName: string;
  serviceId: string;
  walletType?: string | null;
  remarks: string;
  type: string;
  reference: string;
  createdAt: string;
  /** Derived display helpers */
  date: string;
  time: string;
  credit: number;
  debit: number;
  /** Downline retailer who generated this commission (DD/MD). */
  retailerId: string;
  retailerName: string;
  retailerMobile: string;
  retailerCode: string;
}

export interface CommissionLedgerResult {
  items: CommissionLedgerEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  walletType?: string | null;
}

export interface CommissionLedgerFilters {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CommissionTopupRequest {
  amount: number;
}

/** Fixed remarks sent with transfer-to-main — never shown in UI. */
export const COMMISSION_TRANSFER_REMARKS = "transfer main wallet";
