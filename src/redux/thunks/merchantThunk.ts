import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchMerchantBiometricStatus,
  fetchMerchantStatus,
  submitMerchantBiometricKyc,
} from "@/src/api/merchantApi";
import {
  buildMerchantStatusRequest,
  extractMerchantReferenceDetails,
  formatMissingReferenceError,
  hasRequiredBiometricReferences,
  resolveAuthRetailerId,
} from "@/src/lib/merchantUtils";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import type { SubmitBiometricKycRequest } from "@/src/types/merchant";

type MerchantThunkState = {
  auth: { user: Record<string, unknown> | null };
  profile: { data: Record<string, unknown> | null };
  merchant: {
    retailerId: string | null;
    referenceKey: string | null;
    referenceKeyType: string | null;
    spKey: string | null;
    outletId: string | null;
    raw: Record<string, unknown> | null;
    isVerified: boolean;
    isPendingApproval: boolean;
    biometricStatus: string;
    action: string | null;
  };
};

function merchantSources(state: MerchantThunkState): unknown[] {
  return [
    state.merchant,
    state.merchant.raw,
    state.auth.user,
    (state.auth.user as { outlet?: unknown })?.outlet,
    state.profile.data,
    (state.profile.data as { outlet?: unknown })?.outlet,
  ];
}

function buildBiometricStatusRequest(state: MerchantThunkState) {
  const sources = merchantSources(state);
  const request = buildMerchantStatusRequest(...sources);
  const candidate =
    request.retailerId ||
    resolveAuthRetailerId(...sources) ||
    state.merchant.retailerId ||
    undefined;

  // Backend validates retailerId/id as UUID — never send RET000003 display codes
  const retailerId =
    candidate &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      candidate
    )
      ? candidate
      : undefined;

  return {
    retailerId,
    outletId: request.outletId || state.merchant.outletId || undefined,
    spKey: request.spKey || state.merchant.spKey || undefined,
  };
}

export const loadMerchantBiometricStatus = createAsyncThunk(
  "merchant/loadStatus",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as MerchantThunkState;
      return await fetchMerchantStatus(buildBiometricStatusRequest(state));
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unable to fetch merchant status."
      );
    }
  }
);

export const submitMerchantBiometricVerification = createAsyncThunk(
  "merchant/submitBiometric",
  async (pidData: string, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as MerchantThunkState;

      await dispatch(fetchProfile());

      let statusPayload = null;
      const freshState = getState() as MerchantThunkState;
      const statusRequest = buildBiometricStatusRequest(freshState);

      try {
        statusPayload = await fetchMerchantBiometricStatus(statusRequest);
      } catch {
        statusPayload = null;
      }

      const latestState = getState() as MerchantThunkState;
      const refs = extractMerchantReferenceDetails(
        statusPayload?.raw,
        statusPayload,
        ...merchantSources(latestState)
      );

      const candidate =
        resolveAuthRetailerId(...merchantSources(latestState)) ||
        statusRequest.retailerId ||
        refs.retailerId;

      const retailerId =
        candidate &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          String(candidate)
        )
          ? String(candidate)
          : "";

      if (!retailerId) {
        return rejectWithValue(
          "Retailer UUID not found. Please logout and login again."
        );
      }

      if (!hasRequiredBiometricReferences(refs)) {
        return rejectWithValue(formatMissingReferenceError(refs));
      }

      const payload: SubmitBiometricKycRequest = {
        retailerId,
        outletId: refs.outletId || statusRequest.outletId,
        biometricData: pidData,
        referenceKey: refs.referenceKey!,
        referenceKeyType: refs.referenceKeyType!,
        spKey: refs.spKey || statusRequest.spKey,
        pidOptionWadh: refs.pidOptionWadh,
      };

      const result = await submitMerchantBiometricKyc(payload);

      if (!result.success) {
        return rejectWithValue(result.message || "Biometric verification failed.");
      }

      // Re-fetch biometric-status so UI follows InstantPay truth (APPROVAL_PENDING / APPROVED)
      await dispatch(loadMerchantBiometricStatus());
      const after = getState() as MerchantThunkState;

      return {
        ...result,
        isVerified: after.merchant.isVerified,
        isPendingApproval: after.merchant.isPendingApproval,
        biometricStatus: after.merchant.biometricStatus,
        action: after.merchant.action ?? result.action,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Biometric verification failed."
      );
    }
  }
);
