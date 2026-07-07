import { createSlice } from "@reduxjs/toolkit";
import {
  loadMerchantBiometricStatus,
  submitMerchantBiometricVerification,
} from "@/src/redux/thunks/merchantThunk";
import type { BiometricStatusValue, VerificationPhase } from "@/src/types/merchant";

interface MerchantState {
  statusLoading: boolean;
  biometricStatus: BiometricStatusValue;
  isVerified: boolean;
  modalOpen: boolean;
  verificationPhase: VerificationPhase;
  error: string | null;
  retailerId: string | null;
  referenceKey: string | null;
  referenceKeyType: string | null;
  spKey: string | null;
  pidOptionWadh: string | null;
  outletId: string | null;
  statusChecked: boolean;
  raw: Record<string, unknown> | null;
}

const initialState: MerchantState = {
  statusLoading: false,
  biometricStatus: "PENDING",
  isVerified: false,
  modalOpen: false,
  verificationPhase: "idle",
  error: null,
  retailerId: null,
  referenceKey: null,
  referenceKeyType: null,
  spKey: null,
  pidOptionWadh: null,
  outletId: null,
  statusChecked: false,
  raw: null,
};

const merchantSlice = createSlice({
  name: "merchant",
  initialState,
  reducers: {
    clearMerchantError(state) {
      state.error = null;
      if (state.verificationPhase === "error") {
        state.verificationPhase = "idle";
      }
    },
    resetMerchantVerification(state) {
      state.verificationPhase = "idle";
      state.error = null;
    },
    setVerificationPhase(state, action: { payload: MerchantState["verificationPhase"] }) {
      state.verificationPhase = action.payload;
    },
    closeBiometricModal(state) {
      state.modalOpen = false;
      state.verificationPhase = "idle";
      state.error = null;
    },
    openBiometricModal(state) {
      if (!state.isVerified) {
        state.modalOpen = true;
        state.error = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadMerchantBiometricStatus.pending, (state) => {
        state.statusLoading = true;
        state.error = null;
      })
      .addCase(loadMerchantBiometricStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.statusChecked = true;
        state.biometricStatus = action.payload.biometricStatus;
        state.isVerified = action.payload.isVerified;
        state.retailerId = action.payload.retailerId ?? state.retailerId;
        state.outletId = action.payload.outletId ?? state.outletId;
        state.referenceKey = action.payload.referenceKey ?? state.referenceKey;
        state.referenceKeyType =
          action.payload.referenceKeyType ?? state.referenceKeyType;
        state.spKey = action.payload.spKey ?? state.spKey;
        state.pidOptionWadh = action.payload.pidOptionWadh ?? state.pidOptionWadh;
        state.raw = action.payload.raw ?? state.raw;
        if (action.payload.isVerified) {
          state.verificationPhase = "idle";
          state.modalOpen = false;
        }
      })
      .addCase(loadMerchantBiometricStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusChecked = true;
        state.error =
          (action.payload as string) || "Unable to verify merchant biometric status.";
        state.isVerified = false;
        state.biometricStatus = "PENDING";
      })
      .addCase(submitMerchantBiometricVerification.pending, (state) => {
        state.verificationPhase = "verifying";
        state.error = null;
      })
      .addCase(submitMerchantBiometricVerification.fulfilled, (state, action) => {
        state.verificationPhase = "success";
        state.biometricStatus = action.payload.biometricStatus;
        state.isVerified = true;
        state.modalOpen = false;
        state.error = null;
      })
      .addCase(submitMerchantBiometricVerification.rejected, (state, action) => {
        state.verificationPhase = "error";
        state.error =
          (action.payload as string) || "Biometric verification failed.";
      });
  },
});

export const {
  clearMerchantError,
  resetMerchantVerification,
  setVerificationPhase,
  closeBiometricModal,
  openBiometricModal,
} = merchantSlice.actions;

export const selectMerchantStatusLoading = (state: { merchant: MerchantState }) =>
  state.merchant.statusLoading;
export const selectMerchantModalOpen = (state: { merchant: MerchantState }) =>
  state.merchant.modalOpen;
export const selectMerchantVerificationPhase = (state: { merchant: MerchantState }) =>
  state.merchant.verificationPhase;
export const selectMerchantError = (state: { merchant: MerchantState }) =>
  state.merchant.error;
export const selectMerchantBiometricStatus = (state: { merchant: MerchantState }) =>
  state.merchant.biometricStatus;
export const selectMerchantIsVerified = (state: { merchant: MerchantState }) =>
  state.merchant.isVerified;
export const selectMerchantNeedsBiometric = (state: { merchant: MerchantState }) =>
  state.merchant.statusChecked && !state.merchant.isVerified;

export const selectMerchantStatusChecked = (state: { merchant: MerchantState }) =>
  state.merchant.statusChecked;

export const selectMerchantPidOptionWadh = (state: { merchant: MerchantState }) =>
  state.merchant.pidOptionWadh;

export default merchantSlice.reducer;
