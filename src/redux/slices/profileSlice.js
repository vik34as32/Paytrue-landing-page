import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProfile,
  getUserById,
  updateUser,
} from "@/src/redux/thunks/profileThunk";
import { logoutUser } from "@/src/redux/thunks/authThunk";

const initialState = {
  data: null,
  editUser: null,
  formValues: null,
  loading: false,
  editLoading: false,
  updating: false,
  error: null,
  editError: null,
  updateError: null,
  updateSuccess: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
      state.editError = null;
      state.updateError = null;
    },
    clearUpdateSuccess(state) {
      state.updateSuccess = false;
    },
    clearProfile(state) {
      state.data = null;
      state.editUser = null;
      state.formValues = null;
      state.error = null;
      state.editError = null;
      state.updateError = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getUserById.pending, (state) => {
        state.editLoading = true;
        state.editError = null;
        state.updateSuccess = false;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.editLoading = false;
        state.editUser = action.payload.user;
        state.formValues = action.payload.formValues;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.editLoading = false;
        state.editError = action.payload;
      })
      .addCase(updateUser.pending, (state) => {
        state.updating = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updating = false;
        state.updateSuccess = true;
        state.editUser = action.payload.user;
        state.formValues = action.payload.formValues;
        state.data = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
        state.updateSuccess = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState);
      });
  },
});

export const { clearProfileError, clearUpdateSuccess, clearProfile } =
  profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = (state) => state.profile.data;
export const selectProfileLoading = (state) => state.profile.loading;
export const selectProfileError = (state) => state.profile.error;
export const selectProfileEditUser = (state) => state.profile.editUser;
export const selectProfileFormValues = (state) => state.profile.formValues;
export const selectProfileEditLoading = (state) => state.profile.editLoading;
export const selectProfileEditError = (state) => state.profile.editError;
export const selectProfileUpdating = (state) => state.profile.updating;
export const selectProfileUpdateError = (state) => state.profile.updateError;
export const selectProfileUpdateSuccess = (state) => state.profile.updateSuccess;
