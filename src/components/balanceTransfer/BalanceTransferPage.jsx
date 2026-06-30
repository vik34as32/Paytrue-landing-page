"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftRight } from "lucide-react";
import PageHeader from "@/src/components/common/PageHeader";
import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import SuccessModal from "@/src/components/common/SuccessModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import {
  transferBalanceToDistributor,
  transferBalanceToRetailer,
} from "@/src/redux/thunks/transactionThunk";
import { selectDistributors } from "@/src/redux/slices/distributorSlice";
import { selectRetailers } from "@/src/redux/slices/retailerSlice";
import {
  selectMdWallet,
  selectDdWallet,
} from "@/src/redux/slices/walletSlice";
import {
  selectTransactionActionLoading,
  selectTransactionError,
} from "@/src/redux/slices/transactionSlice";

export default function BalanceTransferPage({ role }) {
  const dispatch = useDispatch();
  const isMd = role === "md";
  const distributors = useSelector(selectDistributors);
  const retailers = useSelector(selectRetailers);
  const mdWallet = useSelector(selectMdWallet);
  const ddWallet = useSelector(selectDdWallet);
  const actionLoading = useSelector(selectTransactionActionLoading);
  const transactionError = useSelector(selectTransactionError);

  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const recipients = isMd
    ? distributors.filter((d) => d.status === "active")
    : retailers.filter((r) => r.status === "active");
  const balance = isMd ? mdWallet.balance : ddWallet.balance;
  const selectedRecipient = recipients.find((item) => item.id === recipientId);

  useEffect(() => {
    if (isMd) {
      dispatch(fetchDistributors());
    } else {
      dispatch(fetchRetailers());
    }
  }, [dispatch, isMd]);

  const validate = () => {
    const nextErrors = {};
    if (!recipientId) nextErrors.recipientId = "Select a recipient";
    if (!amount || Number(amount) <= 0) nextErrors.amount = "Enter valid amount";
    if (Number(amount) > balance) nextErrors.amount = "Insufficient wallet balance";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const payload = {
      amount: Number(amount),
      remark,
      ...(isMd
        ? { distributorId: recipientId }
        : { retailerId: recipientId }),
    };

    try {
      if (isMd) {
        await dispatch(transferBalanceToDistributor(payload)).unwrap();
      } else {
        await dispatch(transferBalanceToRetailer(payload)).unwrap();
      }

      setConfirmOpen(false);
      setSuccessMessage(
        `₹${Number(amount).toLocaleString("en-IN")} transferred successfully to ${selectedRecipient?.name}.`
      );
      setSuccessOpen(true);
      setRecipientId("");
      setAmount("");
      setRemark("");
    } catch (error) {
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Balance Transfer"
        description={
          isMd
            ? "Transfer wallet balance to your distributors"
            : "Transfer wallet balance to your retailers"
        }
        icon={ArrowLeftRight}
        backHref={isMd ? "/md/dashboard" : "/dd/dashboard"}
      />

      <Card>
        <CardHeader>
          <CardTitle>Transfer Funds</CardTitle>
          <CardDescription>
            Available Balance:{" "}
            <span className="font-bold text-emerald-600">
              {formatCurrency(balance)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <Label>{isMd ? "Select Distributor" : "Select Retailer"}</Label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder={isMd ? "Choose distributor" : "Choose retailer"} />
                </SelectTrigger>
                <SelectContent>
                  {recipients.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} · {formatCurrency(item.walletBalance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.recipientId && (
                <p className="text-xs text-red-500">{errors.recipientId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Remark (Optional)</Label>
              <Input
                placeholder="Add remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            {transactionError && (
              <p className="text-sm text-red-500 lg:col-span-2">{transactionError}</p>
            )}

            <div className="lg:col-span-2">
              <Button type="submit" className="w-full sm:w-auto sm:min-w-[200px]">
                Transfer Balance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ConfirmationModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Balance Transfer"
        message={`Are you sure you want to transfer ₹${Number(amount || 0).toLocaleString("en-IN")} to ${selectedRecipient?.name}?`}
        confirmLabel="Confirm Transfer"
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        loading={actionLoading}
      />

      <SuccessModal
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="Transfer Successful!"
        message={successMessage}
      />
    </div>
  );
}
