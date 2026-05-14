"use client";

import {
  Zap,
  Wallet,
  Globe,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  Signal,
  Gift,
} from "lucide-react";

const prepaidBenefits = [
  {
    icon: Zap,
    title: "Instant Recharge Experience",
    description:
      "Recharge your mobile, DTH, or broadband instantly with seamless processing and rapid transaction speeds.",
  },
  {
    icon: Wallet,
    title: "Exclusive Cashback Rewards",
    description:
      "Enjoy premium cashback opportunities, discounts, and promotional savings on every recharge transaction.",
  },
  {
    icon: Globe,
    title: "24/7 Digital Accessibility",
    description:
      "Recharge anytime from anywhere using PayTrue’s secure online platform without visiting retail outlets.",
  },
  {
    icon: ShieldCheck,
    title: "Advanced Transaction Security",
    description:
      "Protected payment gateways ensure encrypted transactions with secure user authentication.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment Methods",
    description:
      "Choose from UPI, debit cards, credit cards, wallets, or net banking for hassle-free payments.",
  },
  {
    icon: BadgeCheck,
    title: "Real-Time Recharge Confirmation",
    description:
      "Receive instant recharge confirmations, transaction receipts, and digital records securely.",
  },
  {
    icon: Signal,
    title: "Multi-Operator Coverage",
    description:
      "Recharge across all leading telecom, broadband, and DTH providers on one unified platform.",
  },
  {
    icon: Gift,
    title: "Premium Recharge Offers",
    description:
      "Unlock value-added benefits including bonus talktime, extra data packs, and discounted plans.",
  },
];

export default function PrepaidRechargeBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
            <BadgeCheck size={18} />
            Smart Digital Recharge Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              Prepaid Recharge
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            PayTrue delivers secure, instant, and rewarding prepaid recharge
            solutions for mobile, DTH, broadband, and digital utility services.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {prepaidBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className={`group relative rounded-[30px] border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                  index === 4
                    ? "border-t-4 border-t-[#0057D9]"
                    : ""
                }`}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-blue-50/0 to-cyan-50/0 transition-all duration-500 group-hover:from-blue-50 group-hover:to-cyan-50"></div>

                {/* Icon */}
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] shadow-lg">
                  <Icon className="text-white" size={28} />
                </div>

                {/* Title */}
                <h3 className="relative z-10 mb-4 text-xl font-bold leading-snug text-gray-900">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-base leading-relaxed text-gray-600">
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