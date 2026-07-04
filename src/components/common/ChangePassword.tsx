"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordStrengthMeter from "@/src/components/common/PasswordStrengthMeter";
import { changePassword } from "@/src/services/authService";
import { logoutUser } from "@/src/redux/thunks/authThunk";
import {
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from "@/src/validation/changePasswordSchema";

interface ChangePasswordProps {
  onSuccess?: () => void;
  /** When true, logs out and redirects to login (backend invalidates sessions). Default: true */
  logoutAfterSuccess?: boolean;
}

function PasswordField({
  id,
  label,
  error,
  register,
  show,
  onToggle,
}: {
  id: keyof ChangePasswordFormValues;
  label: string;
  error?: string;
  register: ReturnType<typeof useForm<ChangePasswordFormValues>>["register"];
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          autoComplete={id === "oldPassword" ? "current-password" : "new-password"}
          className="h-11 rounded-xl pr-11 dark:border-slate-700 dark:bg-slate-950"
          {...register(id)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function ChangePassword({
  onSuccess,
  logoutAfterSuccess = true,
}: ChangePasswordProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = form.watch("newPassword");

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const result = await changePassword({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      toast.success(
        result.message || "Password changed successfully. Please sign in again."
      );
      form.reset();
      onSuccess?.();

      if (logoutAfterSuccess) {
        await dispatch(logoutUser());
        router.push("/auth/login");
      }
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message ||
        "Failed to change password. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="border-b border-slate-100 bg-gradient-to-r from-[#f8fbff] to-white px-6 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-md">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#001F5B] dark:text-white">
              Change Password
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You will be signed out from all devices after updating
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
        <PasswordField
          id="oldPassword"
          label="Old Password"
          register={form.register}
          show={showOld}
          onToggle={() => setShowOld((prev) => !prev)}
          error={form.formState.errors.oldPassword?.message}
        />

        <PasswordField
          id="newPassword"
          label="New Password"
          register={form.register}
          show={showNew}
          onToggle={() => setShowNew((prev) => !prev)}
          error={form.formState.errors.newPassword?.message}
        />

        <PasswordStrengthMeter password={newPassword} />

        <PasswordField
          id="confirmPassword"
          label="Confirm Password"
          register={form.register}
          show={showConfirm}
          onToggle={() => setShowConfirm((prev) => !prev)}
          error={form.formState.errors.confirmPassword?.message}
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            disabled={submitting}
            onClick={() => {
              form.reset();
              onSuccess?.();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || !form.formState.isValid}
            className="h-11 flex-1 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </form>
    </div>
  );
}
