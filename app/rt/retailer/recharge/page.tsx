"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Smartphone } from "lucide-react";
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
import {
  MOBILE_OPERATORS,
  DTH_OPERATORS,
} from "@/features/retailer/services/recharge";
import { formatCurrency } from "@/lib/utils";

const rechargeSchema = z.object({
  type: z.enum(["mobile", "dth", "fastag"]),
  operator: z.string().min(1, "Select operator"),
  number: z.string().min(5, "Enter valid number"),
  amount: z.number({ error: "Enter valid amount" }).min(1, "Minimum amount is ₹1"),
});

type RechargeForm = z.infer<typeof rechargeSchema>;

export default function RechargePage() {
  const [successOpen, setSuccessOpen] = useState(false);
  const [txnId, setTxnId] = useState("");

  const balance = useWalletStore((s) => s.retailerWallet);
  const debit = useWalletStore((s) => s.debit);

  const form = useForm<RechargeForm>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: { type: "mobile", operator: "", number: "", amount: undefined },
  });

  const rechargeType = form.watch("type");

  const operators =
    rechargeType === "dth"
      ? DTH_OPERATORS
      : rechargeType === "fastag"
        ? [{ id: "fastag", name: "FASTag", type: "fastag" as const }]
        : MOBILE_OPERATORS;

  const onSubmit = (data: RechargeForm) => {
    const success = debit(
      data.amount,
      `${data.type.toUpperCase()} Recharge - ${data.number}`
    );

    if (!success) {
      form.setError("amount", { message: "Insufficient wallet balance" });
      return;
    }

    setTxnId(`rch_${Date.now()}`);
    setSuccessOpen(true);
    form.reset({ type: data.type });
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/rt/retailer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-lg">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#001F5B]">Recharge</h1>
            <p className="text-sm text-slate-500">
              Mobile, DTH & Fastag Recharge
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["mobile", "dth", "fastag"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              form.setValue("type", t);
              form.setValue("operator", "");
            }}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition ${
              rechargeType === t
                ? "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] text-white shadow-lg"
                : "bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            }`}
          >
            {t === "fastag" ? "FASTag" : t}
          </button>
        ))}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {rechargeType === "mobile"
              ? "Mobile Recharge"
              : rechargeType === "dth"
                ? "DTH Recharge"
                : "FASTag Recharge"}
          </CardTitle>
          <CardDescription>
            Balance:{" "}
            <span className="font-bold text-emerald-600">
              {formatCurrency(balance)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid w-full gap-4 lg:grid-cols-3"
          >
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select onValueChange={(v) => form.setValue("operator", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((op) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.operator && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.operator.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                {rechargeType === "fastag" ? "Vehicle Number" : "Number"}
              </Label>
              <Input
                placeholder={
                  rechargeType === "mobile"
                    ? "10-digit mobile number"
                    : rechargeType === "dth"
                      ? "DTH customer ID"
                      : "Vehicle registration number"
                }
                {...form.register("number")}
              />
              {form.formState.errors.number && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="lg:col-span-3">
            <Button type="submit" className="w-full sm:w-auto sm:min-w-[200px]">
              Recharge Now
            </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle>Recharge Successful!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Transaction ID: <span className="font-mono">{txnId}</span>
          </p>
          <Button onClick={() => setSuccessOpen(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
