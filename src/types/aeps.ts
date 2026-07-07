export type AepsTransactionType =
  | "cash-withdrawal"
  | "balance-enquiry"
  | "mini-statement"
  | "cash-deposit"
  | "aadhaar-pay";

export interface AepsLocation {
  latitude: string;
  longitude: string;
}

export interface AepsPidCaptureResult {
  pidData: string;
  capturedAt: string;
}

/** Options sent to RD Service CAPTURE (PidOptions XML) */
export interface PidCaptureOptions {
  /** InstantPay merchant KYC WADH from biometric-status */
  wadh?: string;
  env?: "P" | "PP";
}

export interface RdServiceStatus {
  isRunning: boolean;
  baseUrl: string | null;
  rdVersion: string;
  serviceStatus: string;
  deviceConnected: boolean;
  deviceReady: boolean;
  scannerModel: string;
  scannerSerialNumber: string;
  provider: string;
  lastCheckedAt: string;
  error: string | null;
}

export interface AepsBank {
  id: string;
  name: string;
  iin: string;
  bankCode: string;
  isActive: boolean;
}

export interface AepsBiometricCaptureInput {
  pidData: string;
  latitude: string;
  longitude: string;
  externalRef?: string;
  captureType?: "FINGER" | "FACE" | "IRIS";
}

export interface AepsLoginPayload extends AepsBiometricCaptureInput {
  aadhaarNumber?: string;
  aadhaar?: string;
  encryptedAadhaar?: string;
}

export interface AepsAccountVerifyPayload {
  accountNumber: string;
  bankIIN: string;
  latitude: string;
  longitude: string;
  mobileNumber?: string;
}

export interface AepsAccountVerifyResult {
  verified: boolean;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType?: string;
  message: string;
  referenceId?: string;
}

export interface AepsTransactionPayload extends AepsBiometricCaptureInput {
  aadhaarNumber: string;
  mobileNumber: string;
  bankIIN: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  amount?: number;
  referenceId?: string;
  referenceKey?: string;
  otp?: string;
  encryptedAadhaar?: string;
}

export interface AepsTransactionOtpPayload {
  referenceId: string;
  otp: string;
}

export interface AepsTransactionStatusPayload {
  referenceId: string;
}

export interface AepsMiniStatementRow {
  date: string;
  narration: string;
  amount: number;
  type: string;
  balance?: number;
}

export interface AepsTransactionResult {
  referenceId: string;
  transactionId: string;
  status: string;
  message: string;
  amount?: number;
  balance?: number;
  bankName?: string;
  aadhaarNumber?: string;
  mobileNumber?: string;
  customerName?: string;
  rrn?: string;
  stan?: string;
  miniStatement?: AepsMiniStatementRow[];
  receipt?: Record<string, unknown>;
  raw?: Record<string, unknown>;
}

export interface AepsLoginResult {
  success: boolean;
  message: string;
  loginDate: string;
  agentName?: string;
  raw?: Record<string, unknown>;
}

export interface AepsHealthResult {
  status: string;
  message?: string;
  provider?: string;
}
