export type UpiPayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED";

export interface UpiPayoutPreview {
  amount: number;
  charges: number;
  gst: number;
  commission: number;
  totalDebit: number;
  sufficient?: boolean;
  availableBalance?: number;
}

export interface UpiPayoutPayInput {
  vpa: string;
  payeeName: string;
  payeeMobile: string;
  payeeEmail: string;
  remarks: string;
  amount: number;
  mpin: string;
}

export interface UpiPayoutTransaction {
  id: string;
  reference: string;
  vpa: string;
  payeeName: string;
  payeeMobile?: string;
  payeeEmail?: string;
  remarks?: string;
  amount: number;
  status: UpiPayoutStatus;
  createdAt: string;
  completedAt?: string;
  message?: string;
  failureReason?: string;
  errorCode?: string;
  utr?: string;
  externalRef?: string;
  charges?: number;
  gst?: number;
  commission?: number;
  totalDebit?: number;
  closingBalance?: number;
}
