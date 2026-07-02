"use client";

import ReduxProvider from "@/src/components/common/ReduxProvider";
import BalanceTransferPage from "@/src/components/balanceTransfer/BalanceTransferPage";

export default function RtBalanceTransferPage() {
  return (
    <ReduxProvider>
      <BalanceTransferPage role="rt" />
    </ReduxProvider>
  );
}
