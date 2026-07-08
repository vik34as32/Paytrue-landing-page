import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DmtBeneficiary } from "../types";

interface BeneficiaryState {
  list: DmtBeneficiary[];
  selected: DmtBeneficiary | null;
  pendingBeneficiaryId: string;
  pendingReferenceKey: string;
}

const initialState: BeneficiaryState = {
  list: [],
  selected: null,
  pendingBeneficiaryId: "",
  pendingReferenceKey: "",
};

const beneficiarySlice = createSlice({
  name: "dmtBeneficiary",
  initialState,
  reducers: {
    setBeneficiaries(state, action: PayloadAction<DmtBeneficiary[]>) {
      state.list = action.payload;
    },
    setSelectedBeneficiary(state, action: PayloadAction<DmtBeneficiary | null>) {
      state.selected = action.payload;
    },
    setPendingBeneficiary(
      state,
      action: PayloadAction<{ id: string; referenceKey?: string }>
    ) {
      state.pendingBeneficiaryId = action.payload.id;
      state.pendingReferenceKey = action.payload.referenceKey ?? "";
    },
    resetBeneficiaryState() {
      return initialState;
    },
  },
});

export const {
  setBeneficiaries,
  setSelectedBeneficiary,
  setPendingBeneficiary,
  resetBeneficiaryState,
} = beneficiarySlice.actions;

export default beneficiarySlice.reducer;
