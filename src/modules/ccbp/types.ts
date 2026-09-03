export type CcbpPaymentType = "IMPS" | "NEFT" | "RTGS";
export type CcbpStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "REVERSED";

export interface CcbpPayInput {
  ifscCode: string;
  amount: number;
  payeeName: string;
  payeeMobile: string;
  payeeEmail: string;
  payerName?: string;
  remarks?: string;
  paymentType: CcbpPaymentType;
  creditCardNumber: string;
  mpin: string;
}

export interface CcbpTransaction {
  id: string;
  reference: string;
  payeeName: string;
  payeeMobile: string;
  payeeEmail: string;
  creditCardNumber: string;
  ifscCode: string;
  amount: number;
  paymentType: CcbpPaymentType;
  remarks: string;
  status: CcbpStatus;
  createdAt: string;
  message?: string;
}

export interface CcbpIssuer {
  id: string;
  name: string;
  shortName: string;
  ifscPrefix: string;
  logoSrc: string;
  cardFrom: string;
  cardTo: string;
}
