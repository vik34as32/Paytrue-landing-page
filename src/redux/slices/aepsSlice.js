import { createSlice } from "@reduxjs/toolkit";
import { isTodayLoginDate } from "@/src/lib/aepsUtils";
import { dailyAepsLogin } from "../thunks/aepsThunk";

const initialState = {
  isDailyLoginComplete: false,
  lastLoginDate: null,
  loginMessage: "",
  agentName: "",
  loading: false,
  error: null,
  selectedDevice: "MANTRA",
  deviceStatus: null,
  scannerInfo: null,
};

const aepsSlice = createSlice({
  name: "aeps",
  initialState,
  reducers: {
    clearAepsError(state) {
      state.error = null;
    },
    resetAepsSession(state) {
      state.isDailyLoginComplete = false;
      state.lastLoginDate = null;
      state.loginMessage = "";
      state.agentName = "";
      state.error = null;
    },
    hydrateAepsLogin(state, action) {
      const { isDailyLoginComplete, lastLoginDate, agentName, loginMessage } =
        action.payload;
      state.isDailyLoginComplete = Boolean(isDailyLoginComplete);
      state.lastLoginDate = lastLoginDate ?? null;
      state.agentName = agentName ?? "";
      state.loginMessage = loginMessage ?? "";
    },
    setSelectedDevice(state, action) {
      state.selectedDevice = action.payload;
      state.deviceStatus = null;
      state.scannerInfo = null;
    },
    hydrateSelectedDevice(state, action) {
      const device = action.payload;
      if (device === "MANTRA" || device === "MORPHO") {
        state.selectedDevice = device;
      }
    },
    setDeviceStatus(state, action) {
      state.deviceStatus = action.payload;
      if (action.payload) {
        state.scannerInfo = {
          model: action.payload.scannerModel || "",
          serial: action.payload.scannerSerialNumber || "",
          rdVersion: action.payload.rdVersion || "",
          provider: action.payload.provider || "",
          baseUrl: action.payload.baseUrl || null,
          deviceType: state.selectedDevice,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(dailyAepsLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(dailyAepsLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isDailyLoginComplete = true;
        state.lastLoginDate = action.payload.loginDate;
        state.loginMessage = action.payload.message;
        state.agentName = action.payload.agentName ?? "";
      })
      .addCase(dailyAepsLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || "Daily login failed";
      });
  },
});

export const {
  clearAepsError,
  resetAepsSession,
  hydrateAepsLogin,
  setSelectedDevice,
  hydrateSelectedDevice,
  setDeviceStatus,
} = aepsSlice.actions;

export const selectAepsSelectedDevice = (state) => state.aeps.selectedDevice;
export const selectAepsDeviceStatus = (state) => state.aeps.deviceStatus;
export const selectAepsScannerInfo = (state) => state.aeps.scannerInfo;
export const selectAepsDailyLoginDone = (state) => {
  const { isDailyLoginComplete, lastLoginDate } = state.aeps;
  return Boolean(isDailyLoginComplete) && isTodayLoginDate(lastLoginDate);
};

export default aepsSlice.reducer;
