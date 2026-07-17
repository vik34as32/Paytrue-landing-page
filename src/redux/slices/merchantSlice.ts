import { createSlice } from "@reduxjs/toolkit";
import {
  loadMerchantBiometricStatus,
  submitMerchantBiometricVerification,
} from "@/src/redux/thunks/merchantThunk";
import type {
  BiometricStatusValue,
  MerchantBiometricUiPhase,
  VerificationPhase,
} from "@/src/types/merchant";
import { deriveMerchantBiometricUiPhase } from "@/src/lib/merchantUtils";

interface MerchantState {
  statusLoading: boolean;
  biometricStatus: BiometricStatusValue;
  action: string | null;
  actionRequired: boolean;
  uiPhase: MerchantBiometricUiPhase;
  isVerified: boolean;
  isPendingApproval: boolean;
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
  action: null,
  actionRequired: true,
  uiPhase: "loading",
  isVerified: false,
  isPendingApproval: false,
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

function applyStatusFields(
  state: MerchantState,
  payload: {
    biometricStatus: BiometricStatusValue;
    action?: string;
    actionRequired?: boolean;
    isVerified: boolean;
    isPendingApproval?: boolean;
    uiPhase?: MerchantBiometricUiPhase;
    retailerId?: string;
    outletId?: string;
    referenceKey?: string;
    referenceKeyType?: string;
    spKey?: string;
    pidOptionWadh?: string;
    raw?: Record<string, unknown>;
  }
) {
  state.biometricStatus = payload.biometricStatus;
  state.action = payload.action ?? null;
  state.actionRequired = Boolean(payload.actionRequired);
  state.isVerified = payload.isVerified;
  state.isPendingApproval = Boolean(payload.isPendingApproval);
  state.uiPhase =
    payload.uiPhase ??
    deriveMerchantBiometricUiPhase({
      isVerified: payload.isVerified,
      isPendingApproval: Boolean(payload.isPendingApproval),
      actionRequired: Boolean(payload.actionRequired),
      biometricStatus: payload.biometricStatus,
      action: payload.action,
    });
  state.retailerId = payload.retailerId ?? state.retailerId;
  state.outletId = payload.outletId ?? state.outletId;
  state.referenceKey = payload.referenceKey ?? state.referenceKey;
  state.referenceKeyType = payload.referenceKeyType ?? state.referenceKeyType;
  state.spKey = payload.spKey ?? state.spKey;
  state.pidOptionWadh = payload.pidOptionWadh ?? state.pidOptionWadh;
  state.raw = payload.raw ?? state.raw;
}

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
    setVerificationPhase(
      state,
      action: { payload: MerchantState["verificationPhase"] }
    ) {
      state.verificationPhase = action.payload;
    },
    closeBiometricModal(state) {
      state.modalOpen = false;
      state.verificationPhase = "idle";
      state.error = null;
    },
    openBiometricModal(state) {
      // Only allow capture when InstantPay still requires action
      if (!state.isVerified && !state.isPendingApproval) {
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
        if (!state.statusChecked) {
          state.uiPhase = "loading";
        }
      })
      .addCase(loadMerchantBiometricStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        state.statusChecked = true;
        applyStatusFields(state, action.payload);
        if (action.payload.isVerified) {
          state.verificationPhase = "idle";
          state.modalOpen = false;
        } else if (action.payload.isPendingApproval) {
          state.modalOpen = false;
        }
      })
      .addCase(loadMerchantBiometricStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusChecked = true;
        state.error =
          (action.payload as string) ||
          "Unable to verify merchant biometric status.";
        state.isVerified = false;
        state.isPendingApproval = false;
        state.actionRequired = true;
        state.biometricStatus = "PENDING";
        state.action = "ACTION-REQUIRED";
        state.uiPhase = "action_required";
      })
      .addCase(submitMerchantBiometricVerification.pending, (state) => {
        state.verificationPhase = "verifying";
        state.error = null;
      })
      .addCase(submitMerchantBiometricVerification.fulfilled, (state, action) => {
        state.verificationPhase = action.payload.isPendingApproval
          ? "pending_approval"
          : action.payload.isVerified
            ? "success"
            : "pending_approval";
        applyStatusFields(state, {
          biometricStatus: action.payload.biometricStatus,
          action: action.payload.action,
          actionRequired: Boolean(
            !action.payload.isVerified && !action.payload.isPendingApproval
          ),
          isVerified: Boolean(action.payload.isVerified),
          isPendingApproval: Boolean(action.payload.isPendingApproval),
        });
        state.error = null;
        if (action.payload.isVerified) {
          state.modalOpen = false;
        }
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

export const selectMerchantStatusLoading = (state: {
  merchant: MerchantState;
}) => state.merchant.statusLoading;
export const selectMerchantModalOpen = (state: { merchant: MerchantState }) =>
  state.merchant.modalOpen;
export const selectMerchantVerificationPhase = (state: {
  merchant: MerchantState;
}) => state.merchant.verificationPhase;
export const selectMerchantError = (state: { merchant: MerchantState }) =>
  state.merchant.error;
export const selectMerchantBiometricStatus = (state: {
  merchant: MerchantState;
}) => state.merchant.biometricStatus;
export const selectMerchantAction = (state: { merchant: MerchantState }) =>
  state.merchant.action;
export const selectMerchantUiPhase = (state: { merchant: MerchantState }) =>
  state.merchant.uiPhase;
export const selectMerchantIsVerified = (state: { merchant: MerchantState }) =>
  state.merchant.isVerified;
export const selectMerchantIsPendingApproval = (state: {
  merchant: MerchantState;
}) => state.merchant.isPendingApproval;
export const selectMerchantActionRequired = (state: {
  merchant: MerchantState;
}) => state.merchant.actionRequired;

/** Services locked until InstantPay biometric is APPROVED */
export const selectMerchantServicesEnabled = (state: {
  merchant: MerchantState;
}) => state.merchant.statusChecked && state.merchant.isVerified;

export const selectMerchantNeedsBiometric = (state: {
  merchant: MerchantState;
}) =>
  state.merchant.statusChecked &&
  !state.merchant.isVerified &&
  !state.merchant.isPendingApproval;

export const selectMerchantStatusChecked = (state: {
  merchant: MerchantState;
}) => state.merchant.statusChecked;

export const selectMerchantPidOptionWadh = (state: {
  merchant: MerchantState;
}) => state.merchant.pidOptionWadh;

export default merchantSlice.reducer;
