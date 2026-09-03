"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import Dmt3TransferReview from "../components/Dmt3TransferReview";
import {
  RequireCommissionPreview,
  RequireDmt3Session,
  RequireSelectedBeneficiary,
} from "../components/Dmt3Guards";
import { useDmt3RetailerContext } from "../hooks/useDmt3RetailerContext";
import { useDmt3Store } from "../lib/dmt3-store";
import { submitTransfer } from "../lib/dmt3-service";
import { formatDmt3Inr } from "../utils/dmt3.utils";

export default function Dmt3ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading review…
        </div>
      }
    >
      <Dmt3ReviewContent />
    </Suspense>
  );
}

function Dmt3ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showMpin = searchParams?.get("mpin") === "1";
  const retailer = useDmt3RetailerContext();
  const beneficiary = useDmt3Store((s) => s.getSelectedBeneficiary());
  const transfer = useDmt3Store((s) => s.transfer);
  const commission = useDmt3Store((s) => s.commission);
  const ensureClientTxnId = useDmt3Store((s) => s.ensureClientTxnId);
  const setLastTransaction = useDmt3Store((s) => s.setLastTransaction);
  const setStep = useDmt3Store((s) => s.setStep);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!beneficiary || !commission) return null;

  const onProceedToMpin = () => {
    ensureClientTxnId();
    setStep("mpin");
    router.push("/rt/retailer/dmt3/review?mpin=1");
  };

  const onConfirm = async () => {
    if (mpin.length !== MPIN_LENGTH) {
      toast.error("Enter valid MPIN");
      return;
    }
    setLoading(true);
    try {
      const clientTxnId = ensureClientTxnId();
      const txn = await submitTransfer({
        beneficiaryId: beneficiary.id,
        transfer,
        mpin,
        clientTxnId,
        retailer,
      });
      setLastTransaction(txn);
      setStep("success");
      toast.success(
        txn.status === "SUCCESS" ? "Transfer successful" : `Transfer ${txn.status.toLowerCase()}`
      );
      router.push(
        `/rt/retailer/dmt3/receipt/${encodeURIComponent(txn.id)}?success=1`
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (showMpin) {
    return (
      <RequireDmt3Session>
        <RequireSelectedBeneficiary>
          <RequireCommissionPreview>
            <div className="space-y-5">
              <Dmt3FlowHeader activeStep={5} />
              <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <h2 className="text-xl font-extrabold text-[#0b1f3a]">Confirm Transaction</h2>
                <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
                  <Row label="Amount" value={formatDmt3Inr(commission.transferAmount)} />
                  <Row label="Total Debit" value={formatDmt3Inr(commission.totalDebit)} />
                  <Row label="Beneficiary" value={beneficiary.name} />
                  <Row label="Mode" value={transfer.transferMode} />
                </div>
                <div className="mt-5 text-left">
                  <AnimatedMpinInput
                    label="MPIN"
                    hint="Enter your 4-digit MPIN to authorize this transfer."
                    value={mpin}
                    onChange={setMpin}
                    length={MPIN_LENGTH}
                    autoFocus
                    disabled={loading}
                    allowPaste={false}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={() => router.push("/rt/retailer/dmt3/review")}
                  >
                    Back
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-700"
                    disabled={loading || mpin.length !== MPIN_LENGTH}
                    onClick={() => void onConfirm()}
                  >
                    {loading ? "Confirming…" : "Confirm Transfer"}
                  </Button>
                </div>
              </div>
            </div>
          </RequireCommissionPreview>
        </RequireSelectedBeneficiary>
      </RequireDmt3Session>
    );
  }

  return (
    <RequireDmt3Session>
      <RequireSelectedBeneficiary>
        <RequireCommissionPreview>
          <div className="space-y-5">
            <Dmt3FlowHeader activeStep={4} />
            <div className="mx-auto max-w-2xl">
              <Dmt3TransferReview
                beneficiary={beneficiary}
                preview={commission}
                remarks={transfer.remarks}
                onConfirm={onProceedToMpin}
                onBack={() => router.push("/rt/retailer/dmt3/commission")}
              />
            </div>
          </div>
        </RequireCommissionPreview>
      </RequireSelectedBeneficiary>
    </RequireDmt3Session>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-[#0b1f3a]">{value}</span>
    </div>
  );
}
