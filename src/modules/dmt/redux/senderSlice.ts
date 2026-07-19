import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DmtSender } from "../types";

export type EkycReferenceKeySource =
  | ""
  | "verify-otp"
  | "check-remitter"
  | "pid-options"
  | "manual";

interface SenderState {
  mobile: string;
  /**
   * Workflow referenceKey (register / OTP request). May differ from eKYC key.
   */
  referenceKey: string;
  /**
   * True only after remitter verify-otp succeeds.
   * Bio/eKYC must not open until this is true.
   */
  otpVerified: boolean;
  /**
   * Active eKYC materials. After verify-otp, `ekycReferenceKey` is locked to the
   * verify response and must NOT be replaced by later checkRemitter RNF keys.
   */
  ekycMobile: string;
  ekycReferenceKey: string;
  /** Where ekycReferenceKey came from — "verify-otp" is authoritative for RD/eKYC */
  ekycReferenceKeySource: EkycReferenceKeySource;
  /** Full PidOptions XML for RD Service */
  pidOptions: string;
  pidOptionWadh: string;
  profile: DmtSender | null;
}

const initialState: SenderState = {
  mobile: "",
  referenceKey: "",
  otpVerified: false,
  ekycMobile: "",
  ekycReferenceKey: "",
  ekycReferenceKeySource: "",
  pidOptions: "",
  pidOptionWadh: "",
  profile: null,
};

function logIgnoringCheckRemitterKey(oldVerifyKey: string, incomingKey: string) {
  // eslint-disable-next-line no-console -- InstantPay eKYC referenceKey debug
  console.log("WARNING:");
  // eslint-disable-next-line no-console
  console.log(
    "Ignoring checkRemitter referenceKey because verify referenceKey already exists."
  );
  // eslint-disable-next-line no-console
  console.log("");
  // eslint-disable-next-line no-console
  console.log("Old Verify Key:", oldVerifyKey);
  // eslint-disable-next-line no-console
  console.log("Incoming RNF Key:", incomingKey);
}

const senderSlice = createSlice({
  name: "dmtSender",
  initialState,
  reducers: {
    setSenderMobile(state, action: PayloadAction<string>) {
      state.mobile = action.payload;
      // New mobile search — OTP not verified yet
      state.otpVerified = false;
    },
    setSenderReferenceKey(state, action: PayloadAction<string>) {
      const value = String(action.payload || "").trim();
      if (value) state.referenceKey = value;
    },
    clearSenderReferenceKey(state) {
      state.referenceKey = "";
    },
    setOtpVerified(state, action: PayloadAction<boolean>) {
      state.otpVerified = Boolean(action.payload);
    },
    /**
     * Lock the verify-otp referenceKey as the active eKYC key.
     * Later checkRemitter RNF keys must not replace this.
     */
    setVerifyOtpEkycReferenceKey(
      state,
      action: PayloadAction<{ mobile: string; referenceKey: string }>
    ) {
      const mobile = String(action.payload.mobile || "").trim();
      const referenceKey = String(action.payload.referenceKey || "").trim();
      if (!mobile || !referenceKey) return;

      state.ekycMobile = mobile;
      state.ekycReferenceKey = referenceKey;
      state.ekycReferenceKeySource = "verify-otp";
      state.referenceKey = referenceKey;
      state.otpVerified = true;

      // eslint-disable-next-line no-console -- InstantPay eKYC referenceKey debug
      console.log("==================================");
      // eslint-disable-next-line no-console
      console.log("VERIFY OTP REFERENCE KEY");
      // eslint-disable-next-line no-console
      console.log("==================================");
      // eslint-disable-next-line no-console
      console.log("Saved Key:", referenceKey);
      // eslint-disable-next-line no-console
      console.log("Source: verify-otp");
      // eslint-disable-next-line no-console
      console.log("==================================");
    },
    /**
     * Update eKYC pidOptions / wadh.
     * If a verify-otp referenceKey is already locked, keep it and only refresh
     * biometric materials (never overwrite with checkRemitter RNF key).
     */
    setEkycPidOptions(
      state,
      action: PayloadAction<{
        mobile: string;
        referenceKey: string;
        pidOptions: string;
        pidOptionWadh?: string;
        force?: boolean;
        source?: EkycReferenceKeySource;
      }>
    ) {
      const mobile = String(action.payload.mobile || "").trim();
      const incomingKey = String(action.payload.referenceKey || "").trim();
      const pidOptions = String(action.payload.pidOptions || "").trim();
      const pidOptionWadh = String(action.payload.pidOptionWadh || "").trim();
      const source = action.payload.source || "check-remitter";

      if (!mobile || !pidOptions) return;

      const verifyLocked =
        state.ekycReferenceKeySource === "verify-otp" &&
        Boolean(state.ekycReferenceKey);

      if (verifyLocked) {
        if (incomingKey && incomingKey !== state.ekycReferenceKey) {
          logIgnoringCheckRemitterKey(state.ekycReferenceKey, incomingKey);
        }
        state.ekycMobile = mobile;
        state.pidOptions = pidOptions;
        if (pidOptionWadh) state.pidOptionWadh = pidOptionWadh;
        // Keep ekycReferenceKey + source from verify-otp
        state.referenceKey = state.ekycReferenceKey;
        return;
      }

      if (!incomingKey) return;

      const sameSession =
        state.ekycMobile === mobile &&
        Boolean(state.ekycReferenceKey) &&
        Boolean(state.pidOptions);

      if (sameSession && !action.payload.force) {
        return;
      }

      state.ekycMobile = mobile;
      state.ekycReferenceKey = incomingKey;
      state.ekycReferenceKeySource = source;
      state.pidOptions = pidOptions;
      state.referenceKey = incomingKey;
      if (pidOptionWadh) state.pidOptionWadh = pidOptionWadh;
    },
    clearEkycSession(state) {
      state.ekycMobile = "";
      state.ekycReferenceKey = "";
      state.ekycReferenceKeySource = "";
      state.pidOptions = "";
      state.pidOptionWadh = "";
      state.referenceKey = "";
      state.otpVerified = false;
    },
    setSenderPidOptionWadh(state, action: PayloadAction<string>) {
      const value = String(action.payload || "").trim();
      if (value) state.pidOptionWadh = value;
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
  clearSenderReferenceKey,
  setOtpVerified,
  setVerifyOtpEkycReferenceKey,
  setEkycPidOptions,
  clearEkycSession,
  setSenderPidOptionWadh,
  setSenderProfile,
  resetSenderState,
} = senderSlice.actions;

export const selectDmtEkycSession = (state: { dmtSender: SenderState }) => ({
  mobile: state.dmtSender.ekycMobile,
  referenceKey: state.dmtSender.ekycReferenceKey,
  referenceKeySource: state.dmtSender.ekycReferenceKeySource,
  pidOptions: state.dmtSender.pidOptions,
  pidOptionWadh: state.dmtSender.pidOptionWadh,
  isActive: Boolean(
    state.dmtSender.ekycReferenceKey && state.dmtSender.pidOptions
  ),
  isVerifyOtpLocked: state.dmtSender.ekycReferenceKeySource === "verify-otp",
});

export const selectDmtSenderPidOptionWadh = (state: {
  dmtSender: SenderState;
}) => state.dmtSender.pidOptionWadh;

export const selectDmtEkycReferenceKey = (state: {
  dmtSender: SenderState;
}) => state.dmtSender.ekycReferenceKey;

export default senderSlice.reducer;
