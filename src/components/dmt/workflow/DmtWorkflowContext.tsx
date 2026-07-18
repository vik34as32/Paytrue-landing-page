"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { DmtBeneficiary, DmtSender } from "@/src/types/dmt";

export const DMT_STEPS = [
  "Search Sender",
  "Sender Details",
  "Beneficiaries",
  "Transfer",
  "Receipt",
] as const;

export const STEP = {
  SEARCH: 0,
  DETAILS: 1,
  BENEFICIARIES: 2,
  TRANSFER: 3,
  RECEIPT: 4,
} as const;

interface WorkflowState {
  step: number;
  mobile: string;
  referenceKey: string;
  pidOptionWadh: string;
  sender: DmtSender | null;
  selectedBeneficiary: DmtBeneficiary | null;
  transferReference: string;
}

interface WorkflowContextValue extends WorkflowState {
  setMobile: (mobile: string) => void;
  setReferenceKey: (key: string) => void;
  setPidOptionWadh: (wadh: string) => void;
  setSender: (sender: DmtSender | null) => void;
  setSelectedBeneficiary: (beneficiary: DmtBeneficiary | null) => void;
  setTransferReference: (reference: string) => void;
  goToStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
}

const DmtWorkflowContext = createContext<WorkflowContextValue | null>(null);

export function DmtWorkflowProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<number>(STEP.SEARCH);
  const [mobile, setMobile] = useState("");
  const [referenceKey, setReferenceKey] = useState("");
  const [pidOptionWadh, setPidOptionWadh] = useState("");
  const [sender, setSender] = useState<DmtSender | null>(null);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<DmtBeneficiary | null>(null);
  const [transferReference, setTransferReference] = useState("");

  const value = useMemo<WorkflowContextValue>(
    () => ({
      step,
      mobile,
      referenceKey,
      pidOptionWadh,
      sender,
      selectedBeneficiary,
      transferReference,
      setMobile,
      setReferenceKey,
      setPidOptionWadh,
      setSender,
      setSelectedBeneficiary,
      setTransferReference,
      goToStep: (next) => setStep(next),
      goNext: () => setStep((s) => Math.min(s + 1, DMT_STEPS.length - 1)),
      goBack: () => setStep((s) => Math.max(s - 1, 0)),
      reset: () => {
        setStep(STEP.SEARCH);
        setMobile("");
        setReferenceKey("");
        setPidOptionWadh("");
        setSender(null);
        setSelectedBeneficiary(null);
        setTransferReference("");
      },
    }),
    [step, mobile, referenceKey, pidOptionWadh, sender, selectedBeneficiary, transferReference]
  );

  return <DmtWorkflowContext.Provider value={value}>{children}</DmtWorkflowContext.Provider>;
}

export function useDmtWorkflow(): WorkflowContextValue {
  const ctx = useContext(DmtWorkflowContext);
  if (!ctx) {
    throw new Error("useDmtWorkflow must be used within DmtWorkflowProvider");
  }
  return ctx;
}
