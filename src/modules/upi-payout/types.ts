export type UpiPayoutStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED";

export interface UpiVpaVerification {
  vpa: string;
  name: string;
  verified: boolean;
  message?: string;
}

export interface UpiPayoutPreview {
  amount: number;
  charges: number;
  gst: number;
  commission: number;
  totalDebit: number;
}

export interface UpiPayoutPayInput {
  vpa: string;
  payeeName: string;
  payeeMobile?: string;
  amount: number;
  mpin: string;
}

export interface UpiPayoutTransaction {
  id: string;
  reference: string;
  vpa: string;
  payeeName: string;
  payeeMobile?: string;
  amount: number;
  status: UpiPayoutStatus;
  createdAt: string;
  message?: string;
  failureReason?: string;
  utr?: string;
  charges?: number;
  gst?: number;
  totalDebit?: number;
}
