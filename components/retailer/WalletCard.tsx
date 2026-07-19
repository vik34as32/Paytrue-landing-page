"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { Eye, EyeOff, Wifi, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getRetailerDisplayName } from "@/src/lib/userUtils";
import { RETAILER_USER } from "@/features/retailer/constants";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import { selectUser } from "@/src/redux/slices/authSlice";

function formatCardNumber(cardNumber: string | null | undefined) {
  if (!cardNumber) return "4532 •••• •••• 4521";
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return cardNumber;
  const last4 = digits.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

export default function WalletCard() {
  const [hidden, setHidden] = useState(false);
  const apiWallet = useSelector(selectRtWallet);
  const user = useSelector(selectUser);

  const hasLoadedBalance = apiWallet.lastUpdated != null;
  const loading = apiWallet.loading && !hasLoadedBalance;

  const balance = hasLoadedBalance
    ? apiWallet.currentBalance ?? apiWallet.availableBalance ?? 0
    : 0;

  const holderName =
    apiWallet.cardHolderName ||
    getRetailerDisplayName(user, RETAILER_USER.name);
  const retailerId =
    apiWallet.retailerCode || user?.userId || RETAILER_USER.retailerId;
  const cardNumber = formatCardNumber(apiWallet.cardNumber);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#18335D] via-[#204E9D] to-[#1F6BFF] p-5 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-white/60">
              Paytrue Virtual
            </p>
            <h2 className="text-2xl font-bold">Retailer Card</h2>
          </div>
          <Wifi size={22} className="rotate-90 text-white/60" />
        </div>

        <div className="mt-6">
          <p className="text-2xl font-medium tracking-[5px]">{cardNumber}</p>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase text-white/50">Holder</p>
            <h4 className="font-bold">{holderName.toUpperCase()}</h4>
          </div>

          <div>
            <p className="text-[10px] uppercase text-white/50">Retailer ID</p>
            <h4 className="font-bold">{retailerId}</h4>
          </div>

          <div>
            <p className="text-[10px] uppercase text-white/50">Current Balance</p>
            <div className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white/80" />
              ) : (
                <span className="text-xl font-bold">
                  {hidden ? "₹••••••" : formatCurrency(balance)}
                </span>
              )}
              <button
                type="button"
                onClick={() => setHidden((prev) => !prev)}
                className="rounded-md bg-white/10 p-1.5"
                aria-label={hidden ? "Show balance" : "Hide balance"}
                disabled={loading}
              >
                {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
