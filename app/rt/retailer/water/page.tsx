"use client";

import { Droplets } from "lucide-react";
import UtilityBillPage from "@/components/retailer/UtilityBillPage";

const WATER_BOARDS = [
  "Delhi Jal Board",
  "BMC Mumbai",
  "BWSSB Bangalore",
  "Chennai Metro Water",
  "Hyderabad Water Board",
];

export default function WaterPage() {
  return (
    <UtilityBillPage
      title="Water Bill"
      description="Pay water utility bills"
      icon={Droplets}
      providers={WATER_BOARDS}
      serviceType="water"
      consumerLabel="Connection Number"
    />
  );
}
