"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Dmt2Beneficiary,
  Dmt2Retailer,
  Dmt2Step,
  Dmt2Transaction,
  Dmt2TransferDraft,
} from "../types";

const emptyRetailer: Dmt2Retailer = {
  mobile: "",
  fullName: "",
  gender: "",
  otpVerified: false,
  registered: false,
};

const emptyTransfer: Dmt2TransferDraft = {
  amount: 0,
  mode: "IMPS",
  purpose: "",
  referenceId: "",
};

interface Dmt2State {
  retailer: Dmt2Retailer;
  knownRetailers: Record<string, Dmt2Retailer>;
  beneficiaries: Dmt2Beneficiary[];
  selectedBeneficiaryId: string | null;
  transfer: Dmt2TransferDraft;
  lastTxn: Dmt2Transaction | null;
  lastTxnId: string | null;
  step: Dmt2Step;
  setStep: (step: Dmt2Step) => void;
  setSearchMobile: (mobile: string) => void;
  markRetailerRegistered: (retailer: Dmt2Retailer) => void;
  markOtpVerified: (patch?: Partial<Dmt2Retailer>) => void;
  setBeneficiaries: (rows: Dmt2Beneficiary[]) => void;
  upsertBeneficiary: (row: Dmt2Beneficiary) => void;
  selectBeneficiary: (id: string | null) => void;
  setTransfer: (patch: Partial<Dmt2TransferDraft>) => void;
  setLastTransaction: (txn: Dmt2Transaction | null) => void;
  getSelectedBeneficiary: () => Dmt2Beneficiary | null;
  resetFlow: () => void;
}

export const useDmt2Store = create<Dmt2State>()(
  persist(
    (set, get) => ({
      retailer: emptyRetailer,
      knownRetailers: {},
      beneficiaries: [],
      selectedBeneficiaryId: null,
      transfer: emptyTransfer,
      lastTxn: null,
      lastTxnId: null,
      step: "search",

      setStep: (step) => set({ step }),

      setSearchMobile: (mobile) =>
        set((state) => {
          const known = state.knownRetailers[mobile];
          return {
            retailer: known ? { ...known, mobile } : { ...emptyRetailer, mobile },
            selectedBeneficiaryId: null,
            transfer: emptyTransfer,
            lastTxn: null,
            lastTxnId: null,
            beneficiaries: [],
          };
        }),

      markRetailerRegistered: (retailer) =>
        set((state) => ({
          retailer: { ...retailer, registered: true },
          knownRetailers: {
            ...state.knownRetailers,
            [retailer.mobile]: { ...retailer, registered: true },
          },
        })),

      markOtpVerified: (patch) =>
        set((state) => {
          const retailer = {
            ...state.retailer,
            ...patch,
            otpVerified: true,
            registered: true,
          };
          return {
            retailer,
            knownRetailers: {
              ...state.knownRetailers,
              [retailer.mobile]: retailer,
            },
          };
        }),

      setBeneficiaries: (rows) => set({ beneficiaries: rows }),

      upsertBeneficiary: (row) =>
        set((state) => {
          const rest = state.beneficiaries.filter((item) => item.id !== row.id);
          return {
            beneficiaries: [row, ...rest],
            selectedBeneficiaryId: row.id,
          };
        }),

      selectBeneficiary: (id) => set({ selectedBeneficiaryId: id }),

      setTransfer: (patch) =>
        set((state) => ({ transfer: { ...state.transfer, ...patch } })),

      setLastTransaction: (txn) =>
        set({ lastTxn: txn, lastTxnId: txn?.id ?? null }),

      getSelectedBeneficiary: () => {
        const { beneficiaries, selectedBeneficiaryId } = get();
        return beneficiaries.find((b) => b.id === selectedBeneficiaryId) ?? null;
      },

      resetFlow: () =>
        set({
          retailer: emptyRetailer,
          selectedBeneficiaryId: null,
          transfer: emptyTransfer,
          lastTxn: null,
          lastTxnId: null,
          step: "search",
        }),
    }),
    {
      name: "paytrue-dmt2-storage",
      partialize: (state) => ({
        retailer: state.retailer,
        knownRetailers: state.knownRetailers,
        selectedBeneficiaryId: state.selectedBeneficiaryId,
        transfer: state.transfer,
        lastTxn: state.lastTxn,
        lastTxnId: state.lastTxnId,
        step: state.step,
      }),
    }
  )
);
