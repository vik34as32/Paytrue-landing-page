"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { RECEIVER_TYPES_BY_ROLE } from "@/src/lib/walletUtils";
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
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import { selectDistributors } from "@/src/redux/slices/distributorSlice";
import { selectRetailers } from "@/src/redux/slices/retailerSlice";

function TransferBalanceModal({ role, open, onOpenChange }) {
  const dispatch = useDispatch();
  const wallet = useSelector(selectWalletByRole(role));
  const transfer = useSelector(selectWalletTransfer);
  const distributors = useSelector(selectDistributors);
  const retailers = useSelector(selectRetailers);

  const receiverTypeOptions = RECEIVER_TYPES_BY_ROLE[role] ?? [];

  const [receiverId, setReceiverId] = useState("");
  const [receiverType, setReceiverType] = useState(
    receiverTypeOptions[0]?.value ?? "DISTRIBUTOR"
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    dispatch(clearTransferError());
    if (role === "md") {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
    } else if (role === "dd") {
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    } else {
      dispatch(fetchDistributors({ page: 1, limit: 100 }));
      dispatch(fetchRetailers({ page: 1, limit: 100 }));
    }
  }, [dispatch, open, role]);

  const receiverOptions = useMemo(() => {
    if (receiverType === "DISTRIBUTOR") {
      return distributors
        .filter((d) => d.status === "active")
        .map((d) => ({
          id: d.id,
          label: `${d.name} · ${d.mobile || d.email}`,
        }));
    }
    if (receiverType === "RETAILER") {
      return retailers
        .filter((r) => r.status === "active")
        .map((r) => ({
          id: r.id,
          label: `${r.name} · ${r.mobile || r.email}`,
        }));
    }
    return [];
  }, [distributors, retailers, receiverType]);

  const resetForm = useCallback(() => {
    setReceiverId("");
    setAmount("");
    setDescription("");
    setErrors({});
    setReceiverType(receiverTypeOptions[0]?.value ?? "DISTRIBUTOR");
  }, [receiverTypeOptions]);

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!receiverId) nextErrors.receiverId = "Select receiver";
    if (!amount || Number(amount) <= 0) {
      nextErrors.amount = "Enter amount greater than 0";
    }
    if (Number(amount) > wallet.availableBalance) {
      nextErrors.amount = "Insufficient available balance";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [amount, receiverId, wallet.availableBalance]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (transfer.loading) return;
    if (!validate()) return;

    const action = await dispatch(
      transferWalletBalance({
        receiverId,
        amount: Number(amount),
        description: description.trim() || "Wallet Transfer",
        role,
      })
    );

    if (transferWalletBalance.fulfilled.match(action)) {
      toast.success("Balance transferred successfully");
      onOpenChange(false);
      resetForm();
      dispatch(fetchWalletBalance({ role }));
      dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
      return;
    }

    toast.error(
      typeof action.payload === "string" ? action.payload : "Transfer failed"
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!transfer.loading) {
          onOpenChange(next);
          if (!next) resetForm();
        }
      }}
    >
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-[#1565d8]" />
            Transfer Balance
          </DialogTitle>
          <DialogDescription>
            Available:{" "}
            <span className="font-semibold text-emerald-600">
              {formatCurrency(wallet.availableBalance)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {receiverTypeOptions.length > 1 && (
            <div className="space-y-2">
              <Label>Receiver Type</Label>
              <Select
                value={receiverType}
                onValueChange={(value) => {
                  setReceiverType(value);
                  setReceiverId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select receiver type" />
                </SelectTrigger>
                <SelectContent>
                  {receiverTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Receiver</Label>
            <Select value={receiverId} onValueChange={setReceiverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select receiver" />
              </SelectTrigger>
              <SelectContent>
                {receiverOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.label}
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

          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              placeholder="Wallet Transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={transfer.loading}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#1565d8] focus:ring-1 focus:ring-[#1565d8] disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {transfer.error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {transfer.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={transfer.loading}>
            {transfer.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              "Transfer Balance"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TransferBalanceTrigger({ role }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="gap-2 shadow-md"
        onClick={() => setOpen(true)}
      >
        <ArrowLeftRight className="h-4 w-4" />
        Transfer Balance
      </Button>
      <TransferBalanceModal role={role} open={open} onOpenChange={setOpen} />
    </>
  );
}

export default memo(TransferBalanceTrigger);
export { TransferBalanceModal };
