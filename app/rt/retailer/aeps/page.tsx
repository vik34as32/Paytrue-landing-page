"use client";

import { Fingerprint } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";

const AEPS_SERVICES = [
  "NSDL AEPS - Cash Withdrawal",
  "NSDL AEPS - Balance Enquiry",
  "ICICI AEPS - Cash Withdrawal",
  "ICICI AEPS - Mini Statement",
  "Aadhaar Pay",
];

export default function AEPSPage() {
  return (
    <UtilityBillPage
      title="AEPS Services"
      description="Aadhaar Enabled Payment System"
      icon={Fingerprint}
      providers={AEPS_SERVICES}
      serviceType="credit-card"
      consumerLabel="Aadhaar Number"
    />
  );
}
