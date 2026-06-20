"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Beneficiary, DMTTransfer } from "@/types/retailer";

interface RetailerState {
  beneficiaries: Beneficiary[];
  dmtTransfers: DMTTransfer[];
  addBeneficiary: (
    data: Omit<Beneficiary, "id" | "createdAt">
  ) => Beneficiary;
  removeBeneficiary: (id: string) => void;
  addDMTTransfer: (
    data: Omit<DMTTransfer, "id" | "createdAt" | "status">
  ) => DMTTransfer;
}

const MOCK_BENEFICIARIES: Beneficiary[] = [
  {
    id: "ben_001",
    name: "Rahul Sharma",
    mobile: "9876543210",
    bankName: "State Bank of India",
    accountNumber: "123456789012",
    ifscCode: "SBIN0001234",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "ben_002",
    name: "Priya Patel",
    mobile: "9123456789",
    bankName: "HDFC Bank",
    accountNumber: "987654321098",
    ifscCode: "HDFC0001234",
    createdAt: "2026-02-20T14:30:00.000Z",
  },
];

export const useRetailerStore = create<RetailerState>()(
  persist(
    (set, get) => ({
      beneficiaries: MOCK_BENEFICIARIES,
      dmtTransfers: [],

      addBeneficiary: (data) => {
        const beneficiary: Beneficiary = {
          ...data,
          id: `ben_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          beneficiaries: [beneficiary, ...state.beneficiaries],
        }));

        return beneficiary;
      },

      removeBeneficiary: (id) => {
        set((state) => ({
          beneficiaries: state.beneficiaries.filter((b) => b.id !== id),
        }));
      },

      addDMTTransfer: (data) => {
        const transfer: DMTTransfer = {
          ...data,
          id: `dmt_${Date.now()}`,
          status: "success",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          dmtTransfers: [transfer, ...state.dmtTransfers],
        }));

        return transfer;
      },
    }),
    {
      name: "retailer-data-storage",
    }
  )
);
