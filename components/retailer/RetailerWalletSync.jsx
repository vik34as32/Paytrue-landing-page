"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useWalletStore } from "@/features/retailer/store/walletStore";
import {
  selectAuthHydrated,
  selectIsAuthenticated,
} from "@/src/redux/slices/authSlice";
import { selectProfileError, selectProfileLoading } from "@/src/redux/slices/profileSlice";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  fetchWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";

export default function RetailerWalletSync() {
  const dispatch = useDispatch();
  const hydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const wallet = useSelector(selectRtWallet);
  const profileLoading = useSelector(selectProfileLoading);
  const profileError = useSelector(selectProfileError);
  const syncRetailerBalanceFromApi = useWalletStore(
    (s) => s.syncRetailerBalanceFromApi
  );
  const lastWalletErrorRef = useRef(null);
  const lastProfileErrorRef = useRef(null);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return;
    dispatch(fetchProfile());
    dispatch(fetchWalletBalance({ role: "rt" }));
    dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
  }, [dispatch, hydrated, isAuthenticated]);

  useEffect(() => {
    if (!wallet.loading && wallet.lastUpdated != null) {
      syncRetailerBalanceFromApi(wallet.availableBalance);
    }
  }, [
    wallet.availableBalance,
    wallet.loading,
    wallet.lastUpdated,
    syncRetailerBalanceFromApi,
  ]);

  useEffect(() => {
    if (wallet.loading || !wallet.error) return;
    if (lastWalletErrorRef.current === wallet.error) return;
    lastWalletErrorRef.current = wallet.error;
    toast.error(
      typeof wallet.error === "string"
        ? wallet.error
        : "Failed to fetch wallet balance"
    );
  }, [wallet.loading, wallet.error]);

  useEffect(() => {
    if (profileLoading || !profileError) return;
    if (lastProfileErrorRef.current === profileError) return;
    lastProfileErrorRef.current = profileError;
    toast.error(
      typeof profileError === "string" ? profileError : "Failed to fetch profile"
    );
  }, [profileLoading, profileError]);

  return null;
}
