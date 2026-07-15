"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useCommissionTopup } from "@/src/hooks/useCommission";

interface CommissionTopupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
  onSuccess?: () => void;
}

export default function CommissionTopupModal({
  open,
  onOpenChange,
  availableBalance,
  onSuccess,
}: CommissionTopupModalProps) {
  const topupMutation = useCommissionTopup();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const numericAmount = useMemo(() => Number(amount), [amount]);

  const reset = () => {
    setAmount("");
    setError(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (numericAmount > availableBalance) {
      setError("Amount cannot exceed available commission balance.");
      return;
    }

    try {
      await topupMutation.mutateAsync({ amount: numericAmount });
      toast.success("Commission transferred to main wallet successfully.");
      handleClose(false);
      onSuccess?.();
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        (err as { data?: { message?: string } })?.data?.message ||
        "Failed to top-up main wallet.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-[#1565d8]" />
            Top-up Main Wallet
          </DialogTitle>
          <DialogDescription>
            Transfer commission balance into your main wallet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Available Commission
            </p>
            <p className="mt-1 text-lg font-bold text-[#0b1f3a]">
              {formatCurrency(availableBalance)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission-topup-amount">Amount (₹)</Label>
            <Input
              id="commission-topup-amount"
              type="number"
              min={1}
              step="0.01"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={topupMutation.isPending}
            />
            <div className="flex flex-wrap gap-2">
              {[100, 500, 1000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  disabled={topupMutation.isPending || availableBalance < quick}
                  onClick={() => setAmount(String(quick))}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-[#1565d8]/40 disabled:opacity-40"
                >
                  ₹{quick}
                </button>
              ))}
              <button
                type="button"
                disabled={topupMutation.isPending || availableBalance <= 0}
                onClick={() => setAmount(String(availableBalance))}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-40"
              >
                Full balance
              </button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={topupMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={topupMutation.isPending || availableBalance <= 0}>
              {topupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                "Transfer to Main Wallet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
