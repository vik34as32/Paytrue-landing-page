import { createSlice } from "@reduxjs/toolkit";
import { retailers as mockRetailers } from "@/src/mock/retailerData";
import {
  fetchRetailers,
  createRetailer,
  updateRetailer,
  toggleRetailerStatus,
} from "@/src/redux/thunks/retailerThunk";

const initialState = {
  list: mockRetailers,
  selected: null,
  loading: false,
  error: null,
  actionLoading: false,
};

const retailerSlice = createSlice({
  name: "retailer",
  initialState,
  reducers: {
    setSelectedRetailer(state, action) {
      state.selected = action.payload;
    },
    setRetailerList(state, action) {
      state.list = action.payload;
    },
    clearRetailerError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRetailers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRetailers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list || action.payload;
      })
      .addCase(fetchRetailers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRetailer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createRetailer.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createRetailer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(updateRetailer.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateRetailer.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(updateRetailer.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      .addCase(toggleRetailerStatus.pending, (state) => {
        state.actionLoading = true;
      })
      .addCase(toggleRetailerStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) state.list[index] = action.payload;
      })
      .addCase(toggleRetailerStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedRetailer, setRetailerList, clearRetailerError } =
  retailerSlice.actions;

export default retailerSlice.reducer;

export const selectRetailers = (state) => state.retailer.list;
export const selectRetailerLoading = (state) => state.retailer.loading;
export const selectRetailerActionLoading = (state) =>
  state.retailer.actionLoading;
export const selectSelectedRetailer = (state) => state.retailer.selected;
