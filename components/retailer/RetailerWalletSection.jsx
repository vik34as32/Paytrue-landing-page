"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftRight } from "lucide-react";
import WalletTransferForm from "@/src/components/wallet/WalletTransferForm";
import TransferHistoryTable from "@/src/components/wallet/TransferHistoryTable";
import WalletBalanceCard from "@/src/components/wallet/WalletBalanceCard";
import { formatCurrency } from "@/lib/utils";
import { getUserDisplayName } from "@/src/lib/userUtils";
import { RETAILER_USER } from "@/features/retailer/constants";
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import { selectDistributors } from "@/src/redux/slices/distributorSlice";
import { selectRetailers } from "@/src/redux/slices/retailerSlice";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import { selectUser } from "@/src/redux/slices/authSlice";

export default function RetailerWalletSection() {
  const dispatch = useDispatch();
  const wallet = useSelector(selectRtWallet);
  const user = useSelector(selectUser);
  const distributors = useSelector(selectDistributors);
  const retailers = useSelector(selectRetailers);

  useEffect(() => {
    dispatch(fetchDistributors({ page: 1, limit: 100 }));
    dispatch(fetchRetailers({ page: 1, limit: 100 }));
  }, [dispatch]);

  const recipients = useMemo(
    () => [
      ...distributors
        .filter((d) => d.status === "active")
        .map((d) => ({
          id: d.id,
          label: `${d.name} (Distributor) · ${formatCurrency(d.walletBalance || 0)}`,
        })),
      ...retailers
        .filter((r) => r.status === "active")
        .map((r) => ({
          id: r.id,
          label: `${r.name} (Retailer) · ${formatCurrency(r.walletBalance || 0)}`,
        })),
    ],
    [distributors, retailers]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ArrowLeftRight className="h-5 w-5 text-[#1565d8]" />
        <h2 className="text-lg font-bold text-[#0b1f3a]">Wallet</h2>
      </div>

      <WalletBalanceCard
        wallet={wallet}
        userName={getUserDisplayName(user, RETAILER_USER.name)}
        userId={user?.userId || RETAILER_USER.retailerId}
      />

      {/* <WalletTransferForm
        role="rt"
        recipients={recipients}
        balance={wallet.balance}
        receiverLabel="Choose receiver"
        title="Transfer Balance"
        requireDescription
      /> */}

      {/* <TransferHistoryTable variant="full" title="Wallet History" /> */}
    </div>
  );
}
