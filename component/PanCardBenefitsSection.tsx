"use client";

import {
  Landmark,
  BadgeDollarSign,
  CreditCard,
  Briefcase,
  Building2,
  Wallet,
  BadgeCheck,
} from "lucide-react";

const panBenefits = [
  {
    icon: Landmark,
    title: "Bank Account Opening",
    description:
      "PAN Card is essential for opening savings or current bank accounts and enables secure access to India's banking ecosystem.",
  },
  {
    icon: BadgeDollarSign,
    title: "Income Tax Compliance",
    description:
      "Mandatory for filing Income Tax Returns (ITR), ensuring smooth tax management, legal compliance, and financial transparency.",
  },
  {
    icon: CreditCard,
    title: "Credit Score Verification",
    description:
      "Required for checking CIBIL scores, loan approvals, and maintaining verified creditworthiness for financial institutions.",
  },
  {
    icon: Briefcase,
    title: "Business Transactions",
    description:
      "Supports high-value business dealings, vendor payments, invoicing, and official financial transactions.",
  },
  {
    icon: Building2,
    title: "Business Registration",
    description:
      "Necessary for GST registration, company incorporation, and maintaining compliant business operations.",
  },
  {
    icon: Wallet,
    title: "Investment & Wealth Management",
    description:
      "Required for mutual funds, stock market investments, fixed deposits, and all regulated financial products.",
  },
];

export default function PanCardBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
            <BadgeCheck size={18} />
            Financial Identity Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              PAN Card Center
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            PAN Card empowers individuals and businesses with trusted identity,
            taxation, banking, investment, and compliance solutions for
            long-term financial growth.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
          {panBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-10 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50 group-hover:to-cyan-50 transition-all duration-500"></div>

                {/* Top Border Accent */}
                <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

                {/* Icon */}
                <div className="relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] shadow-lg">
                  <Icon className="text-white" size={28} />
                </div>

                {/* Title */}
                <h3 className="relative z-10 mb-5 text-2xl font-bold text-gray-900">
                  {benefit.title}
                </h3>

                {/* Description */}
                <p className="relative z-10 text-lg leading-relaxed text-gray-600">
                  {benefit.description}
                </p>

                {/* Decorative Corner */}
                <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-cyan-400 opacity-70 group-hover:scale-125 transition-transform duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}