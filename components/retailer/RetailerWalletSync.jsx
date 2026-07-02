"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useWalletStore } from "@/features/retailer/store/walletStore";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import {
  fetchWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";

export default function RetailerWalletSync() {
  const dispatch = useDispatch();
  const wallet = useSelector(selectRtWallet);
  const syncRetailerBalanceFromApi = useWalletStore(
    (s) => s.syncRetailerBalanceFromApi
  );
  const lastErrorRef = useRef(null);

  useEffect(() => {
    dispatch(fetchWalletBalance({ role: "rt" }));
    dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
  }, [dispatch]);

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
    if (lastErrorRef.current === wallet.error) return;
    lastErrorRef.current = wallet.error;
    toast.error(
      typeof wallet.error === "string"
        ? wallet.error
        : "Failed to fetch wallet balance"
    );
  }, [wallet.loading, wallet.error]);

  return null;
}
