"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createClientTxnId } from "../utils/dmt3.utils";
import type {
  Dmt3Beneficiary,
  Dmt3CommissionPreview,
  Dmt3Step,
  Dmt3Transaction,
  Dmt3TransferDraft,
} from "../types/dmt3.types";

const emptyTransfer: Dmt3TransferDraft = {
  beneficiaryId: "",
  amount: 0,
  transferMode: "IMPS",
  remarks: "",
};

interface Dmt3State {
  beneficiaries: Dmt3Beneficiary[];
  selectedBeneficiaryId: string | null;
  transfer: Dmt3TransferDraft;
  commission: Dmt3CommissionPreview | null;
  clientTxnId: string | null;
  lastTxn: Dmt3Transaction | null;
  step: Dmt3Step;
  setStep: (step: Dmt3Step) => void;
  setBeneficiaries: (rows: Dmt3Beneficiary[]) => void;
  upsertBeneficiary: (row: Dmt3Beneficiary) => void;
  selectBeneficiary: (id: string | null) => void;
  setTransfer: (patch: Partial<Dmt3TransferDraft>) => void;
  setCommission: (preview: Dmt3CommissionPreview | null) => void;
  ensureClientTxnId: () => string;
  setLastTransaction: (txn: Dmt3Transaction | null) => void;
  getSelectedBeneficiary: () => Dmt3Beneficiary | null;
  resetTransferFlow: () => void;
}

export const useDmt3Store = create<Dmt3State>()(
  persist(
    (set, get) => ({
      beneficiaries: [],
      selectedBeneficiaryId: null,
      transfer: emptyTransfer,
      commission: null,
      clientTxnId: null,
      lastTxn: null,
      step: "start",

      setStep: (step) => set({ step }),

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
      name: "paytrue-dmt3-storage",
      partialize: (state) => ({
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
