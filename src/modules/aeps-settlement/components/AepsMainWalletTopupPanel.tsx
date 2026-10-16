"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useRefreshAepsWalletBalance } from "@/src/hooks/useAepsWalletBalance";
import { topupAepsToMainWallet } from "@/src/services/aepsService";

const QUICK_AMOUNTS = [100, 500, 1000];

export default function AepsMainWalletTopupPanel({
  balance,
  onClose,
}: {
  balance: number;
  onClose: () => void;
}) {
  const refreshBalance = useRefreshAepsWalletBalance();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (numericAmount > balance) {
      setError("Amount cannot exceed available AEPS balance.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await topupAepsToMainWallet({ amount: numericAmount });
      toast.success("AEPS balance transferred to main wallet successfully.");
      void refreshBalance();
      onClose();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to top-up main wallet.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-50 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AEPS wallet balance</p>
        <p className="text-xl font-bold text-[#0b1f3a]">{formatCurrency(balance)}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="aeps-topup-amount">Amount (₹)</Label>
        <Input
          id="aeps-topup-amount"
          inputMode="decimal"
          value={amount}
          placeholder="Enter amount"
          disabled={submitting}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
          className="h-12 rounded-xl text-lg font-semibold"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_AMOUNTS.map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setAmount(String(value))}
            >
              ₹{value.toLocaleString("en-IN")}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-emerald-300 text-emerald-700"
            onClick={() => setAmount(String(balance))}
          >
            Full balance
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={submitting} onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="button"
          disabled={submitting}
          onClick={() => void handleSubmit()}
          className="rounded-xl bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white shadow-md"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            "Transfer to Main Wallet"
          )}
        </Button>
      </div>
    </div>
  );
}
