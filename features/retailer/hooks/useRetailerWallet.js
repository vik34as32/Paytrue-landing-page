"use client";

import { useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  INSUFFICIENT_BALANCE_MESSAGE,
  refreshRetailerWalletData,
} from "@/features/retailer/utils/walletValidation";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";

export function useRetailerWallet() {
  const wallet = useSelector(selectRtWallet);
  const hasLoaded = wallet.lastUpdated != null;
  const balance = hasLoaded
    ? wallet.availableBalance ?? wallet.currentBalance ?? 0
    : 0;

  const refreshWallet = useCallback(() => {
    refreshRetailerWalletData();
  }, []);

  const validateBalance = useCallback(
    (amount) => {
      const effectiveBalance = hasLoaded
        ? wallet.availableBalance ?? wallet.currentBalance ?? 0
        : 0;
      if (amount <= 0 || effectiveBalance < amount) {
        toast.error(INSUFFICIENT_BALANCE_MESSAGE);
        return false;
      }
      return true;
    },
    [hasLoaded, wallet.availableBalance, wallet.currentBalance]
  );

  return {
    wallet,
    balance,
    currentBalance: hasLoaded ? wallet.currentBalance ?? balance : 0,
    loading: wallet.loading,
    refreshWallet,
    validateBalance,
  };
}
