import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  mdFundRequests,
  ddFundRequests,
  retailerFundRequests,
} from "@/src/mock/fundRequestData";
import { delay, generateId, generateRequestId } from "@/src/redux/utils";

export const fetchMdFundRequests = createAsyncThunk(
  "fundRequest/fetchMd",
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      // Future API: return (await api.get("/md/fund-requests")).data;
      return [...mdFundRequests];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch fund requests");
    }
  }
);

export const fetchDdFundRequests = createAsyncThunk(
  "fundRequest/fetchDd",
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      // Future API: return (await api.get("/dd/fund-requests")).data;
      return [...ddFundRequests];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch fund requests");
    }
  }
);

export const fetchRetailerFundRequests = createAsyncThunk(
  "fundRequest/fetchRetailer",
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      // Future API: return (await api.get("/dd/retailer-fund-requests")).data;
      return [...retailerFundRequests];
    } catch (error) {
      return rejectWithValue(
        error.message || "Failed to fetch retailer fund requests"
      );
    }
  }
);

export const submitMdFundRequest = createAsyncThunk(
  "fundRequest/submitMd",
  async ({ amount, remark, requestedBy }, { rejectWithValue }) => {
    try {
      await delay(600);
      if (!amount || amount <= 0) {
        return rejectWithValue("Enter a valid amount");
      }
      // Future API: return (await api.post("/md/fund-requests", { amount, remark })).data;
      return {
        id: generateId("fr_md"),
        requestId: generateRequestId("FRMD"),
        amount,
        remark: remark || "",
        status: "pending",
        requestedBy,
        role: "master_distributor",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to submit fund request");
    }
  }
);

export const submitDdFundRequest = createAsyncThunk(
  "fundRequest/submitDd",
  async ({ amount, remark, requestedBy }, { rejectWithValue }) => {
    try {
      await delay(600);
      if (!amount || amount <= 0) {
        return rejectWithValue("Enter a valid amount");
      }
      // Future API: return (await api.post("/dd/fund-requests", { amount, remark })).data;
      return {
        id: generateId("fr_dd"),
        requestId: generateRequestId("FRDD"),
        amount,
        remark: remark || "",
        status: "pending",
        requestedBy,
        role: "distributor",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to submit fund request");
    }
  }
);

export const approveRetailerFundRequest = createAsyncThunk(
  "fundRequest/approveRetailer",
  async (requestId, { getState, rejectWithValue, dispatch }) => {
    try {
      await delay(500);
      const request = getState().fundRequest.retailerRequests.find(
        (r) => r.id === requestId
      );
      if (!request) return rejectWithValue("Fund request not found");
      if (request.status !== "pending") {
        return rejectWithValue("Only pending requests can be approved");
      }

      const ddBalance = getState().wallet.dd.balance;
      if (ddBalance < request.amount) {
        return rejectWithValue("Insufficient wallet balance");
      }

      // Future API: await api.post(`/dd/retailer-fund-requests/${requestId}/approve`);

      const { transferBalanceToRetailer } = await import(
        "@/src/redux/thunks/transactionThunk"
      );

      await dispatch(
        transferBalanceToRetailer({
          retailerId: request.retailerId,
          amount: request.amount,
          remark: `Approved fund request ${request.requestId}`,
          type: "Fund Request Approval",
        })
      ).unwrap();

      return {
        ...request,
        status: "approved",
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(
        typeof error === "string" ? error : error.message || "Approval failed"
      );
    }
  }
);

export const rejectRetailerFundRequest = createAsyncThunk(
  "fundRequest/rejectRetailer",
  async (requestId, { getState, rejectWithValue }) => {
    try {
      await delay(400);
      const request = getState().fundRequest.retailerRequests.find(
        (r) => r.id === requestId
      );
      if (!request) return rejectWithValue("Fund request not found");
      if (request.status !== "pending") {
        return rejectWithValue("Only pending requests can be rejected");
      }
      // Future API: await api.post(`/dd/retailer-fund-requests/${requestId}/reject`);
      return {
        ...request,
        status: "rejected",
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message || "Rejection failed");
    }
  }
);
