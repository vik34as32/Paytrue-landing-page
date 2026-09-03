"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import { RequireDmt3Session } from "../components/Dmt3Guards";
import { useDmt3RetailerContext } from "../hooks/useDmt3RetailerContext";
import { useDmt3Store } from "../lib/dmt3-store";

export default function Dmt3StartPage() {
  const router = useRouter();
  const retailer = useDmt3RetailerContext();
  const setStep = useDmt3Store((s) => s.setStep);

  const onContinue = () => {
    setStep("beneficiary");
    router.push("/rt/retailer/dmt3/beneficiaries");
  };

  return (
    <RequireDmt3Session>
      <div className="space-y-5">
        <Dmt3FlowHeader activeStep={0} />
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">Retailer Session</h2>
          <p className="mt-1 text-sm text-slate-500">
            You are logged in as the retailer. Continue to manage beneficiaries and
            initiate transfers.
          </p>

          <div className="mt-5 flex items-start gap-4 rounded-xl bg-slate-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <UserCircle2 className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Sender Details
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#0b1f3a]">
                {retailer.senderName}
              </p>
              <p className="text-sm text-slate-600">+91 {retailer.senderMobile}</p>
              {retailer.email ? (
                <p className="text-sm text-slate-500">{retailer.email}</p>
              ) : null}
            </div>
          </div>

          <Button
            className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-violet-700 sm:w-auto"
            onClick={onContinue}
          >
            <ArrowRight className="h-4 w-4" />
            Continue to Beneficiaries
          </Button>
        </div>
      </div>
    </RequireDmt3Session>
  );
}
