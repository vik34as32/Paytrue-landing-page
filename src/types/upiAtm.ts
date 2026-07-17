export type UpiAtmStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "EXPIRED"
  | "CANCELLED"
  | string;

export interface UpiAtmGenerateQrPayload {
  latitude: string;
  longitude: string;
  customerMobile: string;
  amount: string;
  externalRef: string;
  serviceId?: string;
}

export interface UpiAtmTransaction {
  id?: string;
  referenceId?: string;
  externalRef?: string;
  mobile?: string;
  amount?: number | string;
  status?: UpiAtmStatus;
  utr?: string;
  rrn?: string;
  transactionId?: string;
  qrString?: string;
  qrImage?: string;
  message?: string;
  paidAt?: string;
  createdAt?: string;
  /** Raw API expiry datetime, e.g. "2026-07-16 19:01:13" */
  expiryDt?: string;
  /** Seconds until QR expires from generation (API may send string) */
  displayExpirySec?: number | string;
  /** Resolved absolute expiry timestamp (ms) for countdown UI */
  expiresAtMs?: number;
  [key: string]: unknown;
}

export interface UpiAtmGenerateQrResponse {
  success?: boolean;
  message?: string;
  transaction?: UpiAtmTransaction;
  referenceId?: string;
  qrString?: string;
  qrImage?: string;
}

export interface UpiAtmStatusResponse {
  success?: boolean;
  message?: string;
  transaction?: UpiAtmTransaction;
  status?: UpiAtmStatus;
}
