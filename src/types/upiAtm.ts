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
