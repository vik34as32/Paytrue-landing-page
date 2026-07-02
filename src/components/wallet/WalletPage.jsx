"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import WalletBalanceCard from "@/src/components/wallet/WalletBalanceCard";
import TransferBalanceTrigger from "@/src/components/wallet/TransferBalanceModal";
import TransferHistoryTable from "@/src/components/wallet/TransferHistoryTable";
import { WALLET_PAGE_TITLES } from "@/src/lib/walletUtils";
import {
  fetchWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";
import { selectWalletByRole } from "@/src/redux/slices/walletSlice";
import { selectUser } from "@/src/redux/slices/authSlice";

export default function WalletPage({ role }) {
  const dispatch = useDispatch();
  const wallet = useSelector(selectWalletByRole(role));
  const user = useSelector(selectUser);

  const backHref =
    role === "md" ? "/md/dashboard" : role === "dd" ? "/dd/dashboard" : "/rt/retailer";

  useEffect(() => {
    dispatch(fetchWalletBalance({ role }));
    dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
  }, [dispatch, role]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={WALLET_PAGE_TITLES[role] || "Wallet"}
        description="Manage balance, transfers and transaction history"
        icon={CreditCard}
        backHref={backHref}
      />

      <WalletBalanceCard
        wallet={wallet}
        userName={user?.name}
        userId={user?.userId}
      />

      <div>
        <TransferBalanceTrigger role={role} />
      </div>

      <TransferHistoryTable
        variant={role === "rt" ? "full" : "compact"}
        title={role === "rt" ? "Wallet History" : "Transfer History"}
      />
    </div>
  );
}
