"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MinusCircle } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import WalletDeductForm from "@/src/components/walletDeduct/WalletDeductForm";
import { formatCurrency } from "@/lib/utils";
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";
import { selectDistributors } from "@/src/redux/slices/distributorSlice";
import { selectRetailers } from "@/src/redux/slices/retailerSlice";

function mapDownlineRecipients(users) {
  return users
    .filter((user) => user.status === "active")
    .map((user) => ({
      id: user.id,
      name: user.name,
      walletBalance: user.walletBalance || 0,
      label: `${user.name} · ${formatCurrency(user.walletBalance || 0)}`,
    }));
}

const PAGE_CONFIG = {
  md: {
    title: "Balance Deduct",
    description: "Deduct wallet balance from your distributors",
    backHref: "/md/dashboard",
    receiverLabel: "Choose distributor",
    formTitle: "Deduct from Distributor",
  },
  dd: {
    title: "Balance Deduct",
    description: "Deduct wallet balance from your retailers",
    backHref: "/dd/dashboard",
    receiverLabel: "Choose retailer",
    formTitle: "Deduct from Retailer",
  },
};

export default function WalletDeductPage({ role }) {
  const dispatch = useDispatch();
  const config = PAGE_CONFIG[role] ?? PAGE_CONFIG.dd;
  const distributors = useSelector(selectDistributors);
  const retailers = useSelector(selectRetailers);

  useEffect(() => {
    dispatch(fetchWalletBalance({ role }));
    if (role === "md") {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
    } else if (role === "dd") {
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    }
  }, [dispatch, role]);

  const recipients = useMemo(() => {
    if (role === "md") {
      return mapDownlineRecipients(distributors);
    }
    return mapDownlineRecipients(retailers);
  }, [role, distributors, retailers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        icon={MinusCircle}
        backHref={config.backHref}
      />

      <WalletDeductForm
        role={role}
        recipients={recipients}
        receiverLabel={config.receiverLabel}
        title={config.formTitle}
      />
    </div>
  );
}
