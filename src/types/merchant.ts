import type { AepsBiometricData } from "@/src/lib/pidParser";

export interface MerchantReferenceDetails {
  retailerId?: string;
  outletId?: string;
  referenceKey?: string;
  referenceKeyType?: string;
  spKey?: string;
  pidOptionWadh?: string;
}

/** Canonical InstantPay biometric-status values we care about in UI. */
export type BiometricStatusValue =
  | "PENDING"
  | "APPROVAL_PENDING"
  | "APPROVED"
  | "VERIFIED"
  | string;

/** Dashboard / gate UI derived only from biometric-status API. */
export type MerchantBiometricUiPhase =
  | "loading"
  | "action_required"
  | "approval_pending"
  | "approved"
  | "unknown";

export interface MerchantStatusResult {
  biometricStatus: BiometricStatusValue;
  /** InstantPay action field (e.g. ACTION-REQUIRED) */
  action?: string;
  /** True when status/action means biometric capture is still required */
  actionRequired?: boolean;
  isVerified: boolean;
  isPending: boolean;
  isPendingApproval?: boolean;
  uiPhase?: MerchantBiometricUiPhase;
  retailerId?: string;
  outletId?: string;
  referenceKey?: string;
  referenceKeyType?: string;
  spKey?: string;
  pidOptionWadh?: string;
  message?: string;
  raw?: Record<string, unknown>;
}

export interface SubmitBiometricKycRequest {
  retailerId: string;
  biometricData: AepsBiometricData | string;
  referenceKey: string;
  referenceKeyType: string;
  spKey?: string;
  pidOptionWadh?: string;
  outletId?: string;
}

export interface SubmitBiometricKycResult {
  success: boolean;
  message: string;
  biometricStatus: BiometricStatusValue;
  action?: string;
  isVerified?: boolean;
  isPendingApproval?: boolean;
  raw?: Record<string, unknown>;
}

export type VerificationPhase =
  | "idle"
  | "scanning"
  | "verifying"
  | "success"
  | "pending_approval"
  | "error";
