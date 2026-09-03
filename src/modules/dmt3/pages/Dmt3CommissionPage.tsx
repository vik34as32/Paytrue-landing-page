"use client";

import { useRouter } from "next/navigation";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import Dmt3CommissionPreviewCard from "../components/Dmt3CommissionPreview";
import {
  RequireCommissionPreview,
  RequireDmt3Session,
  RequireSelectedBeneficiary,
} from "../components/Dmt3Guards";
import { useDmt3Store } from "../lib/dmt3-store";

export default function Dmt3CommissionPage() {
  const router = useRouter();
  const commission = useDmt3Store((s) => s.commission);
  const setStep = useDmt3Store((s) => s.setStep);

  if (!commission) return null;

  const onContinue = () => {
    setStep("review");
    router.push("/rt/retailer/dmt3/review");
  };

  const onBack = () => {
    router.push("/rt/retailer/dmt3/transfer");
  };

  return (
    <RequireDmt3Session>
      <RequireSelectedBeneficiary>
        <RequireCommissionPreview>
          <div className="space-y-5">
            <Dmt3FlowHeader activeStep={3} />
            <div className="mx-auto max-w-2xl">
              <Dmt3CommissionPreviewCard
                preview={commission}
                onContinue={onContinue}
                onBack={onBack}
              />
            </div>
          </div>
        </RequireCommissionPreview>
      </RequireSelectedBeneficiary>
    </RequireDmt3Session>
  );
}
