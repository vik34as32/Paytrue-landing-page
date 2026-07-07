"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/src/redux/types";
import { usePathname } from "next/navigation";
import { Eye, EyeOff, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";

const STORAGE_KEY = "paytrue_rt_wallet_balance_hidden";

function readHiddenPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function isDashboardPath(pathname: string | null) {
  return pathname === "/rt/retailer" || pathname === "/rt/retailer/";
}

export default function HeaderWalletBalance() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const wallet = useSelector(selectRtWallet);
  const prevPathRef = useRef<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHidden(readHiddenPreference());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isDashboardPath(pathname)) {
      prevPathRef.current = pathname;
      return;
    }

    if (prevPathRef.current !== null && prevPathRef.current !== pathname) {
      dispatch(fetchWalletBalance({ role: "rt" }));
    }

    prevPathRef.current = pathname;
  }, [pathname, dispatch]);

  useEffect(() => {
    if (!wallet.error) return;
    console.error(
      "[HeaderWalletBalance] Failed to fetch wallet balance:",
      wallet.error
    );
  }, [wallet.error]);

  const toggleHidden = useCallback(() => {
    setHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const hasLoaded = wallet.lastUpdated != null;
  const loading = wallet.loading && !hasLoaded;
  const balance = hasLoaded
    ? wallet.currentBalance ?? wallet.availableBalance ?? wallet.balance ?? 0
    : wallet.error
      ? 0
      : 0;

  const displayAmount =
    !hydrated || loading
      ? null
      : hidden
        ? "₹******"
        : formatCurrency(balance);

  return (
    <div className="flex h-10 min-w-0 max-w-[140px] items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-2 shadow-sm sm:max-w-none sm:gap-2 sm:px-2.5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1565d8] dark:bg-blue-950/40">
        <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="hidden text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:block dark:text-slate-500">
          Wallet
        </p>
        {loading ? (
          <div className="mt-0.5 h-3.5 w-14 animate-pulse rounded bg-slate-200 sm:w-16 dark:bg-slate-700" />
        ) : (
          <p className="truncate text-[11px] font-bold leading-tight text-[#0b1f3a] sm:text-xs dark:text-white">
            {displayAmount ?? formatCurrency(0)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={toggleHidden}
        disabled={loading || !hydrated}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        aria-label={hidden ? "Show balance" : "Hide balance"}
      >
        {hidden ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
