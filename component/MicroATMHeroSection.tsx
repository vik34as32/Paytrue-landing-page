"use client";

import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Landmark,
  BadgeCheck,
  Wallet,
  Smartphone,
} from "lucide-react";

export default function MicroATMHeroSection() {
  const atmFeatures = [
    {
      icon: CreditCard,
      title: "Cash Withdrawal",
      desc: "Provide instant customer cash withdrawals securely anywhere.",
    },
    {
      icon: BadgeCheck,
      title: "Balance Inquiry",
      desc: "Quick account balance checks through secure banking APIs.",
    },
    {
      icon: Smartphone,
      title: "Mini Statements",
      desc: "Offer transaction history and banking access instantly.",
    },
  ];

  const serviceTags = [
    "Cash Withdrawal",
    "Balance Check",
    "Mini Statement",
    "Retail Banking",
    "Secure Access",
    "Instant Service",
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-violet-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-violet-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-3xl"></div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05),transparent_65%)]"></div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-2 lg:px-16">
        {/* Left Content */}
        <div>
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white px-5 py-2 text-sm font-semibold text-violet-700 shadow-md">
            <ShieldCheck size={18} />
            Secure Micro ATM Banking Services
          </span>

          {/* Heading */}
          <h1 className="mb-8 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl lg:text-7xl">
            Best{" "}
            <span className="bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
              Micro ATM
            </span>{" "}
            Services
          </h1>

          {/* Description */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            PayTrue empowers retailers and business owners with premium Micro
            ATM solutions for secure cash withdrawals, balance enquiries, mini
            statements, and digital banking services designed for India's
            growing financial ecosystem.
          </p>

          {/* CTA Buttons */}
          <div className="mb-14 flex flex-col gap-4 sm:flex-row">
            <button className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:opacity-90">
              Start M-ATM Service
              <ArrowRight size={20} />
            </button>

            <button className="rounded-2xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-800 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-50">
              Learn More
            </button>
          </div>

          {/* Features */}
          <div className="grid gap-5 sm:grid-cols-3">
            {atmFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
                    <Icon className="text-violet-600" size={28} />
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-gray-900">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Visual Section */}
        <div className="relative">
          {/* Main Hero Card */}
          <div className="overflow-hidden rounded-[36px] border border-white bg-white shadow-2xl">
            <div className="relative">
              <img
                src="https://img.freepik.com/free-vector/pos-terminal-concept-illustration_114360-9097.jpg?w=1800"
                alt="Micro ATM Service Illustration"
                className="h-[650px] w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              {/* Bottom Card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/90 p-6 backdrop-blur-xl shadow-xl">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Next-Gen Retail Banking Solutions
                </h3>

                <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
                  {serviceTags.map((tag, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-violet-50 px-3 py-2 text-center text-sm font-semibold text-violet-700"
                    >
                      {tag}
                    </div>
                  ))}
                </div>

                <div className="mt-4 h-2 rounded-full bg-gray-200">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600"></div>
                </div>

                <p className="mt-4 text-gray-600">
                  Advanced Micro ATM services for secure financial growth.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -left-10 top-10 rounded-3xl bg-white p-6 shadow-2xl">
            <h4 className="text-4xl font-extrabold text-violet-600">
              ₹25Cr+
            </h4>
            <p className="mt-2 text-gray-600">Monthly Transactions</p>
          </div>

          <div className="absolute -right-8 bottom-12 rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 text-white shadow-2xl">
            <h4 className="text-4xl font-extrabold">24/7</h4>
            <p className="mt-2 text-violet-100">Retail Banking</p>
          </div>

          {/* Floating Icons */}
          <div className="absolute right-16 top-20 rounded-2xl bg-white p-4 shadow-xl">
            <Wallet className="text-violet-600" size={32} />
          </div>

          <div className="absolute left-20 bottom-24 rounded-2xl bg-white p-4 shadow-xl">
            <Landmark className="text-purple-600" size={32} />
          </div>
        </div>
      </div>
    </section>
  );
}