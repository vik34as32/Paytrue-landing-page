"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import { formatCurrency } from "@/lib/utils";
import {
  deductWalletBalance,
  fetchWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import {
  selectWalletDeduct,
  selectWalletByRole,
  clearDeductError,
} from "@/src/redux/slices/walletSlice";

const ROLE_LABELS = {
  md: "distributor",
  dd: "retailer",
};

function WalletDeductForm({
  role,
  recipients = [],
  receiverLabel,
  title = "Deduct Balance",
}) {
  const dispatch = useDispatch();
  const deduct = useSelector(selectWalletDeduct);
  const wallet = useSelector(selectWalletByRole(role));

  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedRecipient = useMemo(
    () => recipients.find((item) => item.id === userId) ?? null,
    [recipients, userId]
  );

  const targetBalance = selectedRecipient?.walletBalance ?? 0;

  const resetForm = useCallback(() => {
    setUserId("");
    setAmount("");
    setDescription("");
    setErrors({});
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!userId) nextErrors.userId = "Select a downline user";
    if (!amount || Number(amount) <= 0) {
      nextErrors.amount = "Enter an amount greater than 0";
    } else if (Number(amount) > targetBalance) {
      nextErrors.amount = "Amount exceeds downline wallet balance";
    }
    if (!description.trim()) {
      nextErrors.description = "Enter a reason for deduction";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [amount, userId, targetBalance, description]);

  const refreshAfterDeduct = useCallback(() => {
    dispatch(fetchWalletBalance({ role }));
    dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
    if (role === "md") {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
    } else if (role === "dd") {
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    }
  }, [dispatch, role]);

  const submitDeduct = async () => {
    dispatch(clearDeductError());

    const action = await dispatch(
      deductWalletBalance({
        userId,
        amount: Number(amount),
        description: description.trim(),
        role,
      })
    );

    if (deductWalletBalance.fulfilled.match(action)) {
      toast.success("Balance deducted successfully");
      resetForm();
      setConfirmOpen(false);
      refreshAfterDeduct();
      return;
    }

    toast.error(
      typeof action.payload === "string" ? action.payload : "Deduction failed"
    );
    setConfirmOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (deduct.loading) return;
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const label = receiverLabel || `Choose ${ROLE_LABELS[role] || "downline user"}`;

  const confirmMessage = selectedRecipient
    ? `Deduct ${formatCurrency(Number(amount) || 0)} from ${selectedRecipient.name}? Their current balance is ${formatCurrency(targetBalance)}.`
    : "Confirm balance deduction?";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Your wallet balance:{" "}
            <span className="font-bold text-emerald-600">
              {formatCurrency(wallet?.availableBalance ?? wallet?.balance ?? 0)}
            </span>
            {selectedRecipient ? (
              <>
                {" "}
                · Selected downline balance:{" "}
                <span className="font-bold text-[#001F5B]">
                  {formatCurrency(targetBalance)}
                </span>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label>Downline User</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={label} />
                </SelectTrigger>
                <SelectContent>
                  {recipients.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      No active downline users found
                    </SelectItem>
                  ) : (
                    recipients.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.userId && (
                <p className="text-xs text-red-500">{errors.userId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amount to Deduct (₹)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={deduct.loading}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label>Reason / Description *</Label>
              <textarea
                placeholder="Enter reason for balance deduction"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={deduct.loading}
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[#1565d8] focus:ring-1 focus:ring-[#1565d8] disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {deduct.error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 lg:col-span-2">
                {deduct.error}
              </p>
            )}

            <div className="lg:col-span-2">
              <Button
                type="submit"
                variant="destructive"
                className="w-full sm:w-auto sm:min-w-[200px]"
                disabled={deduct.loading || recipients.length === 0}
              >
                {deduct.loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deducting...
                  </>
                ) : (
                  "Deduct Balance"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Balance Deduction"
        message={confirmMessage}
        confirmLabel="Deduct Balance"
        variant="destructive"
        loading={deduct.loading}
        onConfirm={() => void submitDeduct()}
      />
    </>
  );
}

export default memo(WalletDeductForm);
