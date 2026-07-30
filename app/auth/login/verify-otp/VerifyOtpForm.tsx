"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import OtpInput from "./OtpInput";
import ResendOtpButton from "./ResendOtpButton";
import {
  clearLoginOtpSession,
  getLoginOtpSession,
  saveLoginOtpSession,
} from "@/src/lib/loginOtpSession";
import { resendLoginOtp, toLoginOtpApiError } from "@/src/services/loginOtpService";
import { verifyLoginOtp } from "@/src/redux/thunks/authThunk";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  clearAuthError,
  selectAuthLoading,
} from "@/src/redux/slices/authSlice";
import { resolvePostLoginRedirect } from "@/src/lib/authUtils";
import { ROLE_PORTAL_PATHS, USER_TYPES } from "@/src/constants/auth";
import { fetchMpinStatus } from "@/features/mpin/services/mpinApi";

const otpSchema = z.object({
  otp: z
    .string()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);

  const [sessionReady, setSessionReady] = useState(false);
  const [loginToken, setLoginToken] = useState("");
  const [remember, setRemember] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [expiredHint, setExpiredHint] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema) as Resolver<OtpFormValues>,
    defaultValues: { otp: "" },
    mode: "onChange",
  });

  const otp = watch("otp");

  useEffect(() => {
    const session = getLoginOtpSession();
    const token = String(session?.loginToken || "").trim();
    // Reject leftover bad sessions that stored mobile as loginToken
    if (!token || /^\d{10}$/.test(token) || token.includes("@")) {
      clearLoginOtpSession();
      router.replace("/auth/login");
      return;
    }
    setLoginToken(token);
    setRemember(Boolean(session?.remember));
    setSessionReady(true);
  }, [router]);

  const resendMutation = useMutation({
    mutationFn: async () => {
      const result = await resendLoginOtp(loginToken);
      return result;
    },
    onSuccess: (result) => {
      if (result.loginToken && result.loginToken !== loginToken) {
        setLoginToken(result.loginToken);
        saveLoginOtpSession({
          loginToken: result.loginToken,
          remember,
          identifierHint: getLoginOtpSession()?.identifierHint,
        });
      }
      setExpiredHint(false);
      setRemainingAttempts(null);
      setValue("otp", "");
      clearErrors();
      toast.success(result.message || "OTP resent successfully");
    },
    onError: (error) => {
      const mapped = toLoginOtpApiError(error, "Unable to resend OTP");
      if (mapped.locked || mapped.status === 423) {
        setLocked(true);
        setLockMessage(
          mapped.message ||
            "Your account has been locked for 1 hour because of multiple incorrect OTP attempts."
        );
        clearLoginOtpSession();
        return;
      }
      toast.error(mapped.message);
    },
  });

  const onVerify = async (values: OtpFormValues) => {
    if (!loginToken || locked) return;
    dispatch(clearAuthError());
    setExpiredHint(false);

    const action = await dispatch(
      verifyLoginOtp({
        loginToken,
        otp: values.otp,
        remember,
      }) as never
    );

    if (verifyLoginOtp.fulfilled.match(action)) {
      toast.success(action.payload.message || "Login Successful");
      await dispatch(fetchProfile() as never);

      const userType = action.payload.user?.userType;
      let redirect = resolvePostLoginRedirect(
        searchParams.get("redirect"),
        userType
      );

      if (userType === USER_TYPES.RETAILER) {
        redirect = ROLE_PORTAL_PATHS[USER_TYPES.RETAILER] || "/rt/retailer";
        try {
          const status = await fetchMpinStatus();
          if (!status.isMpinCreated) {
            redirect = "/rt/retailer/mpin/create";
          }
        } catch {
          /* gate will retry */
        }
      }

      // Hard navigate so middleware sees the new access-token cookie
      window.location.assign(redirect);
      return;
    }

    if (verifyLoginOtp.rejected.match(action)) {
      const payload = action.payload as {
        status?: number;
        message?: string;
        remainingAttempts?: number | null;
        locked?: boolean;
        expired?: boolean;
      };

      if (payload?.locked || payload?.status === 423) {
        setLocked(true);
        setLockMessage(
          payload.message ||
            "Your account has been locked for 1 hour because of multiple incorrect OTP attempts."
        );
        clearLoginOtpSession();
        toast.error(payload.message || "Account locked");
        return;
      }

      if (payload?.expired) {
        setExpiredHint(true);
        setError("otp", { message: "OTP expired. Please resend OTP." });
        toast.error(payload.message || "OTP expired");
        return;
      }

      if (payload?.remainingAttempts != null) {
        setRemainingAttempts(payload.remainingAttempts);
      }

      setError("otp", { message: payload?.message || "Invalid OTP" });
      toast.error(payload?.message || "Invalid OTP");
    }
  };

  if (!sessionReady) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1565d8]" />
      </div>
    );
  }

  if (locked) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900">
          <div className="flex gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="font-bold">Account Temporarily Locked</p>
              <p className="mt-1 text-sm leading-relaxed">
                {lockMessage ||
                  "Your account has been locked for 1 hour because of multiple incorrect OTP attempts."}
              </p>
            </div>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back To Login
        </Link>
      </div>
    );
  }

  const busy = loading || resendMutation.isPending;

  return (
    <form
      onSubmit={handleSubmit(onVerify)}
      className="space-y-5"
      autoComplete="one-time-code"
    >
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#1565d8]/10 text-[#1565d8]">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#001F5B]">Verify Login OTP</h1>
        <p className="mt-2 text-sm text-slate-500">
          We have sent OTP to your registered Email and Mobile Number.
        </p>
      </div>

      <Controller
        name="otp"
        control={control}
        render={({ field }) => (
          <OtpInput
            value={field.value}
            onChange={(value) => {
              field.onChange(value);
              clearErrors("otp");
              setRemainingAttempts(null);
            }}
            disabled={busy}
            error={Boolean(errors.otp)}
            autoFocus
            onComplete={() => {
              void handleSubmit(onVerify)();
            }}
          />
        )}
      />

      <div className="min-h-[40px] space-y-1 text-center">
        {errors.otp ? (
          <p className="text-sm font-medium text-rose-600">{errors.otp.message}</p>
        ) : null}
        {remainingAttempts != null ? (
          <p className="text-sm font-semibold text-amber-700">
            Remaining Attempts: {remainingAttempts}
          </p>
        ) : null}
        {expiredHint ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-amber-700">
            <ShieldAlert className="h-4 w-4" />
            OTP expired. Please resend OTP.
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={busy || otp.length !== 6}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify OTP"
        )}
      </button>

      <ResendOtpButton
        disabled={busy}
        onResend={() => resendMutation.mutateAsync()}
      />

      <Link
        href="/auth/login"
        onClick={() => clearLoginOtpSession()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
    </form>
  );
}
