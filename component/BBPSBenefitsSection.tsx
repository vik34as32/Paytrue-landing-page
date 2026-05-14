"use client";

import {
  ShieldCheck,
  BadgeDollarSign,
  FileText,
  Network,
  Smartphone,
  RefreshCcw,
  Receipt,
  Landmark,
} from "lucide-react";

const bbpsBenefits = [
  {
    icon: ShieldCheck,
    title: "Trusted & Secure Payments",
    description:
      "Advanced encryption, RBI-backed systems, and regulated processing ensure every bill payment remains safe and reliable.",
  },
  {
    icon: BadgeDollarSign,
    title: "Transparent Pricing",
    description:
      "Clear service charges with instant payment confirmations for complete transparency across all BBPS transactions.",
  },
  {
    icon: FileText,
    title: "Standardized Billing Rules",
    description:
      "Uniform payment standards across providers deliver consistent experiences for customers nationwide.",
  },
  {
    icon: Network,
    title: "Nationwide Network Reach",
    description:
      "Pay utility bills through banks, agents, retailers, and digital channels across India.",
  },
  {
    icon: Smartphone,
    title: "Multiple Payment Channels",
    description:
      "Access services via mobile apps, portals, net banking, UPI, and offline payment centers.",
  },
  {
    icon: RefreshCcw,
    title: "Automated Recurring Payments",
    description:
      "Simplify recurring payments for electricity, water, gas, DTH, and subscriptions with scheduled transactions.",
  },
  {
    icon: Receipt,
    title: "Complete Payment History",
    description:
      "Track every transaction with digital receipts, billing history, and instant payment records.",
  },
  {
    icon: Landmark,
    title: "RBI Authorized Ecosystem",
    description:
      "Built under Reserve Bank of India regulations, ensuring maximum compliance, trust, and operational security.",
  },
];

export default function BBPSBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
            <ShieldCheck size={18} />
            Bharat Bill Payment Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              BBPS
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            PayTrue’s BBPS platform delivers seamless, secure, and scalable
            bill payment solutions with nationwide accessibility for customers
            and retailers.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {bbpsBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="group relative rounded-[30px] border border-blue-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-blue-50/0 to-cyan-50/0 transition-all duration-500 group-hover:from-blue-50 group-hover:to-cyan-50"></div>

                {/* Icon */}
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] shadow-lg">
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
                <div className="absolute top-5 right-5 h-3 w-3 rounded-full bg-cyan-400 opacity-70 transition-transform duration-500 group-hover:scale-125"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}