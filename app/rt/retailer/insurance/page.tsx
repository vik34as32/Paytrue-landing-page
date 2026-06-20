"use client";

import { Shield } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";

const INSURANCE_PROVIDERS = [
  "LIC of India",
  "HDFC Life",
  "ICICI Prudential",
  "SBI Life",
  "Max Life Insurance",
  "Bajaj Allianz",
];

export default function InsurancePage() {
  return (
    <UtilityBillPage
      title="Insurance Payment"
      description="Pay insurance premiums"
      icon={Shield}
      providers={INSURANCE_PROVIDERS}
      consumerLabel="Policy Number"
    />
  );
}
