"use client";

import {
  Globe,
  Briefcase,
  Zap,
  Clock3,
  ShieldCheck,
  BarChart3,
  Wallet,
  BadgeCheck,
} from "lucide-react";

const cashManagementBenefits = [
  {
    icon: Globe,
    title: "Nationwide Network Coverage",
    description:
      "Leverage an extensive financial service network across India for seamless cash collection, deposit, and disbursement operations.",
  },
  {
    icon: Briefcase,
    title: "Comprehensive CMS Solutions",
    description:
      "Access diversified cash management products tailored for retailers, distributors, enterprises, and growing businesses.",
  },
  {
    icon: Zap,
    title: "Advanced Technology Support",
    description:
      "Utilize modern fintech infrastructure for streamlined treasury management, operational efficiency, and automation.",
  },
  {
    icon: Clock3,
    title: "Timely Processing",
    description:
      "Ensure faster collections, secure settlements, and prompt disbursement services with optimized financial workflows.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Financial Operations",
    description:
      "Protect your business with encrypted transactions, compliance frameworks, and enterprise-grade security systems.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Reporting",
    description:
      "Track collections, liquidity, and business cash flow with actionable financial insights and reporting dashboards.",
  },
  {
    icon: Wallet,
    title: "Improved Cash Flow Control",
    description:
      "Optimize working capital, reduce idle funds, and enhance financial decision-making with better liquidity management.",
  },
  {
    icon: BadgeCheck,
    title: "Scalable Business Growth",
    description:
      "Empower your enterprise with reliable CMS solutions designed for long-term expansion and operational excellence.",
  },
];

export default function CashManagementBenefitsSection() {
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
            Business Financial Advantages
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Benefits of{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              Cash Management Services
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            Accelerate financial efficiency, streamline treasury operations,
            and unlock scalable business growth with secure CMS solutions.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {cashManagementBenefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[30px] border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
              >
                {/* Top Border */}
                <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50 group-hover:to-cyan-50 transition-all duration-500"></div>

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
                <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-cyan-400 opacity-70 group-hover:scale-125 transition-transform duration-500"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}