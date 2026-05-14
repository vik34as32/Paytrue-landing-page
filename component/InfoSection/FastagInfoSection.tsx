"use client";

import {
  Car,
  ShieldCheck,
  Zap,
  BadgeCheck,
  CreditCard,
} from "lucide-react";

export default function FastagInfoSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-green-50 py-24">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full bg-green-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-emerald-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-white px-5 py-2 text-sm font-semibold text-green-700 shadow-md">
              <BadgeCheck size={18} />
              Digital Toll Payment Solution
            </span>

            {/* Heading */}
            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              Seamless{" "}
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
                Fastag Services
              </span>
            </h2>

            {/* Main Description */}
            <p className="mt-8 text-lg leading-relaxed text-gray-700 md:text-xl">
              <span className="font-bold text-gray-900">
                Fastag revolutionizes toll collection
              </span>{" "}
              through RFID-enabled digital payment technology, allowing
              vehicles to pass toll plazas faster without stopping for cash
              transactions.
            </p>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              PayTrue’s Fastag services provide quick recharge, account
              management, balance tracking, and secure toll payments across
              India’s national highway network.
            </p>

            {/* Premium Info Box */}
            <div className="mt-10 rounded-[30px] border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow-xl">
              <p className="text-lg leading-relaxed text-gray-700">
                <span className="font-bold text-gray-900">
                  How it works:
                </span>{" "}
                As your vehicle approaches the toll plaza, the Fastag scanner
                automatically detects your RFID tag and deducts the toll amount
                instantly from your linked bank account or prepaid wallet —
                ensuring faster journeys, reduced waiting times, and secure
                digital transactions.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                {
                  icon: Zap,
                  title: "Instant Toll Payments",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure Transactions",
                },
                {
                  icon: Car,
                  title: "Faster Travel",
                },
                {
                  icon: CreditCard,
                  title: "Easy Recharge",
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md"
                  >
                    <div className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 p-3">
                      <Icon className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-gray-800">
                      {feature.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            {/* Main Card */}
            <div className="group relative overflow-hidden rounded-[36px] border border-white/60 bg-white p-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50"></div>

              <img
                src="/fastag-info.png"
                alt="Fastag Toll Services"
                className="relative z-10 w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Label */}
              <div className="absolute top-8 left-8 z-20 rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md">
                <p className="text-sm font-semibold text-green-700">
                  RFID Enabled Toll Automation
                </p>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-8 -left-8 rounded-3xl bg-white p-6 shadow-2xl">
              <h4 className="text-3xl font-extrabold text-green-600">
                500+
              </h4>
              <p className="mt-1 text-gray-600">
                Supported Toll Plazas Nationwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}