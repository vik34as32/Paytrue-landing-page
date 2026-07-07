"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Smartphone, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import AuthPageLayout, { AuthBackToLoginLink } from "@/src/components/auth/AuthPageLayout";
import { forgotPasswordSchema } from "@/src/validation/forgotPasswordSchema";
import { forgotPassword } from "@/src/services/authService";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState("/auth/reset-password");

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: "", mobile: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await forgotPassword({
        email: data.email?.trim() || undefined,
        mobile: data.mobile?.trim() || undefined,
      });
      const params = new URLSearchParams();
      if (data.email?.trim()) params.set("email", data.email.trim());
      if (data.mobile?.trim()) params.set("mobile", data.mobile.trim());
      const query = params.toString();
      setResetLink(query ? `/auth/reset-password?${query}` : "/auth/reset-password");
      setSubmitted(true);
      toast.success(
        result.message || "OTP has been sent to your email or mobile."
      );
    } catch (error) {
      const message = error?.message || "Unable to process forgot password request.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageLayout
      badge={
        <>
          <KeyRound size={16} />
          Account Recovery
        </>
      }
      title="Forgot Password"
      subtitle="Enter your registered email or mobile to receive a 6-digit OTP"
      footer={
        <>
          Remember your password? <AuthBackToLoginLink />
        </>
      }
    >
      {submitted ? (
        <div className="space-y-6 text-center">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              If an account exists for{" "}
              <strong>{getValues("email") || getValues("mobile")}</strong>, you will
              receive password reset instructions shortly.
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Check your email inbox or SMS for the 6-digit OTP.
          </p>
          <Link
            href={resetLink}
            className="inline-flex items-center gap-2 font-semibold text-[#0057D9] hover:underline"
          >
            Enter OTP &amp; reset password
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
              <Mail className="mr-4 text-gray-400" size={22} />
              <input
                type="email"
                placeholder="Enter your registered email"
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
              <Smartphone className="mr-4 text-gray-400" size={22} />
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                {...register("mobile")}
              />
            </div>
            {errors.mobile ? (
              <p className="mt-2 text-sm text-red-500">{errors.mobile.message}</p>
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
                Sending...
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>
      )}
    </AuthPageLayout>
  );
}
