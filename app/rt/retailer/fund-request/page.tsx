"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Wallet } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";

const fundSchema = z.object({
  amount: z
    .number({ error: "Enter valid amount" })
    .min(100, "Minimum request is ₹100")
    .max(100000, "Maximum request is ₹1,00,000"),
  paymentMode: z.string().min(1, "Select payment mode"),
  remark: z.string().optional(),
});

type FundForm = z.infer<typeof fundSchema>;

export default function FundRequestPage() {
  const [successOpen, setSuccessOpen] = useState(false);
  const balance = useWalletStore((s) => s.retailerWallet);

  const form = useForm<FundForm>({
    resolver: zodResolver(fundSchema),
    defaultValues: { amount: undefined, paymentMode: "", remark: "" },
  });

  const onSubmit = () => {
    setSuccessOpen(true);
    form.reset();
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-lg">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#001F5B]">Fund Request</h1>
            <p className="text-sm text-slate-500">
              Request wallet top-up from admin
            </p>
          </div>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Request Funds</CardTitle>
          <CardDescription>
            Current Balance:{" "}
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

            <div className="space-y-2">
              <Label>Payment Mode</Label>
              <Select onValueChange={(v) => form.setValue("paymentMode", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neft">NEFT</SelectItem>
                  <SelectItem value="rtgs">RTGS</SelectItem>
                  <SelectItem value="imps">IMPS</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.paymentMode && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.paymentMode.message}
                </p>
              )}
            </div>

            <div className="space-y-2 lg:col-span-3">
              <Label>Remark (Optional)</Label>
              <Input
                placeholder="Add remark"
                {...form.register("remark")}
              />
            </div>

            <div className="lg:col-span-3">
            <Button type="submit" className="w-full sm:w-auto sm:min-w-[200px]">
              Submit Request
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
            <DialogTitle>Request Submitted!</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Your fund request has been submitted. Admin will process it shortly.
          </p>
          <Button onClick={() => setSuccessOpen(false)} className="w-full">
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
