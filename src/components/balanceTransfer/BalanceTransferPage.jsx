"use client";

import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftRight } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import WalletTransferForm from "@/src/components/wallet/WalletTransferForm";
import { formatCurrency } from "@/lib/utils";
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";
import { selectDistributors } from "@/src/redux/slices/distributorSlice";
import { selectRetailers } from "@/src/redux/slices/retailerSlice";
import { selectWalletByRole } from "@/src/redux/slices/walletSlice";

const PAGE_CONFIG = {
  md: {
    title: "Balance Transfer",
    description: "Transfer wallet balance to your distributors",
    backHref: "/md/dashboard",
    receiverLabel: "Choose distributor",
    loadRecipients: (dispatch) =>
      dispatch(fetchDistributors({ page: 1, limit: 100 })),
    mapRecipients: (distributors) =>
      distributors
        .filter((d) => d.status === "active")
        .map((d) => ({
          id: d.id,
          label: `${d.name} · ${formatCurrency(d.walletBalance || 0)}`,
        })),
    getSource: (distributors) => distributors,
  },
  dd: {
    title: "Balance Transfer",
    description: "Transfer wallet balance to your retailers",
    backHref: "/dd/dashboard",
    receiverLabel: "Choose retailer",
    loadRecipients: (dispatch) =>
      dispatch(fetchRetailers({ page: 1, limit: 100 })),
    mapRecipients: (retailers) =>
      retailers
        .filter((r) => r.status === "active")
        .map((r) => ({
          id: r.id,
          label: `${r.name} · ${formatCurrency(r.walletBalance || 0)}`,
        })),
    getSource: (_, retailers) => retailers,
  },
  rt: {
    title: "Balance Transfer",
    description: "Transfer wallet balance securely",
    backHref: "/rt/retailer",
    receiverLabel: "Choose receiver",
    loadRecipients: (dispatch) => {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    },
    mapRecipients: (distributors, retailers) => [
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
    getSource: (distributors, retailers) => ({ distributors, retailers }),
  },
};

export default function BalanceTransferPage({ role }) {
  const dispatch = useDispatch();
  const config = PAGE_CONFIG[role] ?? PAGE_CONFIG.dd;
  const distributors = useSelector(selectDistributors);
  const retailers = useSelector(selectRetailers);
  const wallet = useSelector(selectWalletByRole(role));

  useEffect(() => {
    dispatch(fetchWalletBalance({ role }));
    if (role === "md") {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
    } else if (role === "dd") {
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    } else if (role === "rt") {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    }
  }, [dispatch, role]);

  const recipients = useMemo(() => {
    if (role === "md") {
      return config.mapRecipients(distributors);
    }
    if (role === "dd") {
      return config.mapRecipients(retailers);
    }
    return config.mapRecipients(distributors, retailers);
  }, [role, config, distributors, retailers]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        icon={ArrowLeftRight}
        backHref={config.backHref}
      />

      <WalletTransferForm
        role={role}
        recipients={recipients}
        balance={wallet?.balance ?? 0}
        receiverLabel={config.receiverLabel}
      />
    </div>
  );
}
