"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientTxnId } from "../utils/dmt1.utils";
import type {
  Dmt1Beneficiary,
  Dmt1CommissionPreview,
  Dmt1Remitter,
  Dmt1Step,
  Dmt1Transaction,
  Dmt1TransferDraft,
} from "../types/dmt1.types";

const emptyRemitter: Dmt1Remitter = {
  mobile: "",
  fullName: "",
  email: "",
  otpVerified: false,
  registered: false,
};

const emptyTransfer: Dmt1TransferDraft = {
  beneficiaryId: "",
  amount: 0,
  transferMode: "IMPS",
  remarks: "",
};

interface Dmt1State {
  remitter: Dmt1Remitter;
  knownRemitters: Record<string, Dmt1Remitter>;
  beneficiaries: Dmt1Beneficiary[];
  selectedBeneficiaryId: string | null;
  transfer: Dmt1TransferDraft;
  commission: Dmt1CommissionPreview | null;
  clientTxnId: string | null;
  lastTxn: Dmt1Transaction | null;
  step: Dmt1Step;
  setStep: (step: Dmt1Step) => void;
  setSearchMobile: (mobile: string) => void;
  markRemitterRegistered: (remitter: Dmt1Remitter) => void;
  markOtpVerified: (patch?: Partial<Dmt1Remitter>) => void;
  setBeneficiaries: (rows: Dmt1Beneficiary[]) => void;
  upsertBeneficiary: (row: Dmt1Beneficiary) => void;
  selectBeneficiary: (id: string | null) => void;
  setTransfer: (patch: Partial<Dmt1TransferDraft>) => void;
  setCommission: (preview: Dmt1CommissionPreview | null) => void;
  ensureClientTxnId: () => string;
  setLastTransaction: (txn: Dmt1Transaction | null) => void;
  getSelectedBeneficiary: () => Dmt1Beneficiary | null;
  resetTransferFlow: () => void;
}

export const useDmt1Store = create<Dmt1State>()(
  persist(
    (set, get) => ({
      remitter: emptyRemitter,
      knownRemitters: {},
      beneficiaries: [],
      selectedBeneficiaryId: null,
      transfer: emptyTransfer,
      commission: null,
      clientTxnId: null,
      lastTxn: null,
      step: "search",

      setStep: (step) => set({ step }),

      setSearchMobile: (mobile) =>
        set((state) => {
          const known = state.knownRemitters[mobile];
          return {
            remitter: known ? { ...known, mobile } : { ...emptyRemitter, mobile },
            selectedBeneficiaryId: null,
            transfer: emptyTransfer,
            commission: null,
            clientTxnId: null,
            lastTxn: null,
            beneficiaries: [],
          };
        }),

      markRemitterRegistered: (remitter) =>
        set((state) => ({
          remitter: { ...remitter, registered: true },
          knownRemitters: {
            ...state.knownRemitters,
            [remitter.mobile]: { ...remitter, registered: true },
          },
        })),

      markOtpVerified: (patch) =>
        set((state) => {
          const remitter = {
            ...state.remitter,
            ...patch,
            otpVerified: true,
            registered: true,
          };
          return {
            remitter,
            knownRemitters: {
              ...state.knownRemitters,
              [remitter.mobile]: remitter,
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

      selectBeneficiary: (id) =>
        set((state) => ({
          selectedBeneficiaryId: id,
          transfer: id
            ? { ...state.transfer, beneficiaryId: id }
            : { ...emptyTransfer },
          commission: null,
          clientTxnId: null,
        })),

      setTransfer: (patch) =>
        set((state) => ({ transfer: { ...state.transfer, ...patch } })),

      setCommission: (preview) => set({ commission: preview }),

      ensureClientTxnId: () => {
        const existing = get().clientTxnId;
        if (existing) return existing;
        const id = createClientTxnId();
        set({ clientTxnId: id });
        return id;
      },

      setLastTransaction: (txn) => set({ lastTxn: txn }),

      getSelectedBeneficiary: () => {
        const { beneficiaries, selectedBeneficiaryId } = get();
        return beneficiaries.find((b) => b.id === selectedBeneficiaryId) ?? null;
      },

      resetTransferFlow: () =>
        set({
          selectedBeneficiaryId: null,
          transfer: emptyTransfer,
          commission: null,
          clientTxnId: null,
          lastTxn: null,
          step: "beneficiary",
        }),
    }),
    {
      name: "paytrue-dmt1-storage",
      partialize: (state) => ({
        remitter: state.remitter,
        knownRemitters: state.knownRemitters,
        beneficiaries: state.beneficiaries,
        selectedBeneficiaryId: state.selectedBeneficiaryId,
        transfer: state.transfer,
        commission: state.commission,
        clientTxnId: state.clientTxnId,
        lastTxn: state.lastTxn,
        step: state.step,
      }),
    }
  )
);
