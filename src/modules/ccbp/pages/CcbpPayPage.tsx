"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MPIN_LENGTH } from "@/features/mpin";
import {
  validateRetailerWalletBalance,
  refreshRetailerWalletData,
} from "@/features/retailer/utils/walletValidation";
import CcbpAmountStep from "../components/CcbpAmountStep";
import CcbpCardStep from "../components/CcbpCardStep";
import CcbpConfirmStep from "../components/CcbpConfirmStep";
import CcbpLiveCard from "../components/CcbpLiveCard";
import CcbpNetworkMark from "../components/CcbpNetworkMark";
import CcbpStepper from "../components/CcbpStepper";
import {
  CCBP_STEP_FIELDS,
  CCBP_STEPS,
  ccbpFormSchema,
  type CcbpFormValues,
  type CcbpStep,
} from "../lib/ccbp-form-schema";
import { detectCardNetwork, detectIssuerFromBin, networkLabel } from "../lib/ccbp-bin";
import { getCcbpIssuer } from "../lib/ccbp-issuers";
import { payCreditCardBill } from "../lib/ccbp-service";
import { formatInr } from "../lib/ccbp-normalizers";
import type { CcbpPaymentType } from "../types";

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 28 : -28, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -28 : 28, opacity: 0 }),
};

export default function CcbpPayPage() {
  const router = useRouter();
  const [step, setStep] = useState<CcbpStep>("card");
  const [direction, setDirection] = useState(1);
  const [mpin, setMpin] = useState("");
  const [paying, setPaying] = useState(false);

  const form = useForm<CcbpFormValues>({
    resolver: zodResolver(ccbpFormSchema),
    mode: "onBlur",
    defaultValues: {
      issuerId: "",
      ifscCode: "",
      creditCardNumber: "",
      payeeName: "",
      payeeMobile: "",
      payeeEmail: "",
      amount: undefined,
      paymentType: "IMPS",
      remarks: "",
    },
  });

  const issuerId = form.watch("issuerId");
  const cardRaw = form.watch("creditCardNumber");
  const name = form.watch("payeeName");
  const amount = form.watch("amount");
  const paymentType = form.watch("paymentType") as CcbpPaymentType;
  const ifscCode = form.watch("ifscCode");
  const detected = useMemo(() => detectIssuerFromBin(cardRaw || ""), [cardRaw]);
  const issuer = getCcbpIssuer(issuerId);
  const network = detectCardNetwork(cardRaw || "");

  const goTo = (next: CcbpStep) => {
    const from = CCBP_STEPS.indexOf(step);
    const to = CCBP_STEPS.indexOf(next);
    setDirection(to >= from ? 1 : -1);
    setStep(next);
  };

  const applyIssuer = (id: string) => {
    const next = getCcbpIssuer(id);
    form.setValue("issuerId", id, { shouldValidate: true });
    const current = form.getValues("ifscCode") || "";
    if (next && (!current || current.length < 11 || !current.startsWith(next.ifscPrefix))) {
      form.setValue("ifscCode", `${next.ifscPrefix}0`);
    }
  };

  const onCardNumber = (value: string) => {
    form.setValue("creditCardNumber", value, { shouldValidate: true, shouldDirty: true });
    const match = detectIssuerFromBin(value);
    if (match) {
      applyIssuer(match.id);
    }
  };

  const goNext = async () => {
    if (step === "confirm") return;
    const fields = CCBP_STEP_FIELDS[step];
    const valid = await form.trigger(fields);
    if (!valid) return;
    if (step === "amount") {
      const payable = Number(form.getValues("amount") || 0);
      if (!validateRetailerWalletBalance(payable)) return;
    }
    const index = CCBP_STEPS.indexOf(step);
    goTo(CCBP_STEPS[index + 1]);
  };

  const goBack = () => {
    const index = CCBP_STEPS.indexOf(step);
    if (index === 0) return;
    goTo(CCBP_STEPS[index - 1]);
  };

  const onPay = async () => {
    const values = form.getValues();
    if (mpin.length !== MPIN_LENGTH) {
      toast.error("Enter your 4-digit MPIN");
      return;
    }
    if (!validateRetailerWalletBalance(values.amount)) return;
    setPaying(true);
    try {
      const txn = await payCreditCardBill({
        ifscCode: values.ifscCode,
        amount: values.amount,
        payeeName: values.payeeName,
        payeeMobile: values.payeeMobile,
        payeeEmail: values.payeeEmail,
        remarks: values.remarks || undefined,
        paymentType: values.paymentType,
        creditCardNumber: values.creditCardNumber,
        mpin,
      });
      await refreshRetailerWalletData();
      toast.success(txn.status === "SUCCESS" ? "Bill paid successfully" : `Payment ${txn.status.toLowerCase()}`);
      router.push(`/rt/retailer/credit-card/receipt/${encodeURIComponent(txn.reference)}?success=1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-4">
        <CcbpLiveCard issuer={issuer} cardNumber={cardRaw || ""} name={name} amount={Number(amount) || 0} />
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Detected card
          </p>
          <div className="mt-2 flex items-center gap-2">
            <CcbpNetworkMark network={network} className="text-[#1a1f71]" />
            <p className="text-sm font-semibold text-[#0b1f3a]">
              {network === "UNKNOWN" ? "Type the card number" : networkLabel(network)}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {issuer
              ? `${issuer.name} — ${detected?.id === issuer.id ? "matched from BIN" : "selected by retailer"}`
              : "Bank appears automatically after 6 digits, or pick from the full issuer list."}
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Encrypted payload • MPIN gated
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <CcbpStepper step={step} onJump={(next) => goTo(next)} />
        </div>

        <div className="relative min-h-[420px] px-5 py-6 sm:px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "card" ? (
                <CcbpCardStep
                  form={form}
                  issuer={issuer}
                  cardRaw={cardRaw || ""}
                  detected={detected}
                  onIssuer={applyIssuer}
                  onCardNumber={onCardNumber}
                />
              ) : null}
              {step === "amount" ? <CcbpAmountStep form={form} paymentType={paymentType} /> : null}
              {step === "confirm" && issuer ? (
                <CcbpConfirmStep
                  issuer={issuer}
                  cardNumber={String(cardRaw || "")}
                  name={name}
                  amount={Number(amount) || 0}
                  paymentType={paymentType}
                  ifscCode={ifscCode}
                  mpin={mpin}
                  paying={paying}
                  onMpin={setMpin}
                  onBack={goBack}
                  onPay={() => void onPay()}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        {step !== "confirm" ? (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-3"
              disabled={step === "card"}
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {Number(amount) > 0 ? (
                <span className="hidden text-sm font-semibold tabular-nums text-slate-500 sm:inline">
                  {formatInr(Number(amount))}
                </span>
              ) : null}
              <Button
                type="button"
                className="h-11 min-w-[140px] rounded-xl bg-[#0b1f3a] font-semibold hover:bg-[#132a4a]"
                onClick={() => void goNext()}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
