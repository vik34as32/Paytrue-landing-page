"use client";

import {
  Zap,
  CreditCard,
  Globe,
  ShieldCheck,
  Clock3,
  Receipt,
  Car,
  Wallet,
} from "lucide-react";

const fastagBenefits = [
  {
    icon: Zap,
    title: "Instant Toll Payments",
    description:
      "Drive through toll plazas without stopping for cash transactions, ensuring seamless travel and faster processing.",
  },
  {
    icon: CreditCard,
    title: "Easy Digital Recharge",
    description:
      "Recharge your Fastag wallet instantly through UPI, net banking, debit cards, credit cards, or wallets.",
  },
  {
    icon: Globe,
    title: "Online Account Access",
    description:
      "Manage your Fastag profile, monitor balances, recharge funds, and review transaction history anytime.",
  },
  {
    icon: ShieldCheck,
    title: "Secure RFID Technology",
    description:
      "Advanced RFID-enabled security ensures safe, automated toll payments with reliable authentication.",
  },
  {
    icon: Clock3,
    title: "Reduced Waiting Time",
    description:
      "Avoid long toll queues and enjoy uninterrupted journeys with automated toll collection systems.",
  },
  {
    icon: Receipt,
    title: "Real-Time SMS Alerts",
    description:
      "Receive instant payment confirmations, deductions, and transaction notifications directly on your mobile.",
  },
  {
    icon: Car,
    title: "Nationwide Toll Coverage",
    description:
      "Use Fastag across hundreds of toll plazas nationwide for convenient travel across India.",
  },
  {
    icon: Wallet,
    title: "Cashless Convenience",
    description:
      "Promotes digital payments while reducing cash dependency for secure and efficient toll operations.",
  },
];

export default function FastagBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full bg-green-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-emerald-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-5 py-2 text-sm font-semibold text-green-700 shadow-md">
            <ShieldCheck size={18} />
            Smart Toll Payment Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Fastag System
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            PayTrue’s Fastag platform delivers secure, fast, and efficient toll
            payment solutions for modern travelers and businesses.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {fastagBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className={`group relative rounded-[30px] border border-green-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl ${
                  index === 0 ? "border-t-4 border-t-green-500" : ""
                }`}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-green-50/0 to-emerald-50/0 transition-all duration-500 group-hover:from-green-50 group-hover:to-emerald-50"></div>

                {/* Icon */}
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                  <Icon className="text-white" size={28} />
                </div>

                {/* Title */}
                <h3 className="relative z-10 mb-4 text-2xl font-bold leading-snug text-gray-900">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-lg leading-relaxed text-gray-600">
                  {benefit.description}
                </p>

                {/* Decorative Dot */}
                <div className="absolute top-5 right-5 h-3 w-3 rounded-full bg-green-400 opacity-70 transition-transform duration-500 group-hover:scale-125"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}