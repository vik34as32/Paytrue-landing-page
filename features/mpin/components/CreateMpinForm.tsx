"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Shield } from "lucide-react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MpinInputField } from "./MpinInputField";
import { MpinStrengthIndicator } from "./MpinStrengthIndicator";
import {
  createMpinSchema,
  type CreateMpinFormValues,
} from "../schemas";
import { createMpin, mapMpinApiError } from "../services/mpinApi";
import { MPIN_STATUS_QUERY_KEY } from "../hooks/useMpin";

export function CreateMpinForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(true);
  const [revealMpin, setRevealMpin] = useState(false);
  const [revealConfirm, setRevealConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateMpinFormValues>({
    resolver: zodResolver(createMpinSchema) as Resolver<CreateMpinFormValues>,
    mode: "onChange",
    defaultValues: { mpin: "", confirmMpin: "" },
  });

  const mpin = watch("mpin");
  const confirmMpin = watch("confirmMpin");

  const onSubmit = async (values: CreateMpinFormValues) => {
    setSubmitting(true);
    try {
      const result = await createMpin(values);
      toast.success(result.message || "MPIN created successfully");
      reset({ mpin: "", confirmMpin: "" });
      void queryClient.invalidateQueries({ queryKey: MPIN_STATUS_QUERY_KEY });
      setSuccess(true);
      setOpen(false);
      window.setTimeout(() => {
        router.replace("/rt/retailer");
      }, 1400);
    } catch (err) {
      toast.error(mapMpinApiError(err, "Failed to create MPIN"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-emerald-200 bg-white px-8 py-14 text-center shadow-lg"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-emerald-700">MPIN Created</h2>
            <p className="mt-1 text-sm text-slate-500">Redirecting to dashboard…</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Dialog open={open && !success} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-2xl [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
            <DialogHeader>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1565d8]/10 text-[#1565d8]">
                <Shield className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl text-[#001F5B]">
                Create Secure MPIN
              </DialogTitle>
              <DialogDescription>
                Create a 4 digit MPIN to authorize secure wallet transactions.
                Type using your keyboard.
              </DialogDescription>
            </DialogHeader>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 px-6 py-5"
            autoComplete="off"
          >
            <Controller
              name="mpin"
              control={control}
              render={({ field }) => (
                <MpinInputField
                  label="MPIN"
                  value={field.value}
                  onChange={field.onChange}
                  revealed={revealMpin}
                  onToggleReveal={() => setRevealMpin((r) => !r)}
                  error={errors.mpin?.message}
                  autoFocus
                  disabled={submitting}
                  hint="Enter 4 digits"
                />
              )}
            />

            <MpinStrengthIndicator mpin={mpin} />

            <Controller
              name="confirmMpin"
              control={control}
              render={({ field }) => (
                <MpinInputField
                  label="Confirm MPIN"
                  value={field.value}
                  onChange={field.onChange}
                  revealed={revealConfirm}
                  onToggleReveal={() => setRevealConfirm((r) => !r)}
                  error={errors.confirmMpin?.message}
                  disabled={submitting}
                />
              )}
            />

            {mpin && confirmMpin && mpin !== confirmMpin ? (
              <p className="text-xs font-medium text-rose-600">
                MPIN and Confirm MPIN must match
              </p>
            ) : null}

            <DialogFooter className="gap-2 border-0 bg-transparent p-0 sm:justify-end">
              <Button type="submit" disabled={!isValid || submitting} className="min-w-[140px]">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create MPIN"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
