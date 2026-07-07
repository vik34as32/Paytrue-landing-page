import { createAsyncThunk } from "@reduxjs/toolkit";
import { aepsDailyLogin } from "@/src/services/aepsService";

export const dailyAepsLogin = createAsyncThunk(
  "aeps/dailyLogin",
  async (payload, { rejectWithValue }) => {
    try {
      return await aepsDailyLogin(payload);
    } catch (error) {
      return rejectWithValue(error.message || "Daily login failed");
    }
  }
);
