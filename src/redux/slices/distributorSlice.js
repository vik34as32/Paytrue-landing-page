import { createSlice } from "@reduxjs/toolkit";

import {

  fetchDistributors,

  createDistributor,

  updateDistributor,

  toggleDistributorStatus,

  deleteDistributor,

} from "@/src/redux/thunks/distributorThunk";



const initialState = {

  list: [],

  total: 0,

  page: 1,

  limit: 10,

  search: "",

  sortBy: "createdAt",

  sortOrder: "desc",

  selected: null,

  loading: false,

  error: null,

  actionLoading: false,

};



const distributorSlice = createSlice({

  name: "distributor",

  initialState,

  reducers: {

    setSelectedDistributor(state, action) {

      state.selected = action.payload;

    },

    setDistributorList(state, action) {

      state.list = action.payload;

    },

    setDistributorQuery(state, action) {

      Object.assign(state, action.payload);

    },

    clearDistributorError(state) {

      state.error = null;

    },

  },

  extraReducers: (builder) => {

    builder

      .addCase(fetchDistributors.pending, (state) => {

        state.loading = true;

        state.error = null;

      })

      .addCase(fetchDistributors.fulfilled, (state, action) => {

        state.loading = false;

        state.list = action.payload.list;

        state.total = action.payload.total;

        state.page = action.payload.page;

        state.limit = action.payload.limit;

      })

      .addCase(fetchDistributors.rejected, (state, action) => {

        state.loading = false;

        state.error = action.payload;

      })

      .addCase(createDistributor.pending, (state) => {

        state.actionLoading = true;

        state.error = null;

      })

      .addCase(createDistributor.fulfilled, (state, action) => {

        state.actionLoading = false;

        state.list.unshift(action.payload);

        state.total += 1;

      })

      .addCase(createDistributor.rejected, (state, action) => {

        state.actionLoading = false;

        state.error = action.payload;

      })

      .addCase(updateDistributor.pending, (state) => {

        state.actionLoading = true;

        state.error = null;

      })

      .addCase(updateDistributor.fulfilled, (state, action) => {

        state.actionLoading = false;

        const index = state.list.findIndex((d) => d.id === action.payload.id);

        if (index !== -1) state.list[index] = action.payload;

      })

      .addCase(updateDistributor.rejected, (state, action) => {

        state.actionLoading = false;

        state.error = action.payload;

      })

      .addCase(toggleDistributorStatus.pending, (state) => {

        state.actionLoading = true;

      })

      .addCase(toggleDistributorStatus.fulfilled, (state, action) => {

        state.actionLoading = false;

        const index = state.list.findIndex((d) => d.id === action.payload.id);

        if (index !== -1) state.list[index] = action.payload;

      })

      .addCase(toggleDistributorStatus.rejected, (state, action) => {

        state.actionLoading = false;

        state.error = action.payload;

      })

      .addCase(deleteDistributor.pending, (state) => {

        state.actionLoading = true;

      })

      .addCase(deleteDistributor.fulfilled, (state, action) => {

        state.actionLoading = false;

        state.list = state.list.filter((d) => d.id !== action.payload);

        state.total = Math.max(0, state.total - 1);

      })

      .addCase(deleteDistributor.rejected, (state, action) => {

        state.actionLoading = false;

        state.error = action.payload;

      });

  },

});



export const {

  setSelectedDistributor,

  setDistributorList,

  setDistributorQuery,

  clearDistributorError,

} = distributorSlice.actions;



export default distributorSlice.reducer;



export const selectDistributors = (state) => state.distributor.list;

export const selectDistributorTotal = (state) => state.distributor.total;

export const selectDistributorPage = (state) => state.distributor.page;

export const selectDistributorLimit = (state) => state.distributor.limit;

export const selectDistributorQuery = (state) => ({

  page: state.distributor.page,

  limit: state.distributor.limit,

  search: state.distributor.search,

  sortBy: state.distributor.sortBy,

  sortOrder: state.distributor.sortOrder,

});

export const selectDistributorLoading = (state) => state.distributor.loading;

export const selectDistributorActionLoading = (state) =>

  state.distributor.actionLoading;

export const selectSelectedDistributor = (state) => state.distributor.selected;

export const selectDistributorError = (state) => state.distributor.error;

