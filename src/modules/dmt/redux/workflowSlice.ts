import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DmtNextAction, DmtWorkflowResponse } from "../types";
import { nextActionToStep } from "../services/normalizers";

export type DmtDialog =
  | "none"
  | "register"
  | "otp"
  | "addBeneficiary"
  | "beneficiaryOtp"
  | "deleteBeneficiary"
  | "transactionOtp"
  | "success"
  | "failed";

interface WorkflowState {
  nextAction: DmtNextAction | null;
  activeStep: number;
  loadingCount: number;
  error: string | null;
  snackbar: { open: boolean; message: string; severity: "success" | "error" | "info" };
  activeDialog: DmtDialog;
  otpContext: "sender" | "beneficiary" | "transaction" | "delete";
}

const initialState: WorkflowState = {
  nextAction: null,
  activeStep: 0,
  loadingCount: 0,
  error: null,
  snackbar: { open: false, message: "", severity: "info" },
  activeDialog: "none",
  otpContext: "sender",
};

function dialogForAction(action: DmtNextAction): DmtDialog {
  switch (action) {
    case "REGISTER":
      return "register";
    case "VERIFY_OTP":
      return "otp";
    case "ADD_BENEFICIARY":
      return "addBeneficiary";
    case "BENEFICIARY_OTP":
      return "beneficiaryOtp";
    case "GENERATE_TRANSACTION_OTP":
      return "transactionOtp";
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "failed";
    default:
      return "none";
  }
}

const workflowSlice = createSlice({
  name: "dmtWorkflow",
  initialState,
  reducers: {
    startLoading(state) {
      state.loadingCount += 1;
    },
    stopLoading(state) {
      state.loadingCount = Math.max(0, state.loadingCount - 1);
    },
    setWorkflowError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      if (action.payload) {
        state.snackbar = { open: true, message: action.payload, severity: "error" };
      }
    },
    showSnackbar(
      state,
      action: PayloadAction<{ message: string; severity?: "success" | "error" | "info" }>
    ) {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity ?? "info",
      };
    },
    hideSnackbar(state) {
      state.snackbar.open = false;
    },
    applyWorkflowResponse(state, action: PayloadAction<DmtWorkflowResponse>) {
      const response = action.payload;
      state.nextAction = response.nextAction;
      state.activeStep = nextActionToStep(response.nextAction);
      state.activeDialog = response.nextAction
        ? dialogForAction(response.nextAction)
        : "none";

      if (response.nextAction === "VERIFY_OTP") state.otpContext = "sender";
      if (response.nextAction === "BENEFICIARY_OTP") state.otpContext = "beneficiary";
      if (response.nextAction === "GENERATE_TRANSACTION_OTP") state.otpContext = "transaction";

      if (response.message && response.success) {
        state.snackbar = {
          open: true,
          message: response.message,
          severity: "success",
        };
      }
    },
    setOtpContext(state, action: PayloadAction<WorkflowState["otpContext"]>) {
      state.otpContext = action.payload;
    },
    openDialog(state, action: PayloadAction<DmtDialog>) {
      state.activeDialog = action.payload;
    },
    closeDialog(state) {
      state.activeDialog = "none";
    },
    resetWorkflowState() {
      return initialState;
    },
  },
});

export const {
  startLoading,
  stopLoading,
  setWorkflowError,
  showSnackbar,
  hideSnackbar,
  applyWorkflowResponse,
  setOtpContext,
  openDialog,
  closeDialog,
  resetWorkflowState,
} = workflowSlice.actions;

export default workflowSlice.reducer;
