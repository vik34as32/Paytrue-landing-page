"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { StepIndicator } from "./StepIndicator";
import { VerifyCurrentMpinStep } from "./VerifyCurrentMpinStep";
import { CreateNewMpinStep } from "./CreateNewMpinStep";
import { SuccessStep } from "./SuccessStep";
import { changeMpin, mapMpinApiError, verifyMpin } from "../services/mpinApi";
import { MPIN_STATUS_QUERY_KEY } from "../hooks/useMpin";
import { isValidMpin, verifyMpinSchema } from "../schemas";

type WizardPhase = "step1" | "step2" | "success";

export interface ChangeMpinDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChangeMpinDialog({
  open: controlledOpen,
  onOpenChange,
}: ChangeMpinDialogProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [internalOpen, setInternalOpen] = useState(true);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [phase, setPhase] = useState<WizardPhase>("step1");
  const [direction, setDirection] = useState(1);
  const [oldMpin, setOldMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
  const [step1Error, setStep1Error] = useState<string>();
  const [newError, setNewError] = useState<string>();
  const [confirmError, setConfirmError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [updating, setUpdating] = useState(false);

  const resetState = () => {
    setPhase("step1");
    setDirection(1);
    setOldMpin("");
    setNewMpin("");
    setConfirmMpin("");
    setStep1Error(undefined);
    setNewError(undefined);
    setConfirmError(undefined);
    setVerifying(false);
    setUpdating(false);
  };

  useEffect(() => {
    if (!open) resetState();
  }, [open]);

  const closeAndLeave = () => {
    setOpen(false);
    resetState();
    router.push("/rt/retailer/profile");
  };

  const step1Ready = isValidMpin(oldMpin);

  const step2Ready = useMemo(() => {
    if (!isValidMpin(newMpin) || !isValidMpin(confirmMpin)) return false;
    if (newMpin === oldMpin) return false;
    if (newMpin !== confirmMpin) return false;
    return true;
  }, [newMpin, confirmMpin, oldMpin]);

  const validateStep2Live = (nextNew: string, nextConfirm: string) => {
    if (nextNew && isValidMpin(nextNew) && nextNew === oldMpin) {
      setNewError("New MPIN must be different from current MPIN");
    } else {
      setNewError(undefined);
    }

    if (nextConfirm && isValidMpin(nextNew) && nextConfirm !== nextNew) {
      if (isValidMpin(nextConfirm) || nextConfirm.length >= nextNew.length) {
        setConfirmError("MPINs do not match");
      } else {
        setConfirmError(undefined);
      }
    } else {
      setConfirmError(undefined);
    }
  };

  const handleVerifyContinue = async () => {
    const parsed = verifyMpinSchema.safeParse({ mpin: oldMpin });
    if (!parsed.success) {
      setStep1Error(parsed.error.issues[0]?.message ?? "Invalid MPIN");
      return;
    }

    setVerifying(true);
    setStep1Error(undefined);
    try {
      const result = await verifyMpin({ mpin: parsed.data.mpin });
      if (!result.verified) {
        setStep1Error(result.message || "Incorrect MPIN");
        toast.error(result.message || "Incorrect MPIN");
        return;
      }
      setDirection(1);
      setPhase("step2");
    } catch (err) {
      const message = mapMpinApiError(err, "Unable to verify MPIN");
      setStep1Error(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdate = async () => {
    validateStep2Live(newMpin, confirmMpin);
    if (!step2Ready) {
      if (newMpin === oldMpin) {
        setNewError("New MPIN must be different from current MPIN");
      }
      if (newMpin !== confirmMpin) {
        setConfirmError("MPINs do not match");
      }
      return;
    }

    setUpdating(true);
    try {
      const result = await changeMpin({
        oldMpin,
        newMpin,
        confirmMpin,
      });
      toast.success(result.message || "MPIN changed successfully");
      void queryClient.invalidateQueries({ queryKey: MPIN_STATUS_QUERY_KEY });
      setPhase("success");
      window.setTimeout(() => {
        setOpen(false);
        resetState();
        router.push("/rt/retailer/profile");
      }, 2000);
    } catch (err) {
      toast.error(mapMpinApiError(err, "Failed to change MPIN"));
    } finally {
      setUpdating(false);
    }
  };

  const busy = verifying || updating;
  const showFooter = phase !== "success";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          if (phase === "success") return;
          closeAndLeave();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogContent
        className={cn(
          "w-[calc(100%-1.5rem)] max-w-[440px] gap-0 overflow-hidden border-0 p-0 shadow-2xl sm:rounded-3xl",
          "bg-white/95 backdrop-blur-xl",
          "[&>button]:right-4 [&>button]:top-4 [&>button]:text-white/90 [&>button]:hover:bg-white/15 [&>button]:hover:text-white"
        )}
        onPointerDownOutside={(e) => {
          if (phase === "success" || busy) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (phase === "success" || busy) e.preventDefault();
        }}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-[#001F5B] via-[#0d47a1] to-[#1565d8] px-5 pb-5 pt-6 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 left-8 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl" />

          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur-md ring-1 ring-white/20">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-extrabold tracking-tight text-white">
              Change MPIN
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-blue-100/90">
              Securely update your authorization PIN
            </DialogDescription>

            {phase !== "success" ? (
              <div className="mt-5">
                <StepIndicator currentStep={phase === "step1" ? 1 : 2} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="relative px-5 pb-0 pt-5">
          <div className="relative min-h-[220px] overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              {phase === "step1" ? (
                <motion.div
                  key="step1"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <VerifyCurrentMpinStep
                    value={oldMpin}
                    onChange={(v) => {
                      setOldMpin(v);
                      setStep1Error(undefined);
                    }}
                    error={step1Error}
                    disabled={busy}
                  />
                </motion.div>
              ) : null}

              {phase === "step2" ? (
                <motion.div
                  key="step2"
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 28 : -28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -28 : 28 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <CreateNewMpinStep
                    newMpin={newMpin}
                    confirmMpin={confirmMpin}
                    onNewChange={(v) => {
                      setNewMpin(v);
                      validateStep2Live(v, confirmMpin);
                    }}
                    onConfirmChange={(v) => {
                      setConfirmMpin(v);
                      validateStep2Live(newMpin, v);
                    }}
                    newError={newError}
                    confirmError={confirmError}
                    disabled={busy}
                  />
                </motion.div>
              ) : null}

              {phase === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <SuccessStep />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {showFooter ? (
          <div className="sticky bottom-0 flex gap-3 border-t border-slate-100/80 bg-white/90 px-5 py-4 backdrop-blur-md">
            {phase === "step2" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setDirection(-1);
                  setPhase("step1");
                  setNewMpin("");
                  setConfirmMpin("");
                  setNewError(undefined);
                  setConfirmError(undefined);
                }}
                className="h-[52px] flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={closeAndLeave}
                className="h-[52px] flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            )}

            {phase === "step1" ? (
              <button
                type="button"
                disabled={!step1Ready || busy}
                onClick={() => void handleVerifyContinue()}
                className={cn(
                  "inline-flex h-[52px] flex-[1.4] items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition",
                  "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] hover:scale-[1.02] active:scale-[0.99]",
                  "disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100"
                )}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            ) : (
              <button
                type="button"
                disabled={!step2Ready || busy}
                onClick={() => void handleUpdate()}
                className={cn(
                  "inline-flex h-[52px] flex-[1.4] items-center justify-center gap-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition",
                  "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] hover:scale-[1.02] active:scale-[0.99]",
                  "disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100"
                )}
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  "Update MPIN"
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="h-4" />
        )}
      </DialogContent>
    </Dialog>
  );
}
