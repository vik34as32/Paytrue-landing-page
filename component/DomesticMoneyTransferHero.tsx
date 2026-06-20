"use client";

import {
  ArrowRight,
  ShieldCheck,
  Landmark,
  Smartphone,
  BadgeCheck,
} from "lucide-react";

export default function DomesticMoneyTransferHero() {
  const steps = [
    {
      icon: Smartphone,
      title: "Enter Sender Details",
      desc: "Retailer securely enters sender and recipient bank account details.",
    },
    {
      icon: Landmark,
      title: "Bank to Bank Transfer",
      desc: "Money is transferred instantly to any domestic bank account securely.",
    },
    {
      icon: BadgeCheck,
      title: "Instant Confirmation",
      desc: "Both sender and receiver get secure real-time confirmation.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#0A84FF] via-[#0057D9] to-slate-950 py-24 text-white">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-3xl"></div>

      {/* Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-2 lg:px-16">
        {/* Left Section */}
        <div>
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-md">
            <ShieldCheck size={18} className="text-cyan-400" />
            Fast • Easy • Secure Domestic Money Transfer
          </span>

          {/* Heading */}
          <h1 className="mb-8 text-4xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
            Best{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
              Money Transfer
            </span>{" "}
            Services
          </h1>

          {/* Description */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl">
            PayTrue provides secure bank-to-bank domestic money transfer
            solutions for retailers, businesses, and customers. Transfer money
            instantly anywhere in India with trusted technology, low fees, and
            real-time secure processing.
          </p>

          {/* Buttons */}
          <div className="mb-14 flex flex-col gap-4 sm:flex-row">
            <button className="flex items-center justify-center gap-3 rounded-2xl bg-cyan-500 px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-cyan-400">
              Start Transfer
              <ArrowRight size={20} />
            </button>

            <button className="rounded-2xl border border-white/20 bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20">
              Learn More
            </button>
          </div>

          {/* Steps */}
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-lg transition-all duration-300 hover:bg-white/15"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/20">
                    <Icon className="text-cyan-300" size={28} />
                  </div>

                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>

                  <p className="text-sm leading-relaxed text-slate-200">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className="relative">
          {/* Main Hero Image */}
          <div className="overflow-hidden rounded-[36px] border border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
            <div className="relative">
              <img
                src="/images/domestic_money_transfer/money_transfer.png"
                alt="User to User Money Transfer Illustration"
                className="h-[600px] w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent"></div>

              {/* Floating Info Card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Instant User to User Transfers
                </h3>

                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span>Sender Wallet</span>
                  <ArrowRight className="text-cyan-300" />
                  <span>Receiver Bank</span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                </div>

                <p className="mt-4 text-slate-200">
                  Safe, secure, and instant domestic money transfer across
                  India.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -left-10 top-10 rounded-3xl bg-white p-6 shadow-2xl">
            <h4 className="text-4xl font-extrabold text-[#0057D9]">50K+</h4>
            <p className="mt-2 text-gray-600">Daily Transfers</p>
          </div>

          <div className="absolute -right-8 bottom-12 rounded-3xl bg-cyan-500 p-6 text-white shadow-2xl">
            <h4 className="text-4xl font-extrabold">99.9%</h4>
            <p className="mt-2 text-cyan-100">Secure Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}