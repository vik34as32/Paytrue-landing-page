"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
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
import OperatorSelect from "@/components/retailer/OperatorSelect";
import type { OperatorServiceType } from "@/src/lib/operatorLogos";
import { useWalletStore, selectRetailerDisplayBalance } from "@/features/retailer/store/walletStore";
import {
  validateRetailerWalletBalance,
  refreshRetailerWalletData,
} from "@/features/retailer/utils/walletValidation";
import { formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const billSchema = z.object({
  provider: z.string().min(1, "Select provider"),
  consumerId: z.string().min(4, "Enter valid consumer ID"),
  amount: z.number({ error: "Enter valid amount" }).min(1, "Minimum amount is ₹1"),
});

type BillForm = z.infer<typeof billSchema>;

interface UtilityBillPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  providers: string[];
  serviceType?: OperatorServiceType;
  consumerLabel?: string;
  backHref?: string;
  providerLabel?: string;
}

export default function UtilityBillPage({
  title,
  description,
  icon: Icon,
  providers,
  serviceType = "mobile",
  consumerLabel = "Consumer ID",
  backHref = "/rt/retailer",
  providerLabel = "Provider",
}: UtilityBillPageProps) {
  const [successOpen, setSuccessOpen] = useState(false);
  const [txnId, setTxnId] = useState("");

  const balance = useWalletStore(selectRetailerDisplayBalance);
  const debit = useWalletStore((s) => s.debit);

  const form = useForm<BillForm>({
    resolver: zodResolver(billSchema),
    defaultValues: { provider: "", consumerId: "", amount: undefined },
  });

  const providerValue = form.watch("provider");

  const onSubmit = (data: BillForm) => {
    if (!validateRetailerWalletBalance(data.amount)) return;

    const success = debit(
      data.amount,
      `${title} - ${data.provider} (${data.consumerId})`
    );

    if (!success) return;

    refreshRetailerWalletData();
    setTxnId(`bill_${Date.now()}`);
    setSuccessOpen(true);
    form.reset();
  };

  return (
    <div className="w-full max-w-none space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#001F5B]">{title}</h1>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pay Bill</CardTitle>
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
            className="w-full space-y-4"
          >
            <div className="grid w-full gap-4 lg:grid-cols-3">
            <OperatorSelect
              operators={providers}
              value={providerValue}
              onChange={(value) =>
                form.setValue("provider", value, { shouldValidate: true })
              }
              serviceType={serviceType}
              label={providerLabel}
              placeholder="Select provider"
              id="provider-select"
              error={form.formState.errors.provider?.message}
            />

            <div className="space-y-2">
              <Label>{consumerLabel}</Label>
              <Input
                placeholder={`Enter ${consumerLabel.toLowerCase()}`}
                {...form.register("consumerId")}
              />
              {form.formState.errors.consumerId && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.consumerId.message}
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
            </div>

            <Button type="submit" className="w-full lg:w-auto lg:min-w-[200px]">
              Pay Now
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle>Payment Successful!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Transaction ID: <span className="font-mono">{txnId}</span>
          </p>
          <p className="text-sm">
            New Balance:{" "}
            <span className="font-bold text-emerald-600">
              {formatCurrency(balance)}
            </span>
          </p>
          <Button onClick={() => setSuccessOpen(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
