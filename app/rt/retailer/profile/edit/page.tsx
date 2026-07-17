"use client";

import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/src/redux/types";
import { selectUser } from "@/src/redux/slices/authSlice";
import {
  selectProfile,
  selectProfileEditError,
  selectProfileEditLoading,
  selectProfileEditUser,
} from "@/src/redux/slices/profileSlice";
import {
  fetchProfile,
  getUserById,
} from "@/src/redux/thunks/profileThunk";
import PageLoader from "@/src/components/common/PageLoader";
import RetailerMultiStepForm from "@/src/components/retailers/RetailerMultiStepForm";

function resolveEditableUserId(
  user: Record<string, unknown> | null | undefined
): string | null {
  if (!user) return null;
  for (const value of [user._id, user.id]) {
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return null;
}

export default function RetailerEditProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useSelector(selectUser) as Record<string, unknown> | null;
  const profile = useSelector(selectProfile) as Record<string, unknown> | null;
  const editUser = useSelector(selectProfileEditUser) as Record<
    string,
    unknown
  > | null;
  const loading = useSelector(selectProfileEditLoading);
  const error = useSelector(selectProfileEditError);

  const userId = useMemo(
    () =>
      resolveEditableUserId(authUser) ||
      resolveEditableUserId(profile) ||
      resolveEditableUserId(editUser),
    [authUser, profile, editUser]
  );

  useEffect(() => {
    if (!userId) {
      dispatch(fetchProfile());
      return;
    }
    dispatch(getUserById(userId));
  }, [dispatch, userId]);

  if (!userId || (loading && !editUser)) {
    return <PageLoader message="Loading profile for edit..." />;
  }

  if (error && !editUser) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {String(error)}
      </div>
    );
  }

  return (
    <RetailerMultiStepForm
      mode="edit"
      userId={userId}
      initialUser={editUser || profile || authUser}
      title="Edit Profile"
      description="Update outlet, KYC documents and bank details. Identity fields stay locked."
      backHref="/rt/retailer/profile"
      successRedirect="/rt/retailer/profile"
      lockIdentityFields
      forceCurrentLocation
      hidePassword
    />
  );
}
