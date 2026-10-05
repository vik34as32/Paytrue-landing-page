"use client";

import UpiPayoutShell from "@/src/modules/upi-payout/components/UpiPayoutShell";

export default function UpiPayoutLayout({ children }: { children: React.ReactNode }) {
  return <UpiPayoutShell>{children}</UpiPayoutShell>;
}
