"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MPIN_LENGTH } from "@/features/mpin";
import { useRetailerWallet } from "@/features/retailer/hooks/useRetailerWallet";
import {
  refreshRetailerWalletData,
  validateRetailerWalletBalance,
} from "@/features/retailer/utils/walletValidation";
import { selectUser } from "@/src/redux/slices/authSlice";
import UpiAmountStep from "../components/UpiAmountStep";
import UpiConfirmStep from "../components/UpiConfirmStep";
import UpiPayeeStep from "../components/UpiPayeeStep";
import UpiPayoutStepper, {
  UPI_PAYOUT_STEPS,
  type UpiPayoutStep,
} from "../components/UpiPayoutStepper";
import UpiProcessingOverlay from "../components/UpiProcessingOverlay";
import UpiTransferCard from "../components/UpiTransferCard";
import {
  formatInr,
  isValidPayeeEmail,
  isValidPayeeMobile,
  isValidVpa,
  normalizeVpaInput,
  UPI_PAYOUT_DEFAULT_REMARKS,
  UPI_PAYOUT_MAX_AMOUNT,
  UPI_PAYOUT_MIN_AMOUNT,
} from "../lib/upi-payout-normalizers";
import { payUpiPayout, previewUpiPayout, verifyUpiId } from "../lib/upi-payout-service";
import type { UpiPayoutPreview, UpiVerification } from "../types";

const slide = {
  enter: (dir: number) => ({ x: dir > 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -32 : 32, opacity: 0 }),
};

export default function UpiPayoutPage() {
  const router = useRouter();
  const { balance } = useRetailerWallet();
  const walletBalance = Number(balance) || 0;
  const user = useSelector(selectUser);
  const retailerEmail = String(user?.email ?? "").trim();

  const [step, setStep] = useState<UpiPayoutStep>("payee");
  const [direction, setDirection] = useState(1);

  const [vpa, setVpa] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [payeeMobile, setPayeeMobile] = useState("");
  const [verification, setVerification] = useState<UpiVerification | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const currentVerification =
    verification && verification.verified && verification.vpa === vpa ? verification : null;

  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [preview, setPreview] = useState<UpiPayoutPreview | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const [mpin, setMpin] = useState("");
  const [paying, setPaying] = useState(false);

  const amountValue = Number(amount) || 0;
  const payeeIssue = !isValidVpa(vpa)
    ? "Enter a valid UPI ID"
    : !currentVerification
      ? "Tap Check to verify the UPI ID"
      : payeeName.trim().length < 2
        ? "Enter beneficiary name"
        : !isValidPayeeMobile(payeeMobile)
          ? "Enter a valid 10-digit beneficiary mobile"
          : !isValidPayeeEmail(retailerEmail)
            ? "Your profile email is missing. Update your profile to send UPI payouts."
            : "";
  const payeeReady = !payeeIssue;

  const onVpaChange = (value: string) => {
    const next = normalizeVpaInput(value);
    setVpa(next);
    setVerifyError("");
    if (verification && verification.vpa !== next) {
      if (payeeName === verification.name) setPayeeName("");
      if (verification.mobile && payeeMobile === verification.mobile) setPayeeMobile("");
      setVerification(null);
    }
  };

  const onVerify = async () => {
    if (!isValidVpa(vpa) || verifying) return;
    setVerifying(true);
    setVerifyError("");
    try {
      const result = await verifyUpiId(vpa);
      if (!result.verified) {
        setVerification(null);
        setVerifyError(result.message);
        toast.error(result.message);
        return;
      }
      setVerification({ ...result, vpa });
      if (result.name) setPayeeName(result.name);
      if (result.mobile) setPayeeMobile(result.mobile);
      toast.success(result.name ? `Verified: ${result.name}` : "UPI ID verified");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to verify UPI ID";
      setVerifyError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const goTo = (next: UpiPayoutStep) => {
    setDirection(UPI_PAYOUT_STEPS.indexOf(next) >= UPI_PAYOUT_STEPS.indexOf(step) ? 1 : -1);
    setStep(next);
  };

  const validateAmount = (): boolean => {
    if (!amountValue) {
      setAmountError("Enter an amount");
      return false;
    }
    if (amountValue < UPI_PAYOUT_MIN_AMOUNT) {
      setAmountError(`Minimum ${formatInr(UPI_PAYOUT_MIN_AMOUNT)}`);
      return false;
    }
    if (amountValue > UPI_PAYOUT_MAX_AMOUNT) {
      setAmountError(`Maximum ${formatInr(UPI_PAYOUT_MAX_AMOUNT)} per transfer`);
      return false;
    }
    setAmountError("");
    return true;
  };

  const goNext = async () => {
    if (step === "payee") {
      if (!payeeReady) {
        toast.error(payeeIssue);
        return;
      }
      goTo("amount");
      return;
    }
    if (step === "amount") {
      if (!validateAmount()) return;
      setPreview(null);
      setPreviewing(true);
      let quote: UpiPayoutPreview | null = null;
      try {
        quote = await previewUpiPayout(amountValue);
      } catch {
        quote = null;
      } finally {
        setPreviewing(false);
      }
      if (quote?.sufficient === false) {
        toast.error("Insufficient wallet balance for amount + charges");
        return;
      }
      if (!validateRetailerWalletBalance(quote?.totalDebit || amountValue)) return;
      setPreview(quote);
      setMpin("");
      goTo("confirm");
    }
  };

  const goBack = () => {
    const index = UPI_PAYOUT_STEPS.indexOf(step);
    if (index > 0) goTo(UPI_PAYOUT_STEPS[index - 1]);
  };

  const canJump = (target: UpiPayoutStep) => {
    if (target === "payee") return true;
    if (target === "amount") return payeeReady;
    return false;
  };

  const onPay = async () => {
    if (mpin.length !== MPIN_LENGTH) {
      toast.error("Enter your 4-digit MPIN");
      return;
    }
    if (!validateRetailerWalletBalance(preview?.totalDebit || amountValue)) return;
    setPaying(true);
    try {
      const txn = await payUpiPayout({
        vpa,
        payeeName,
        payeeMobile,
        payeeEmail: retailerEmail,
        remarks: UPI_PAYOUT_DEFAULT_REMARKS,
        amount: amountValue,
        mpin,
      });
      void refreshRetailerWalletData();
      if (!txn.reference) {
        toast.error("Payout submitted but no reference was returned. Check history.");
        router.push("/rt/retailer/upi-payout/history");
        return;
      }
      if (txn.status === "FAILED" || txn.status === "REFUNDED" || txn.status === "REVERSED") {
        toast.error(txn.message || "UPI payout failed. Amount reversed to wallet.");
      } else {
        toast.info("Payout initiated. Checking status…");
      }
      router.push(`/rt/retailer/upi-payout/receipt/${encodeURIComponent(txn.reference)}?new=1`);
    } catch (error) {
      setMpin("");
      toast.error(error instanceof Error ? error.message : "UPI payout failed");
      setPaying(false);
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]">
      <aside className="space-y-4 lg:sticky lg:top-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <UpiTransferCard
            vpa={vpa}
            payeeName={payeeName}
            ready={payeeReady}
            amount={amountValue}
            walletBalance={walletBalance}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="grid grid-cols-2 gap-2"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <Zap className="h-4 w-4 text-amber-500" />
            <p className="mt-1.5 text-xs font-bold text-[#0a1630]">Instant credit</p>
            <p className="text-[11px] text-slate-500">24×7, including holidays</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <RotateCcw className="h-4 w-4 text-emerald-600" />
            <p className="mt-1.5 text-xs font-bold text-[#0a1630]">Auto reversal</p>
            <p className="text-[11px] text-slate-500">Failed transfers refund wallet</p>
          </div>
        </motion.div>
      </aside>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.35)]"
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <UpiPayoutStepper step={step} canJump={canJump} onJump={goTo} />
        </div>

        <div className="relative min-h-[440px] px-5 py-6 sm:px-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "payee" ? (
                <UpiPayeeStep
                  vpa={vpa}
                  onVpa={onVpaChange}
                  verification={currentVerification}
                  verifying={verifying}
                  verifyError={verifyError}
                  onVerify={() => void onVerify()}
                  payeeName={payeeName}
                  onPayeeName={setPayeeName}
                  payeeMobile={payeeMobile}
                  onPayeeMobile={setPayeeMobile}
                />
              ) : null}
              {step === "amount" ? (
                <UpiAmountStep
                  amount={amount}
                  onAmount={(value) => {
                    setAmount(value);
                    if (amountError) setAmountError("");
                  }}
                  walletBalance={walletBalance}
                  error={amountError}
                />
              ) : null}
              {step === "confirm" ? (
                <UpiConfirmStep
                  vpa={vpa}
                  payeeName={payeeName}
                  payeeMobile={payeeMobile}
                  amount={amountValue}
                  preview={preview}
                  mpin={mpin}
                  paying={paying}
                  onMpin={setMpin}
                  onBack={goBack}
                  onPay={() => void onPay()}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
          <UpiProcessingOverlay open={paying} amount={preview?.totalDebit || amountValue} vpa={vpa} />
        </div>

        {step !== "confirm" ? (
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className="h-11 px-3"
              disabled={step === "payee"}
              onClick={goBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {amountValue > 0 ? (
                <span className="hidden text-sm font-semibold tabular-nums text-slate-500 sm:inline">
                  {formatInr(amountValue)}
                </span>
              ) : null}
              <Button
                type="button"
                disabled={previewing || (step === "payee" && !payeeReady)}
                className="h-11 min-w-[150px] rounded-xl bg-[#0a1630] font-semibold hover:bg-[#16244a]"
                onClick={() => void goNext()}
              >
                {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Continue
                {!previewing ? <ArrowRight className="h-4 w-4" /> : null}
              </Button>
            </div>
          </div>
        ) : null}
      </motion.section>
    </div>
  );
}
