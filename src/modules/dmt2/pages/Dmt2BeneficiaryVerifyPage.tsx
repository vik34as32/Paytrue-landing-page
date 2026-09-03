"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { RequireVerifiedRetailer } from "../components/Dmt2Guards";
import { useDmt2Store } from "../lib/dmt2-store";
import { verifyBeneficiaryApi } from "../lib/dmt2-service";
import { maskAccount } from "../lib/dmt2-mock";

export default function Dmt2BeneficiaryVerifyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";
  const beneficiary = useDmt2Store((s) => s.beneficiaries.find((b) => b.id === id));
  const selectBeneficiary = useDmt2Store((s) => s.selectBeneficiary);
  const setStep = useDmt2Store((s) => s.setStep);
  const upsertBeneficiary = useDmt2Store((s) => s.upsertBeneficiary);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!beneficiary) {
      toast.error("Beneficiary not found");
      router.replace("/rt/retailer/dmt2/beneficiaries");
    }
  }, [beneficiary, id, router]);

  if (!beneficiary) return null;

  return (
    <RequireVerifiedRetailer>
      <div className="space-y-5">
        <Dmt2FlowHeader activeStep={3} />
        <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">Confirm Beneficiary</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review the customer account, then continue to transfer.
          </p>
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
            <p className="font-bold text-[#0b1f3a]">{beneficiary.name}</p>
            <p>{maskAccount(beneficiary.accountNumber)}</p>
            <p>{beneficiary.ifsc}</p>
          </div>
          <Button
            className="mt-5 w-full bg-gradient-to-r from-indigo-500 to-violet-700"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const verified = await verifyBeneficiaryApi(beneficiary.id);
                upsertBeneficiary(verified);
                selectBeneficiary(verified.id);
                setStep("transfer");
                router.push("/rt/retailer/dmt2/transfer");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "Unable to verify beneficiary");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Verifying…" : "Confirm & Continue"}
          </Button>
        </div>
      </div>
    </RequireVerifiedRetailer>
  );
}
