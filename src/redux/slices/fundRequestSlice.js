import { createSlice } from "@reduxjs/toolkit";
import {
  mdFundRequests,
  ddFundRequests,
  retailerFundRequests,
} from "@/src/mock/fundRequestData";
import {
  fetchMdFundRequests,
  fetchDdFundRequests,
  fetchRetailerFundRequests,
  submitMdFundRequest,
  submitDdFundRequest,
  approveRetailerFundRequest,
  rejectRetailerFundRequest,
} from "@/src/redux/thunks/fundRequestThunk";

const initialState = {
  mdRequests: mdFundRequests,
  ddRequests: ddFundRequests,
  retailerRequests: retailerFundRequests,
  loading: false,
  error: null,
  actionLoading: false,
};

const fundRequestSlice = createSlice({
  name: "fundRequest",
  initialState,
  reducers: {
    clearFundRequestError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMdFundRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMdFundRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.mdRequests = action.payload;
      })
      .addCase(fetchMdFundRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDdFundRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDdFundRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.ddRequests = action.payload;
      })
      .addCase(fetchDdFundRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRetailerFundRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRetailerFundRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.retailerRequests = action.payload;
      })
      .addCase(fetchRetailerFundRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitMdFundRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(submitMdFundRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.mdRequests.unshift(action.payload);
      })
      .addCase(submitMdFundRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(submitDdFundRequest.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(submitDdFundRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.ddRequests.unshift(action.payload);
      })
      .addCase(submitDdFundRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(approveRetailerFundRequest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(approveRetailerFundRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.retailerRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) state.retailerRequests[index] = action.payload;
      })
      .addCase(approveRetailerFundRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(rejectRetailerFundRequest.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(rejectRetailerFundRequest.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.retailerRequests.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) state.retailerRequests[index] = action.payload;
      })
      .addCase(rejectRetailerFundRequest.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFundRequestError } = fundRequestSlice.actions;
export default fundRequestSlice.reducer;

export const selectMdFundRequests = (state) => state.fundRequest.mdRequests;
export const selectDdFundRequests = (state) => state.fundRequest.ddRequests;
export const selectRetailerFundRequests = (state) =>
  state.fundRequest.retailerRequests;
export const selectFundRequestLoading = (state) => state.fundRequest.loading;
export const selectFundRequestActionLoading = (state) =>
  state.fundRequest.actionLoading;
