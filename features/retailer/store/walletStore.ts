"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WalletTransaction, WalletType } from "@/types/retailer";

const INITIAL_BALANCE = 0;

interface WalletState {
  mainWallet: number;
  retailerWallet: number;
  apiRetailerBalance: number | null;
  transactions: WalletTransaction[];
  setApiRetailerBalance: (balance: number) => void;
  syncRetailerBalanceFromApi: (balance: number) => void;
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
      apiRetailerBalance: null,
      transactions: [],

      setApiRetailerBalance: (balance) => set({ apiRetailerBalance: balance }),

      syncRetailerBalanceFromApi: (balance) =>
        set({ apiRetailerBalance: balance, retailerWallet: balance }),

      getBalance: (walletType = "retailer") => {
        if (walletType === "main") return get().apiRetailerBalance ?? 0;
        return get().apiRetailerBalance ?? 0;
      },

      debit: (amount, description, walletType = "retailer") => {
        const balance = get().apiRetailerBalance ?? 0;

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
            : {
                retailerWallet: newBalance,
                ...(state.apiRetailerBalance !== null
                  ? { apiRetailerBalance: newBalance }
                  : {}),
              }),
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
          apiRetailerBalance: null,
          transactions: [],
        }),
    }),
    {
      name: "retailer-wallet-storage",
      partialize: (state) => ({
        transactions: state.transactions,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted && typeof persisted === "object" ? persisted : {}),
        mainWallet: INITIAL_BALANCE,
        retailerWallet: INITIAL_BALANCE,
        apiRetailerBalance: null,
      }),
    }
  )
);

export const selectRetailerDisplayBalance = (state: WalletState) =>
  state.apiRetailerBalance !== null ? state.apiRetailerBalance : 0;
