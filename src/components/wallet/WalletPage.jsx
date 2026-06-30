"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";
import { selectMdWallet, selectDdWallet } from "@/src/redux/slices/walletSlice";
import { selectMdUser, selectDdUser } from "@/src/redux/slices/authSlice";

export default function WalletPage({ role }) {
  const dispatch = useDispatch();
  const isMd = role === "md";
  const mdWallet = useSelector(selectMdWallet);
  const ddWallet = useSelector(selectDdWallet);
  const mdUser = useSelector(selectMdUser);
  const ddUser = useSelector(selectDdUser);

  const wallet = isMd ? mdWallet : ddWallet;
  const user = isMd ? mdUser : ddUser;

  useEffect(() => {
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="View your wallet details and balance"
        icon={CreditCard}
        backHref={isMd ? "/md/dashboard" : "/dd/dashboard"}
      />

      <Card>
        <CardHeader>
          <CardTitle>Wallet Overview</CardTitle>
          <CardDescription>Current wallet status for {user?.name}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Available Balance
            </p>
            <p className="mt-2 text-2xl font-bold text-[#0b1f3a]">
              {wallet.loading ? "Loading..." : formatCurrency(wallet.balance)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account Holder
            </p>
            <p className="mt-2 text-lg font-bold text-[#0b1f3a]">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.userId}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0b1f3a]">{user?.email}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mobile
            </p>
            <p className="mt-2 text-sm font-semibold text-[#0b1f3a]">{user?.mobile}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
