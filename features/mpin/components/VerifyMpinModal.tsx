"use client";

import { useEffect, useState } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AnimatedMpinInput } from "./AnimatedMpinInput";
import {
  verifyMpinSchema,
  type VerifyMpinFormValues,
  MPIN_LENGTH,
} from "../schemas";
import { toMpinVerifyApiError, verifyMpin } from "../services/mpinApi";

export interface VerifyMpinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Called only after Verify MPIN API returns success — receives the verified 4-digit MPIN */
  onVerified: (mpin: string) => void | Promise<void>;
  onCancel?: () => void;
  /** Fired when backend locks the account (HTTP 403) */
  onAccountLocked?: (message: string) => void;
  cancelLabel?: string;
}

/**
 * Reusable secure MPIN verification modal (DMT IMPS/NEFT, etc.).
 * Paste disabled. Does not call downstream transfer APIs itself.
 */
export function VerifyMpinModal({
  open,
  onOpenChange,
  title = "Verify MPIN",
  description = "Enter your 4 digit MPIN to authorize this transfer.",
  onVerified,
  onCancel,
  onAccountLocked,
  cancelLabel = "Cancel Transfer",
}: VerifyMpinModalProps) {
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    getValues,
    formState: { errors },
  } = useForm<VerifyMpinFormValues>({
    resolver: zodResolver(verifyMpinSchema) as Resolver<VerifyMpinFormValues>,
    mode: "onChange",
    defaultValues: { mpin: "" },
  });

  const mpin = watch("mpin");

  useEffect(() => {
    if (!open) {
      reset({ mpin: "" });
      clearErrors();
      setAttemptsRemaining(null);
      setSubmitting(false);
    }
  }, [open, reset, clearErrors]);

  const handleClose = (next: boolean) => {
    if (submitting) return;
    if (!next) {
      reset({ mpin: "" });
      clearErrors();
      setAttemptsRemaining(null);
      onCancel?.();
    }
    onOpenChange(next);
  };

  const onSubmit = async (values: VerifyMpinFormValues) => {
    clearErrors("mpin");
    setSubmitting(true);
    try {
      // Prefer form values, then watch — always force a 4-digit string body
      const mpinValue = String(
        values?.mpin ?? getValues("mpin") ?? mpin ?? ""
      ).replace(/\D/g, "");

      if (!/^\d{4}$/.test(mpinValue)) {
        setError("mpin", { message: "MPIN must be exactly 4 digits" });
        return;
      }

      const result = await verifyMpin({ mpin: mpinValue });
      if (!result.verified) {
        setError("mpin", { message: "Invalid MPIN" });
        if (result.attemptsRemaining != null) {
          setAttemptsRemaining(result.attemptsRemaining);
        }
        return;
      }

      toast.success(result.message || "MPIN verified");
      reset({ mpin: "" });
      setAttemptsRemaining(null);
      onOpenChange(false);
      await onVerified(mpinValue);
    } catch (err) {
      const mapped = toMpinVerifyApiError(err, "Invalid MPIN");

      if (mapped.locked || mapped.status === 403) {
        onOpenChange(false);
        onAccountLocked?.(
          mapped.message ||
            "Your account has been temporarily locked due to multiple incorrect MPIN attempts. You cannot use DMT, AEPS, or UPI ATM for the next 1 hour."
        );
        return;
      }

      const msg = mapped.message || "Invalid MPIN";
      setError("mpin", {
        message: /required property ['\"]?mpin['\"]?/i.test(msg)
          ? "Unable to send MPIN. Please re-enter and try again."
          : msg,
      });
      if (mapped.attemptsRemaining != null) {
        setAttemptsRemaining(mapped.attemptsRemaining);
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md gap-0 overflow-hidden p-0 sm:rounded-2xl"
        onPointerDownOutside={(e) => {
          if (submitting) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (submitting) e.preventDefault();
        }}
      >
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#001F5B] via-[#0d47a1] to-[#1565d8] px-6 py-5 text-white">
          <DialogHeader>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-white">{title}</DialogTitle>
            <DialogDescription className="text-blue-100/90">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 px-6 py-5"
          autoComplete="off"
        >
          <Controller
            name="mpin"
            control={control}
            render={({ field }) => (
              <AnimatedMpinInput
                label="Enter MPIN"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  clearErrors("mpin");
                }}
                length={MPIN_LENGTH}
                autoFocus
                disabled={submitting}
                allowPaste={false}
                error={errors.mpin?.message}
                hint="Digits are masked. Paste is disabled."
              />
            )}
          />

          <div className="h-5">
            {attemptsRemaining != null ? (
              <p className="text-xs font-semibold text-amber-700">
                Remaining Attempts : {attemptsRemaining}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleClose(false)}
              className="w-full sm:w-auto"
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              disabled={submitting || mpin.length !== MPIN_LENGTH}
              className="w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Verify MPIN"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Alias matching product naming */
export const VerifyMPINModal = VerifyMpinModal;
