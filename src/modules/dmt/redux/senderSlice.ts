import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DmtSender } from "../types";

interface SenderState {
  mobile: string;
  referenceKey: string;
  profile: DmtSender | null;
}

const initialState: SenderState = {
  mobile: "",
  referenceKey: "",
  profile: null,
};

const senderSlice = createSlice({
  name: "dmtSender",
  initialState,
  reducers: {
    setSenderMobile(state, action: PayloadAction<string>) {
      state.mobile = action.payload;
    },
    setSenderReferenceKey(state, action: PayloadAction<string>) {
      state.referenceKey = action.payload;
    },
    setSenderProfile(state, action: PayloadAction<DmtSender | null>) {
      state.profile = action.payload;
      if (action.payload?.mobile) state.mobile = action.payload.mobile;
    },
    resetSenderState() {
      return initialState;
    },
  },
});

export const {
  setSenderMobile,
  setSenderReferenceKey,
  setSenderProfile,
  resetSenderState,
} = senderSlice.actions;

export default senderSlice.reducer;
