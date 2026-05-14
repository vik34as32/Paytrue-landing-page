"use client";

import {
  CheckCircle,
  ShieldCheck,
  Wallet,
  Clock,
  Zap,
  BadgeCheck,
} from "lucide-react";

const dmtBenefits = [
  {
    icon: Zap,
    title: "Instant Bank Transfers",
    description:
      "Transfer money instantly to any bank account across India within seconds, ensuring rapid settlements.",
  },
  {
    icon: BadgeCheck,
    title: "Advanced Technology Support",
    description:
      "Powered by secure digital banking infrastructure for seamless, accurate, and error-free transactions.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Domestic money transfer services remain active on weekends, holidays, and beyond banking hours.",
  },
  {
    icon: Wallet,
    title: "Affordable Service Charges",
    description:
      "Minimal transfer fees make domestic remittance cost-effective for retailers, businesses, and customers.",
  },
  {
    icon: ShieldCheck,
    title: "Highly Secure Transactions",
    description:
      "Every transfer is encrypted with multi-layer security systems for safe and protected payments.",
  },
  {
    icon: CheckCircle,
    title: "Simple User Experience",
    description:
      "Easy-to-use platform with streamlined processes for fast and convenient money transfer services.",
  },
];

export default function DomesticMoneyTransferBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-100/30 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-800 shadow-md">
            <BadgeCheck size={18} />
            Trusted Domestic Transfer Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
              Domestic Money Transfer
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-700 to-indigo-900"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            Empowering users with secure, instant, and affordable domestic
            money transfer services backed by premium banking infrastructure.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {dmtBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="group relative rounded-[30px] border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Top Border Gradient */}
                <div className="absolute left-0 top-0 h-1.5 w-full rounded-t-[30px] bg-gradient-to-r from-blue-700 to-purple-600"></div>

                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50 group-hover:to-indigo-50 transition-all duration-500"></div>

                {/* Icon */}
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 shadow-lg">
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