"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { AlertCircle, Landmark, Loader2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BankLogo } from "@/components/retailer/BankLogo";
import { useIfscLookup } from "@/src/hooks/useIfscLookup";
import { getProfileBank } from "@/src/lib/profileUtils";
import { useAppDispatch } from "@/src/redux/types";
import { selectAuthHydrated, selectIsAuthenticated, selectUser } from "@/src/redux/slices/authSlice";
import { selectProfile, selectProfileLoading } from "@/src/redux/slices/profileSlice";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  fetchRetailerBankAccount,
  hasRetailerBankAccount,
  RETAILER_BANK_ACCOUNT_QUERY_KEY,
  retailerBankAccountErrorMessage,
} from "../api";
import AddBankAccountModal from "../components/AddBankAccountModal";
import BankLinkStatusBadge from "../components/BankLinkStatusBadge";
import type { RetailerBankAccount } from "../types";

type Rec = Record<string, unknown>;

function pickText(...values: unknown[]): string {
  for (const value of values) {
    const text = value == null ? "" : String(value).trim();
    if (text) return text;
  }
  return "";
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useAccountHolderName(): string {
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser) as Rec | null;
  const profile = useSelector(selectProfile) as Rec | null;
  const profileLoading = useSelector(selectProfileLoading);
  const authHydrated = useSelector(selectAuthHydrated);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!authHydrated || !isAuthenticated) return;
    if (!profile && !profileLoading) dispatch(fetchProfile());
  }, [authHydrated, dispatch, isAuthenticated, profile, profileLoading]);

  const bank = profile ? getProfileBank(profile) : {};
  const fullName = [pickText(user?.firstName, profile?.firstName), pickText(user?.lastName, profile?.lastName)]
    .filter(Boolean)
    .join(" ");
  return pickText(bank.accountHolderName, bank.accountHolder, bank.holderName, fullName, user?.name) || "—";
}

function BankAccountRow({ account, holderName }: { account: RetailerBankAccount; holderName: string }) {
  const ifsc = account.ifscCode ?? "";
  const { data: ifscDetails } = useIfscLookup(ifsc);
  const storedName = account.bankName && account.bankName !== ifsc.slice(0, 4) ? account.bankName : "";
  const bankName = pickText(ifscDetails?.BANK, storedName, account.bankName) || "Bank";
  const branch = [ifscDetails?.BRANCH, ifscDetails?.CITY].filter(Boolean).join(", ");

  return (
    <tr className="border-t border-slate-100 transition hover:bg-slate-50/70">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <BankLogo bank={{ name: bankName, ifscPrefix: ifsc.slice(0, 4) }} size={30} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#0b1f3a]">{bankName}</p>
            {branch ? <p className="truncate text-xs text-slate-500">{branch}</p> : null}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 font-medium text-slate-700">{holderName}</td>
      <td className="px-4 py-4 font-mono text-sm tracking-wider text-slate-800">
        {account.accountNumberMasked ?? "—"}
      </td>
      <td className="px-4 py-4 font-mono text-sm text-slate-700">{ifsc || "—"}</td>
      <td className="px-4 py-4">
        <BankLinkStatusBadge status={account.status} />
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(account.linkedAt)}</td>
    </tr>
  );
}

function RetailerBankAccountContent() {
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useAppDispatch();
  const holderName = useAccountHolderName();
  const query = useQuery({
    queryKey: RETAILER_BANK_ACCOUNT_QUERY_KEY,
    queryFn: fetchRetailerBankAccount,
  });

  const account = query.data;
  const hasAccount = hasRetailerBankAccount(account);
  const isPending = account?.status === "PENDING";

  const handleCompleted = () => {
    void query.refetch();
    dispatch(fetchProfile());
  };

  return (
    <div className="min-w-0 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1565d8] to-[#0b4fb3] text-white shadow-lg">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001F5B] dark:text-white">Bank Account</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Your linked bank account for settlements. Add your own bank account to link it.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="rounded-xl"
          >
            <RefreshCw className={query.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={query.isLoading || isPending}
            className="rounded-xl bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Bank Account
          </Button>
        </div>
      </motion.div>

      {isPending ? (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your previous bank-link request is awaiting confirmation. A new account cannot be added until it
            is resolved.
          </span>
        </div>
      ) : null}

      {account?.status === "FAILED" ? (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>The last bank-link request was rejected. Please check the details and add the account again.</span>
        </div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Bank</th>
                <th className="px-4 py-3">Account Holder</th>
                <th className="px-4 py-3">Account Number</th>
                <th className="px-4 py-3">IFSC</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Linked On</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading bank account...
                  </td>
                </tr>
              ) : query.isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm text-red-600">{retailerBankAccountErrorMessage(query.error)}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void query.refetch()}
                      className="mt-3 rounded-xl"
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ) : account && hasAccount ? (
                <BankAccountRow account={account} holderName={holderName} />
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Landmark className="h-6 w-6" />
                    </span>
                    <p className="font-semibold text-slate-700">No bank account added yet</p>
                    <p className="mt-1 text-xs text-slate-500">Add your bank account to get started.</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setModalOpen(true)}
                      className="mt-4 rounded-xl bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Bank Account
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AddBankAccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        hasExistingAccount={hasAccount && account?.status === "LINKED"}
        onCompleted={handleCompleted}
      />
    </div>
  );
}

export default function RetailerBankAccountPage() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RetailerBankAccountContent />
    </QueryClientProvider>
  );
}
