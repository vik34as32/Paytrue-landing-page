export type MpinLength = 4 | 6;

export interface MpinStatus {
  isMpinCreated: boolean;
  isLocked?: boolean;
  lockedUntil?: string | null;
  attemptsRemaining?: number | null;
  message?: string;
}

export interface CreateMpinPayload {
  mpin: string;
  confirmMpin: string;
}

export interface ChangeMpinPayload {
  oldMpin: string;
  newMpin: string;
  confirmMpin: string;
}

export interface VerifyMpinPayload {
  mpin: string;
}

export interface VerifyMpinResult {
  verified: boolean;
  message?: string;
  attemptsRemaining?: number | null;
  locked?: boolean;
}

export interface MpinVerifyApiError {
  message: string;
  status?: number;
  attemptsRemaining?: number | null;
  locked?: boolean;
  data?: unknown;
}

export interface MpinActionResult {
  success: boolean;
  message?: string;
}
