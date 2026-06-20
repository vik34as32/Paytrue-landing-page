"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Plus,
  Send,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
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
import { useWalletStore } from "@/features/retailer/store/walletStore";
import { useRetailerStore } from "@/features/retailer/store/retailerStore";
import { BANK_LIST } from "@/features/retailer/services/dmt";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

const beneficiarySchema = z
  .object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name too long"),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
    bankName: z.string().min(1, "Select a bank"),
    accountNumber: z
      .string()
      .regex(/^\d{9,18}$/, "Account number must be 9-18 digits"),
    confirmAccountNumber: z.string(),
    ifscCode: z
      .string()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

const transferSchema = z.object({
  beneficiaryId: z.string().min(1, "Select a beneficiary"),
  amount: z
    .number({ error: "Enter valid amount" })
    .min(1, "Minimum amount is ₹1")
    .max(50000, "Maximum amount is ₹50,000"),
  remark: z.string().max(100, "Remark too long").optional(),
});

type BeneficiaryForm = z.infer<typeof beneficiarySchema>;
type TransferForm = z.infer<typeof transferSchema>;

const STEPS = [
  { id: 1, label: "Beneficiaries", icon: Users },
  { id: 2, label: "Add Beneficiary", icon: UserPlus },
  { id: 3, label: "Transfer Money", icon: Send },
];

export default function DMTPage() {
  const [step, setStep] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);
  const [lastTransfer, setLastTransfer] = useState<{
    amount: number;
    name: string;
    txnId: string;
  } | null>(null);

  const beneficiaries = useRetailerStore((s) => s.beneficiaries);
  const addBeneficiary = useRetailerStore((s) => s.addBeneficiary);
  const removeBeneficiary = useRetailerStore((s) => s.removeBeneficiary);
  const addDMTTransfer = useRetailerStore((s) => s.addDMTTransfer);

  const balance = useWalletStore((s) => s.retailerWallet);
  const debit = useWalletStore((s) => s.debit);

  const beneficiaryForm = useForm<BeneficiaryForm>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      mobile: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
    },
  });

  const transferForm = useForm<TransferForm>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      beneficiaryId: "",
      amount: undefined,
      remark: "",
    },
  });

  const onAddBeneficiary = (data: BeneficiaryForm) => {
    addBeneficiary({
      name: data.name,
      mobile: data.mobile,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      ifscCode: data.ifscCode.toUpperCase(),
    });
    beneficiaryForm.reset();
    setStep(1);
  };

  const onTransfer = (data: TransferForm) => {
    const beneficiary = beneficiaries.find(
      (b) => b.id === data.beneficiaryId
    );
    if (!beneficiary) return;

    const success = debit(
      data.amount,
      `DMT to ${beneficiary.name} - ${data.remark || "Money Transfer"}`
    );

    if (!success) {
      transferForm.setError("amount", {
        message: "Insufficient wallet balance",
      });
      return;
    }

    const transfer = addDMTTransfer({
      beneficiaryId: beneficiary.id,
      beneficiaryName: beneficiary.name,
      amount: data.amount,
      remark: data.remark || "Money Transfer",
    });

    setLastTransfer({
      amount: data.amount,
      name: beneficiary.name,
      txnId: transfer.id,
    });
    transferForm.reset();
    setSuccessOpen(true);
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/rt/retailer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[#001F5B]">
            Domestic Money Transfer
          </h1>
          <p className="text-sm text-slate-500">
            Send money securely to any bank account
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;

          return (
            <div key={s.id} className="flex items-center gap-2">
              <button
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  isActive
                    ? "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] text-white shadow-lg"
                    : isDone
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />
              )}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Beneficiary List</CardTitle>
              <CardDescription>
                Select or manage your saved beneficiaries
              </CardDescription>
            </div>
            <Button onClick={() => setStep(2)} size="sm">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {beneficiaries.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No beneficiaries added yet
              </p>
            ) : (
              beneficiaries.map((ben) => (
                <div
                  key={ben.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                >
                  <div>
                    <p className="font-semibold text-slate-800">{ben.name}</p>
                    <p className="text-xs text-slate-500">
                      {ben.bankName} • {ben.accountNumber.slice(-4).padStart(ben.accountNumber.length, "•")} • {ben.ifscCode}
                    </p>
                    <p className="text-xs text-slate-400">{ben.mobile}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        transferForm.setValue("beneficiaryId", ben.id);
                        setStep(3);
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 text-red-500 hover:text-red-600"
                      onClick={() => removeBeneficiary(ben.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Add Beneficiary</CardTitle>
            <CardDescription>
              Enter beneficiary bank details for money transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={beneficiaryForm.handleSubmit(onAddBeneficiary)}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Beneficiary Name</Label>
                  <Input
                    placeholder="Enter full name"
                    {...beneficiaryForm.register("name")}
                  />
                  {beneficiaryForm.formState.errors.name && (
                    <p className="text-xs text-red-500">
                      {beneficiaryForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    placeholder="10-digit mobile"
                    maxLength={10}
                    {...beneficiaryForm.register("mobile")}
                  />
                  {beneficiaryForm.formState.errors.mobile && (
                    <p className="text-xs text-red-500">
                      {beneficiaryForm.formState.errors.mobile.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Select
                  onValueChange={(v) =>
                    beneficiaryForm.setValue("bankName", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANK_LIST.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {beneficiaryForm.formState.errors.bankName && (
                  <p className="text-xs text-red-500">
                    {beneficiaryForm.formState.errors.bankName.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="Enter account number"
                    {...beneficiaryForm.register("accountNumber")}
                  />
                  {beneficiaryForm.formState.errors.accountNumber && (
                    <p className="text-xs text-red-500">
                      {beneficiaryForm.formState.errors.accountNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm Account Number</Label>
                  <Input
                    placeholder="Re-enter account number"
                    {...beneficiaryForm.register("confirmAccountNumber")}
                  />
                  {beneficiaryForm.formState.errors.confirmAccountNumber && (
                    <p className="text-xs text-red-500">
                      {
                        beneficiaryForm.formState.errors.confirmAccountNumber
                          .message
                      }
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>IFSC Code</Label>
                <Input
                  placeholder="e.g. SBIN0001234"
                  className="uppercase"
                  {...beneficiaryForm.register("ifscCode", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
                {beneficiaryForm.formState.errors.ifscCode && (
                  <p className="text-xs text-red-500">
                    {beneficiaryForm.formState.errors.ifscCode.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <UserPlus className="h-4 w-4" />
                  Add Beneficiary
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Transfer Money</CardTitle>
            <CardDescription>
              Current Wallet Balance:{" "}
              <span className="font-bold text-emerald-600">
                {formatCurrency(balance)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={transferForm.handleSubmit(onTransfer)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Beneficiary</Label>
                <Select
                  value={transferForm.watch("beneficiaryId")}
                  onValueChange={(v) =>
                    transferForm.setValue("beneficiaryId", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select beneficiary" />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiaries.map((ben) => (
                      <SelectItem key={ben.id} value={ben.id}>
                        {ben.name} — {ben.bankName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {transferForm.formState.errors.beneficiaryId && (
                  <p className="text-xs text-red-500">
                    {transferForm.formState.errors.beneficiaryId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  {...transferForm.register("amount", {
                    valueAsNumber: true,
                  })}
                />
                {transferForm.formState.errors.amount && (
                  <p className="text-xs text-red-500">
                    {transferForm.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Remark (Optional)</Label>
                <Input
                  placeholder="Payment remark"
                  {...transferForm.register("remark")}
                />
              </div>

              <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                <p className="text-sm text-slate-600">
                  Available Balance:{" "}
                  <span className="text-lg font-bold text-emerald-700">
                    {formatCurrency(balance)}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  <Send className="h-4 w-4" />
                  Transfer Money
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl">
              Transfer Successful!
            </DialogTitle>
            <DialogDescription>
              Money has been transferred successfully
            </DialogDescription>
          </DialogHeader>
          {lastTransfer && (
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Beneficiary</span>
                <span className="font-semibold">{lastTransfer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-bold text-emerald-600">
                  {formatCurrency(lastTransfer.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID</span>
                <span className="font-mono text-xs">{lastTransfer.txnId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">New Balance</span>
                <span className="font-bold">{formatCurrency(balance)}</span>
              </div>
            </div>
          )}
          <Button onClick={() => setSuccessOpen(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
