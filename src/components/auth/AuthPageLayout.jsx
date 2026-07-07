"use client";

import Link from "next/link";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";

export default function AuthPageLayout({
  badge,
  title,
  subtitle,
  children,
  footer,
}) {
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
                {badge ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-[#0057D9]">
                    {badge}
                  </span>
                ) : null}
                <h2 className="mt-5 text-4xl font-extrabold text-gray-900 dark:text-white">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-3 text-lg text-gray-600 dark:text-slate-400">{subtitle}</p>
                ) : null}
              </div>

              {children}

              {footer ? (
                <div className="mt-10 text-center text-base text-gray-600 dark:text-slate-400">
                  {footer}
                </div>
              ) : null}

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

export function AuthBackToLoginLink() {
  return (
    <Link href="/auth/login" className="font-bold text-[#0057D9] hover:underline">
      Back to Login
    </Link>
  );
}
