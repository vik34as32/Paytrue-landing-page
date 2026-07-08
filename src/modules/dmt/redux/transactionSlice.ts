import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DmtTransaction, DmtTransferMode } from "../types";

interface TransactionDraft {
  amount: number;
  transferMode: DmtTransferMode;
  referenceKey: string;
  otp: string;
  remarks: string;
}

interface TransactionState {
  draft: TransactionDraft;
  result: DmtTransaction | null;
  statusReference: string;
}

const initialState: TransactionState = {
  draft: {
    amount: 0,
    transferMode: "IMPS",
    referenceKey: "",
    otp: "",
    remarks: "",
  },
  result: null,
  statusReference: "",
};

const transactionSlice = createSlice({
  name: "dmtTransaction",
  initialState,
  reducers: {
    setTransactionDraft(state, action: PayloadAction<Partial<TransactionDraft>>) {
      state.draft = { ...state.draft, ...action.payload };
    },
    setTransactionResult(state, action: PayloadAction<DmtTransaction | null>) {
      state.result = action.payload;
      const ref =
        action.payload?.referenceNumber ||
        action.payload?.reference ||
        action.payload?.transactionId;
      if (ref) state.statusReference = ref;
    },
    setStatusReference(state, action: PayloadAction<string>) {
      state.statusReference = action.payload;
    },
    resetTransactionState() {
      return initialState;
    },
  },
});

export const {
  setTransactionDraft,
  setTransactionResult,
  setStatusReference,
  resetTransactionState,
} = transactionSlice.actions;

export default transactionSlice.reducer;
