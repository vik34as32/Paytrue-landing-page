export type AepsTransferMode = "IMPS" | "NEFT" | "RTGS";

export type AepsSettlementStatus = "SUCCESS" | "PENDING" | "FAILED";

export interface AepsSettlement {
  id: string;
  amount: number;
  status: AepsSettlementStatus | string;
  externalRef: string;
  transferMode: AepsTransferMode | string;
  accountNumberMasked: string;
  ifscCode: string;
  payeeName: string;
  openingBalance: number | null;
  closingBalance: number | null;
  walletReversed: boolean;
  ipayUuid: string | null;
  orderId: string | null;
  txnReferenceId: string | null;
  providerMessage: string | null;
  message: string | null;
  createdAt: string | null;
}

export interface AepsSettlementInput {
  amount: number;
  transferMode: AepsTransferMode;
  latitude: string;
  longitude: string;
  remarks?: string;
  idempotencyKey: string;
}

export interface AepsSettlementQuery {
  page: number;
  limit: number;
  status?: string;
}

export interface AepsSettlementList {
  items: AepsSettlement[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
