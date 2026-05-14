"use client";

import {
  Wallet,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Fingerprint,
  Globe,
} from "lucide-react";

const benefits = [
  {
    icon: Wallet,
    title: "Cash Withdrawal Facility",
    description:
      "Easy and convenient cash withdrawal from your bank account using just your Aadhaar number and fingerprint verification.",
  },
  {
    icon: Zap,
    title: "Quick Transfer Facility",
    description:
      "Transfer money instantly between accounts with minimal documentation and maximum security.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Secure Transactions",
    description:
      "Interoperable across various banks with robust security measures and encrypted transaction processing.",
  },
  {
    icon: BadgeCheck,
    title: "Minimal Information Required",
    description:
      "Only your Aadhaar number and biometric information are needed to initiate secure transactions.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Authentication",
    description:
      "Advanced fingerprint recognition technology ensures only you can access your account and authorize transactions.",
  },
  {
    icon: Globe,
    title: "Universal Accessibility",
    description:
      "Access your banking services from any AEPS-enabled location across India, making banking truly inclusive.",
  },
];

export default function AEPSBenefitsSection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-100/20 blur-3xl"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 text-[#0057D9] text-sm font-semibold shadow-sm">
            <ShieldCheck size={18} />
            Aadhaar Banking Advantages
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900">
            Key{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              Benefits
            </span>
          </h2>

          <div className="mt-5 h-1.5 w-24 mx-auto rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

          <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
            Discover how AEPS transforms traditional banking with secure,
            accessible, and seamless financial solutions for every user.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className={`group relative rounded-[32px] border border-gray-100 bg-white p-10 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                  index === 5
                    ? "border-t-4 border-t-[#0057D9]"
                    : ""
                }`}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-50/0 to-violet-50/0 group-hover:from-blue-50 group-hover:to-violet-50 transition-all duration-500"></div>

                {/* Icon */}
                <div className="relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0A84FF] to-[#6D28D9] shadow-xl">
                  <Icon className="text-white" size={34} />
                </div>

                {/* Title */}
                <h3 className="relative z-10 mb-5 text-2xl font-bold text-gray-900 leading-snug">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-lg leading-relaxed text-gray-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}