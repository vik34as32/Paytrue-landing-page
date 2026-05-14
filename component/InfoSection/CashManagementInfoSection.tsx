"use client";

import {
  BadgeCheck,
  Wallet,
  ShieldCheck,
  Landmark,
  BarChart3,
  ArrowRight,
} from "lucide-react";

export default function CashManagementInfoSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-24">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="mb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
            <BadgeCheck size={18} />
            Advanced Financial Operations
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Cash Management{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              Services
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
            Empowering businesses, retailers, and enterprises with secure,
            streamlined, and intelligent cash flow management solutions.
          </p>
        </div>

        {/* Main Info Grid */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <h3 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              Smart Financial Control for{" "}
              <span className="text-[#0057D9]">Business Growth</span>
            </h3>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Cash Management Services are specialized financial solutions
              designed to help businesses efficiently manage collections,
              disbursements, liquidity, and daily operational cash flow while
              ensuring financial stability and business scalability.
            </p>

            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              PayTrue’s CMS platform enables organizations to simplify treasury
              management, reduce operational risks, optimize cash flow cycles,
              and strengthen financial decision-making through secure digital
              infrastructure.
            </p>

            {/* Highlight Card */}
            <div className="mt-8 rounded-3xl border-l-4 border-[#0057D9] bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow-md">
              <p className="text-lg leading-relaxed text-gray-700">
                <strong className="text-[#0057D9]">
                  Cash Management Services
                </strong>{" "}
                help organizations streamline{" "}
                <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-[#0057D9]">
                  collections
                </span>
                ,{" "}
                <span className="rounded-lg bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                  disbursements
                </span>
                , and{" "}
                <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-[#0057D9]">
                  treasury operations
                </span>{" "}
                for long-term business efficiency and profitability.
              </p>
            </div>

            {/* Features */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {[
                {
                  icon: Wallet,
                  title: "Cash Flow Optimization",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure Transactions",
                },
                {
                  icon: Landmark,
                  title: "Treasury Management",
                },
                {
                  icon: BarChart3,
                  title: "Financial Reporting",
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9]">
                      <Icon className="text-white" size={22} />
                    </div>
                    <span className="font-semibold text-gray-800">
                      {item.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button className="mt-10 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:opacity-90">
              Explore CMS Solutions
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Image Section */}
          <div className="relative">
            <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1400&auto=format&fit=crop"
                alt="Cash Management Dashboard"
                className="h-[650px] w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

              {/* Floating Stats Card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <h3 className="text-2xl font-bold text-white">
                  Secure Cash Flow Ecosystem
                </h3>
                <p className="mt-2 text-blue-100">
                  Intelligent business cash management for retailers,
                  enterprises, and financial professionals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}