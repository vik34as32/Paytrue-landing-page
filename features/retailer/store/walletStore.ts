"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WalletTransaction, WalletType } from "@/types/retailer";

const INITIAL_BALANCE = 100000;

interface WalletState {
  mainWallet: number;
  retailerWallet: number;
  transactions: WalletTransaction[];
  debit: (
    amount: number,
    description: string,
    walletType?: WalletType
  ) => boolean;
  credit: (
    amount: number,
    description: string,
    walletType?: WalletType
  ) => void;
  getBalance: (walletType?: WalletType) => number;
  resetWallet: () => void;
}

function createTransaction(
  type: WalletTransaction["type"],
  amount: number,
  description: string,
  balanceAfter: number,
  walletType: WalletType
): WalletTransaction {
  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    type,
    amount,
    description,
    balanceAfter,
    walletType,
    createdAt: new Date().toISOString(),
  };
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      mainWallet: INITIAL_BALANCE,
      retailerWallet: INITIAL_BALANCE,
      transactions: [],

      getBalance: (walletType = "retailer") => {
        return walletType === "main"
          ? get().mainWallet
          : get().retailerWallet;
      },

      debit: (amount, description, walletType = "retailer") => {
        const balance =
          walletType === "main"
            ? get().mainWallet
            : get().retailerWallet;

        if (amount <= 0 || balance < amount) return false;

        const newBalance = balance - amount;
        const transaction = createTransaction(
          "debit",
          amount,
          description,
          newBalance,
          walletType
        );

        set((state) => ({
          ...(walletType === "main"
            ? { mainWallet: newBalance }
            : { retailerWallet: newBalance }),
          transactions: [transaction, ...state.transactions],
        }));

        return true;
      },

      credit: (amount, description, walletType = "retailer") => {
        const balance =
          walletType === "main"
            ? get().mainWallet
            : get().retailerWallet;

        const newBalance = balance + amount;
        const transaction = createTransaction(
          "credit",
          amount,
          description,
          newBalance,
          walletType
        );

        set((state) => ({
          ...(walletType === "main"
            ? { mainWallet: newBalance }
            : { retailerWallet: newBalance }),
          transactions: [transaction, ...state.transactions],
        }));
      },

      resetWallet: () =>
        set({
          mainWallet: INITIAL_BALANCE,
          retailerWallet: INITIAL_BALANCE,
          transactions: [],
        }),
    }),
    {
      name: "retailer-wallet-storage",
    }
  )
);
