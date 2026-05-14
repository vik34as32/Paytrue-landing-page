"use client";

import {
  Wallet,
  Zap,
  ShieldCheck,
  Fingerprint,
  Globe,
  BadgeCheck,
} from "lucide-react";

const aadhaarPayBenefits = [
  {
    icon: Wallet,
    title: "Cardless Digital Payments",
    description:
      "Enable customers to make secure transactions directly from Aadhaar-linked bank accounts without debit or credit cards.",
  },
  {
    icon: Zap,
    title: "Instant Merchant Settlements",
    description:
      "Receive real-time payment settlements directly into merchant accounts with fast biometric transaction processing.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-Grade Security",
    description:
      "Advanced biometric authentication and encrypted banking infrastructure ensure safe and fraud-resistant transactions.",
  },
  {
    icon: BadgeCheck,
    title: "Simplified Customer Verification",
    description:
      "Only Aadhaar number and fingerprint authentication are required, reducing paperwork and streamlining onboarding.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Payment Authorization",
    description:
      "Fingerprint recognition ensures highly secure identity verification for every transaction, enhancing trust and compliance.",
  },
  {
    icon: Globe,
    title: "Inclusive Nationwide Reach",
    description:
      "Serve urban and rural customers across India with accessible Aadhaar Pay solutions available through merchant networks.",
  },
];

export default function AadhaarPayBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-800 shadow-md">
            <BadgeCheck size={18} />
            Premium Aadhaar Pay Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Key Benefits of{" "}
            <span className="bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Aadhaar Pay
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-700 to-cyan-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            Delivering secure, biometric-powered, and highly accessible payment
            solutions for merchants, retailers, and customers nationwide.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {aadhaarPayBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className={`group relative rounded-[32px] border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                  index === 4 ? "border-t-4 border-t-blue-700" : ""
                }`}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50 group-hover:to-cyan-50 transition-all duration-500"></div>

                {/* Icon */}
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-cyan-600 shadow-lg">
                  <Icon className="text-white" size={30} />
                </div>

                {/* Title */}
                <h3 className="relative z-10 mb-4 text-2xl font-bold text-gray-900 leading-snug">
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