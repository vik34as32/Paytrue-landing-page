"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";

export default function FintechLoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const validEmail = "retailer@paytrue.com";
    const validPassword = "123456";

    if (
      email.trim() === validEmail &&
      password.trim() === validPassword
    ) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", "Amit Kumar");

      router.push("/rt/retailer");
    } else {
      setError("Invalid Email or Password");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <Header />

      <section className="relative flex-1 overflow-hidden bg-gradient-to-br from-slate-950 via-[#001F5B] to-[#0057D9]">
        {/* Background Effects */}
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
          {/* LEFT SECTION */}
          <div className="hidden flex-col justify-center px-10 py-20 text-white lg:flex xl:px-20">
            <div className="mb-10">
              <h1 className="text-5xl font-extrabold tracking-tight">
                <span className="text-white">Pay</span>
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  True
                </span>
              </h1>

              <p className="mt-4 text-lg text-blue-100">
                Secure Digital Financial Ecosystem
              </p>
            </div>

            <h2 className="max-w-xl text-5xl font-extrabold leading-tight">
              Empowering India's{" "}
              <span className="text-cyan-300">
                Digital Finance
              </span>{" "}
              Revolution
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-200">
              Access AEPS, DMT, Recharge, BBPS, Fastag,
              Insurance, PAN Services and many more
              fintech services from one trusted platform.
            </p>
          </div>

          {/* LOGIN FORM */}
          <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
            <div className="w-full max-w-xl rounded-[36px] border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
              {/* Mobile Logo */}
              <div className="mb-10 text-center lg:hidden">
                <h1 className="text-4xl font-extrabold">
                  <span className="text-[#001F5B]">Pay</span>
                  <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                    True
                  </span>
                </h1>
              </div>

              {/* Header */}
              <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#0057D9]">
                  <ShieldCheck size={16} />
                  Secure Account Login
                </span>

                <h2 className="mt-5 text-4xl font-extrabold text-gray-900">
                  Welcome Back
                </h2>

                <p className="mt-3 text-lg text-gray-600">
                  Login to access your PayTrue dashboard
                </p>
              </div>

              <form
                onSubmit={handleLogin}
                className="space-y-7"
              >
                {/* Email */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9]">
                    <Mail
                      className="mr-4 text-gray-400"
                      size={22}
                    />

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-transparent text-lg text-gray-800 outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Password
                  </label>

                  <div className="flex items-center rounded-2xl border border-gray-200 bg-slate-50 px-5 py-4 focus-within:border-[#0057D9]">
                    <Lock
                      className="mr-4 text-gray-400"
                      size={22}
                    />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      className="w-full bg-transparent text-lg text-gray-800 outline-none"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={22} />
                      ) : (
                        <Eye size={22} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                {/* Demo Credentials */}
                {/* <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm">
                  <p className="font-semibold text-blue-700">
                    Demo Login
                  </p>

                  <p>Email: retailer@paytrue.com</p>
                  <p>Password: 123456</p>
                </div> */}

                {/* Login Button */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  Login Securely
                  <ArrowRight size={22} />
                </button>

                <div className="relative py-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>

                  <span className="relative bg-white px-4 text-sm text-gray-500">
                    OR
                  </span>
                </div>
              </form>

              <p className="mt-10 text-center text-base text-gray-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-[#0057D9]"
                >
                  Create Account
                </Link>
              </p>

              <div className="mt-10 rounded-2xl bg-blue-50 p-5 text-center">
                <p className="text-sm font-medium text-[#0057D9]">
                  🔒 Protected by enterprise-grade fintech
                  security
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