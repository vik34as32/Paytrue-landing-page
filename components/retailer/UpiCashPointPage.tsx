"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  IndianRupee,
  MapPin,
  QrCode,
  Smartphone,
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
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getCurrentLocation } from "@/src/lib/rdService";
import {
  fetchUpiAtmStatus,
  generateUpiAtmQr,
} from "@/src/services/upiAtmService";
import {
  formatUpiAtmError,
  isUpiAtmSuccessStatus,
  isUpiAtmTerminalStatus,
  normalizeUpiAtmStatus,
} from "@/src/lib/upiAtmUtils";
import type { UpiAtmTransaction } from "@/src/types/upiAtm";
import UpiAtmQrModal from "@/components/retailer/UpiAtmQrModal";
import UpiAtmReceiptModal from "@/components/retailer/UpiAtmReceiptModal";

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 100;

const schema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
  amount: z.coerce.number().min(1, "Minimum amount is ₹1").max(50000, "Maximum amount is ₹50,000"),
});

type UpiCashPointForm = z.infer<typeof schema>;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function UpiCashPointPage() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<"pending" | "ready" | "unavailable">(
    "pending"
  );
  const [qrOpen, setQrOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [activeTransaction, setActiveTransaction] = useState<UpiAtmTransaction | null>(null);
  const [receiptTransaction, setReceiptTransaction] = useState<UpiAtmTransaction | null>(null);
  const [polling, setPolling] = useState(false);
  const [statusLabel, setStatusLabel] = useState("Waiting for customer payment...");
  const pollTokenRef = useRef(0);

  const form = useForm<UpiCashPointForm>({
    resolver: zodResolver(schema) as Resolver<UpiCashPointForm>,
    defaultValues: { mobile: "", amount: undefined as unknown as number },
  });

  const amountValue = form.watch("amount");

  useEffect(() => {
    let active = true;
    setLocationStatus("pending");
    getCurrentLocation()
      .then(() => {
        if (active) setLocationStatus("ready");
      })
      .catch(() => {
        if (active) setLocationStatus("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  const stopPolling = useCallback(() => {
    pollTokenRef.current += 1;
    setPolling(false);
  }, []);

  const openReceipt = useCallback(
    (transaction: UpiAtmTransaction) => {
      stopPolling();
      setQrOpen(false);
      setReceiptTransaction(transaction);
      setReceiptOpen(true);
      setActiveTransaction(null);
      form.reset();
    },
    [form, stopPolling]
  );

  const pollPaymentStatus = useCallback(
    async (referenceId: string, token: number) => {
      setPolling(true);
      setStatusLabel("Waiting for customer payment...");

      for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
        if (pollTokenRef.current !== token) return;

        await sleep(POLL_INTERVAL_MS);
        if (pollTokenRef.current !== token) return;

        try {
          const result = await fetchUpiAtmStatus(referenceId);
          const status = normalizeUpiAtmStatus(result.transaction.status);
          setActiveTransaction((prev) => ({ ...(prev || {}), ...result.transaction }));

          if (isUpiAtmSuccessStatus(status)) {
            openReceipt(result.transaction);
            return;
          }

          if (isUpiAtmTerminalStatus(status)) {
            openReceipt(result.transaction);
            return;
          }

          setStatusLabel(`Waiting for payment... (${status})`);
        } catch (pollError) {
          const message =
            (pollError as { message?: string })?.message || "Unable to check payment status.";
          setStatusLabel(message);
        }
      }

      setPolling(false);
      setError("Payment timeout. Please verify status from history or retry.");
      setQrOpen(false);
    },
    [openReceipt]
  );

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  const onSubmit = async (data: UpiCashPointForm) => {
    setError(null);
    setSubmitting(true);
    stopPolling();

    try {
      const result = await generateUpiAtmQr({
        mobile: data.mobile,
        amount: data.amount,
      });

      const referenceId = result.transaction.referenceId;
      if (!referenceId) {
        throw new Error("Reference ID missing in QR response.");
      }

      const transaction: UpiAtmTransaction = {
        ...result.transaction,
        mobile: result.transaction.mobile || data.mobile,
        amount: result.transaction.amount ?? data.amount,
        status: normalizeUpiAtmStatus(result.transaction.status || "PENDING"),
      };

      setActiveTransaction(transaction);
      setQrOpen(true);

      const token = pollTokenRef.current;
      void pollPaymentStatus(referenceId, token);
    } catch (err) {
      setError(formatUpiAtmError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiptClose = () => {
    setReceiptOpen(false);
    setReceiptTransaction(null);
    setError(null);
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 text-white shadow-lg">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#0b1f3a] sm:text-2xl">UPI Cash Point</h1>
            <p className="text-sm text-slate-500">Generate QR and collect cash via UPI ATM</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Enter customer mobile and amount. QR will be generated for payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mobile">Customer Mobile</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="pl-10"
                    disabled={submitting || qrOpen}
                    {...form.register("mobile")}
                  />
                </div>
                {form.formState.errors.mobile ? (
                  <p className="text-sm text-red-500">{form.formState.errors.mobile.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="amount"
                    type="number"
                    min={1}
                    placeholder="Enter amount"
                    className="pl-10"
                    disabled={submitting || qrOpen}
                    {...form.register("amount")}
                  />
                </div>
                {form.formState.errors.amount ? (
                  <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={submitting || qrOpen}
                    onClick={() =>
                      form.setValue("amount", value, { shouldValidate: true, shouldDirty: true })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                      Number(amountValue) === value
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
                    )}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                  locationStatus === "ready"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : locationStatus === "pending"
                      ? "border-blue-200 bg-blue-50 text-blue-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                )}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  {locationStatus === "pending"
                    ? "Fetching your location for compliance (not shown on screen)..."
                    : locationStatus === "ready"
                      ? "Location ready. Latitude and longitude will be included in the request."
                      : "Location unavailable. Fallback coordinates will be used securely."}
                </p>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                className="h-11 w-full bg-violet-600 text-base font-semibold hover:bg-violet-700"
                disabled={submitting || qrOpen}
              >
                {submitting ? "Generating QR..." : "Generate UPI QR"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>1. Enter customer mobile number and collection amount.</p>
            <p>2. System generates a dynamic UPI QR for payment.</p>
            <p>3. Customer scans and pays — receipt opens automatically on success.</p>
            {activeTransaction?.amount ? (
              <div className="rounded-xl bg-violet-50 p-3 text-violet-900">
                Active amount: {formatCurrency(Number(activeTransaction.amount))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <UpiAtmQrModal
        open={qrOpen}
        transaction={activeTransaction}
        polling={polling}
        statusLabel={statusLabel}
      />

      <UpiAtmReceiptModal
        open={receiptOpen}
        transaction={receiptTransaction}
        onClose={handleReceiptClose}
      />
    </div>
  );
}
