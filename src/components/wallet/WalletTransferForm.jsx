"use client";

import { memo, useCallback, useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import {
  transferWalletBalance,
  fetchWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";
import {
  selectWalletTransfer,
  selectWalletByRole,
  clearTransferError,
} from "@/src/redux/slices/walletSlice";

const ROLE_LABELS = {
  md: "distributor",
  dd: "retailer",
  rt: "receiver",
};

function WalletTransferForm({
  role,
  recipients = [],
  balance = 0,
  receiverLabel,
  title = "Transfer Funds",
  embedded = false,
  requireDescription = false,
}) {
  const dispatch = useDispatch();
  const transfer = useSelector(selectWalletTransfer);
  const wallet = useSelector(selectWalletByRole(role));

  const availableBalance = wallet?.availableBalance ?? balance;

  const [receiverId, setReceiverId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const resetForm = useCallback(() => {
    setReceiverId("");
    setAmount("");
    setDescription("");
    setErrors({});
  }, []);

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!receiverId) nextErrors.receiverId = "Select a receiver";
    if (!amount || Number(amount) <= 0) {
      nextErrors.amount = "Enter an amount greater than 0";
    }
    if (Number(amount) > availableBalance) {
      nextErrors.amount = "Insufficient wallet balance";
    }
    if (requireDescription && !description.trim()) {
      nextErrors.description = "Enter a description";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [amount, receiverId, availableBalance, description, requireDescription]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (transfer.loading) return;
    if (!validate()) return;

    dispatch(clearTransferError());

    const action = await dispatch(
      transferWalletBalance({
        receiverId,
        amount: Number(amount),
        description: requireDescription
          ? description.trim()
          : description.trim() || "Wallet Transfer",
        role,
      })
    );

    if (transferWalletBalance.fulfilled.match(action)) {
      toast.success("Balance transferred successfully");
      resetForm();
      dispatch(fetchWalletBalance({ role }));
      dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
      return;
    }

    toast.error(
      typeof action.payload === "string" ? action.payload : "Transfer failed"
    );
  };

  const label =
    receiverLabel ||
    `Select ${ROLE_LABELS[role] || "receiver"}`.replace(/^Select /, "Choose ");

  const formContent = (
    <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-2 lg:col-span-2">
        <Label>Receiver</Label>
        <Select value={receiverId} onValueChange={setReceiverId}>
          <SelectTrigger>
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent>
            {recipients.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.receiverId && (
          <p className="text-xs text-red-500">{errors.receiverId}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Amount (₹)</Label>
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={transfer.loading}
        />
        {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
      </div>

      <div className="space-y-2 lg:col-span-2">
        <Label>Description{requireDescription ? " *" : ""}</Label>
        <textarea
          placeholder="Enter transaction description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={transfer.loading}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[#1565d8] focus:ring-1 focus:ring-[#1565d8] disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900"
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      {transfer.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 lg:col-span-2">
          {transfer.error}
        </p>
      )}

      <div className="lg:col-span-2">
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-[200px]"
          disabled={transfer.loading}
        >
          {transfer.loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            "Transfer Balance"
          )}
        </Button>
      </div>
    </form>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Available Balance:{" "}
          <span className="font-bold text-emerald-600">
            {formatCurrency(availableBalance)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}

export default memo(WalletTransferForm);
