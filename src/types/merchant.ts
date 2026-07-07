import type { AepsBiometricData } from "@/src/lib/pidParser";

export interface MerchantReferenceDetails {
  retailerId?: string;
  outletId?: string;
  referenceKey?: string;
  referenceKeyType?: string;
  spKey?: string;
  pidOptionWadh?: string;
}

export type BiometricStatusValue = "VERIFIED" | "PENDING" | string;

export interface MerchantStatusResult {
  biometricStatus: BiometricStatusValue;
  isVerified: boolean;
  isPending: boolean;
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
  raw?: Record<string, unknown>;
}

export type VerificationPhase = "idle" | "scanning" | "verifying" | "success" | "error";
