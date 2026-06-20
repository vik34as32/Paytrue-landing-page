"use client";

import { Flame } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";
import { GAS_PROVIDERS } from "@/features/retailer/services/recharge";

export default function GasPage() {
  return (
    <UtilityBillPage
      title="Gas Bill Payment"
      description="LPG & Piped gas bill payments"
      icon={Flame}
      providers={GAS_PROVIDERS}
      consumerLabel="LPG ID / Consumer Number"
    />
  );
}
