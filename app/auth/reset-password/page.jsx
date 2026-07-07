"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import AuthPageLayout, { AuthBackToLoginLink } from "@/src/components/auth/AuthPageLayout";
import PasswordStrengthMeter from "@/src/components/common/PasswordStrengthMeter";
import OtpInput from "@/src/components/dmt/OtpInput";
import { resetPasswordSchema } from "@/src/validation/forgotPasswordSchema";
import { resetPassword } from "@/src/services/authService";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const emailFromUrl = searchParams.get("email") || "";
  const mobileFromUrl = searchParams.get("mobile") || "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromUrl,
      mobile: mobileFromUrl,
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (emailFromUrl) setValue("email", emailFromUrl);
    if (mobileFromUrl) setValue("mobile", mobileFromUrl);
  }, [emailFromUrl, mobileFromUrl, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await resetPassword({
        email: data.email?.trim() || undefined,
        mobile: data.mobile?.trim() || undefined,
        otp: data.otp.trim(),
        password: data.password,
      });
      setSuccess(true);
      toast.success(result.message || "Password reset successfully.");
      setTimeout(() => router.replace("/auth/login"), 2500);
    } catch (error) {
      const message = error?.message || "Unable to reset password.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      badge={
        <>
          <ShieldCheck size={16} />
          Secure Reset
        </>
      }
      title="Reset Password"
      subtitle="Enter the 6-digit OTP sent to your email or mobile"
      footer={
        <>
          <AuthBackToLoginLink />
          {" · "}
          <Link href="/auth/forgot-password" className="font-bold text-[#0057D9] hover:underline">
            Resend OTP
          </Link>
        </>
      }
    >
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
            Password reset successful!
          </p>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            Redirecting you to login...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
              <Mail className="mr-4 shrink-0 text-gray-400" size={22} />
              <input
                type="email"
                placeholder="Registered email"
                className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                {...register("email")}
              />
            </div>
            {errors.email ? (
              <p className="mt-2 text-sm text-red-500">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
            OR
            <span className="h-px flex-1 bg-gray-200 dark:bg-slate-700" />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Mobile Number
            </label>
            <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
              <Smartphone className="mr-4 shrink-0 text-gray-400" size={22} />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                {...register("mobile")}
              />
            </div>
            {errors.mobile ? (
              <p className="mt-2 text-sm text-red-500">{errors.mobile.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-3 block text-center text-sm font-semibold text-gray-700 dark:text-slate-300">
              Enter 6-digit OTP
            </label>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                  className="justify-center"
                />
              )}
            />
            {errors.otp ? (
              <p className="mt-2 text-center text-sm text-red-500">{errors.otp.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              New Password
            </label>
            <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
              <Lock className="mr-4 shrink-0 text-gray-400" size={22} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                {...register("password")}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {errors.password ? (
              <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
            ) : null}
            <div className="mt-3">
              <PasswordStrengthMeter password={password} />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Confirm Password
            </label>
            <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
              <Lock className="mr-4 shrink-0 text-gray-400" size={22} />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm new password"
                className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                {...register("confirmPassword")}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="mt-2 text-sm text-red-500">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          {errors.root ? (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>
      )}
    </AuthPageLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
