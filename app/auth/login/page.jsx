"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Header from "@/app/shared/components/layout/Header";
import FormStatusAlert from "@/src/components/common/FormStatusAlert";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import ReduxProvider from "@/src/components/common/ReduxProvider";
import { loginSchema } from "@/src/validation/schemas";
import { loginUser } from "@/src/redux/thunks/authThunk";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";
import {
  selectAuthLoading,
  selectAuthError,
  clearAuthError,
} from "@/src/redux/slices/authSlice";
import { resolvePostLoginRedirect } from "@/src/lib/authUtils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { identifier: "", password: "", remember: false },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    setLoginSuccess("");
    dispatch(clearAuthError());

    const identifier = String(data.identifier ?? "").trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const mobile = identifier.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

    // Email login → { email, password }
    // Mobile login → { mobile, password }
    const payload = {
      password: data.password,
      remember: Boolean(data.remember),
      ...(isEmail
        ? { email: identifier.toLowerCase() }
        : { mobile }),
    };

    const action = await dispatch(loginUser(payload));

    if (loginUser.fulfilled.match(action)) {
      await dispatch(fetchProfile());

      setLoginSuccess("Login successful. Redirecting to your dashboard...");

      const redirect = resolvePostLoginRedirect(
        searchParams.get("redirect"),
        action.payload.user?.userType
      );

      router.replace(redirect);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <section className="relative flex-1 overflow-hidden bg-gradient-to-br from-slate-950 via-[#001F5B] to-[#0057D9]">
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
          <div className="hidden flex-col justify-center px-10 py-20 text-white lg:flex xl:px-20">
            <div className="mb-10">
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="text-white">Pay</span>
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  True
                </span>
              </h1>
              <p className="mt-4 text-lg text-blue-100">Secure Digital Financial Ecosystem</p>
            </div>
            <h2 className="max-w-xl text-5xl font-extrabold leading-tight">
              Empowering India&apos;s{" "}
              <span className="text-cyan-300">Digital Finance</span> Revolution
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-200">
              Access AEPS, DMT, Recharge, BBPS, Fastag, Insurance, PAN Services and many more
              fintech services from one trusted platform.
            </p>
          </div>

          <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
            <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-12 dark:bg-slate-900/95">
              <div className="mb-10 text-center lg:hidden">
                <h1 className="text-4xl font-extrabold">
                  <span className="text-[#001F5B] dark:text-white">Pay</span>
                  <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                    True
                  </span>
                </h1>
              </div>

              <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#0057D9]">
                  <ShieldCheck size={16} />
                  Secure Account Login
                </span>
                <h2 className="mt-5 text-4xl font-extrabold text-gray-900 dark:text-white">
                  Welcome Back
                </h2>
                <p className="mt-3 text-lg text-gray-600 dark:text-slate-400">
                  Login to access your PayTrue dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Email Address / Mobile Number
                  </label>
                  <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
                    <Mail className="mr-4 text-gray-400" size={22} />
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      placeholder="Enter email or 10-digit mobile"
                      className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                      {...register("identifier")}
                    />
                  </div>
                  {errors.identifier ? (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.identifier.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    Password
                  </label>

                  <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9] dark:border-slate-700 dark:bg-slate-800">
                    <Lock className="mr-4 text-gray-400" size={22} />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-lg text-gray-800 outline-none dark:text-white"
                      {...register("password")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 transition hover:text-[#0057D9]"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500">{errors.password.message}</p>
                  )}

                  {/* Forgot Password */}
                  <div className="mt-3 flex justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium text-[#0057D9] transition-colors duration-200 hover:text-[#0A84FF] hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>


                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    {...register("remember")}
                  />
                  Remember me
                </label>

                {authError ? (
                  <FormStatusAlert
                    variant="error"
                    title="Login failed"
                    message={authError}
                  />
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Login Securely
                      <ArrowRight size={22} />
                    </>
                  )}
                </button>

                {loginSuccess ? (
                  <FormStatusAlert
                    variant="success"
                    title="Welcome back"
                    message={loginSuccess}
                  />
                ) : null}
              </form>

              <p className="mt-10 text-center text-base text-gray-600 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-bold text-[#0057D9]">
                  Create Account
                </Link>
              </p>

              <div className="mt-10 rounded-2xl bg-blue-50 p-5 text-center dark:bg-blue-950/30">
                <p className="text-sm font-medium text-[#0057D9]">
                  Protected by enterprise-grade fintech security
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PremiumFintechFooter />
    </div>
  );
}

export default function FintechLoginPage() {
  return (
    <ReduxProvider>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </ReduxProvider>
  );
}
