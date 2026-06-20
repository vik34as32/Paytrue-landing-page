"use client";

import { Zap } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";
import { ELECTRICITY_BOARDS } from "@/features/retailer/services/recharge";

export default function ElectricityPage() {
  return (
    <UtilityBillPage
      title="Electricity Bill"
      description="Pay electricity bills instantly"
      icon={Zap}
      providers={ELECTRICITY_BOARDS}
      consumerLabel="Consumer Number"
    />
  );
}
