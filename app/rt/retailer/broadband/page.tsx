"use client";

import { Wifi } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";
import { BROADBAND_PROVIDERS } from "@/features/retailer/services/recharge";

export default function BroadbandPage() {
  return (
    <UtilityBillPage
      title="Broadband Bill"
      description="Pay broadband & cable TV bills"
      icon={Wifi}
      providers={BROADBAND_PROVIDERS}
      serviceType="broadband"
      consumerLabel="Account Number"
    />
  );
}
