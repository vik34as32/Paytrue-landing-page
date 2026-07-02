"use client";

import { CreditCard } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";

const CARD_ISSUERS = [
  "HDFC Bank Credit Card",
  "ICICI Bank Credit Card",
  "SBI Card",
  "Axis Bank Credit Card",
  "Kotak Credit Card",
  "Yes Bank Credit Card",
];

export default function CreditCardPage() {
  return (
    <UtilityBillPage
      title="Credit Card Bill"
      description="Pay credit card bills instantly"
      icon={CreditCard}
      providers={CARD_ISSUERS}
      serviceType="credit-card"
      consumerLabel="Card Number (last 4 digits)"
    />
  );
}
