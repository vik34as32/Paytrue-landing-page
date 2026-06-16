"use client";

import {
  Smartphone,
  Wifi,
  Tv,
  Zap,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
} from "lucide-react";

const providers = [
  { name: "Jio", color: "bg-blue-500" },
  { name: "Airtel", color: "bg-red-500" },
  { name: "VI", color: "bg-yellow-500" },
  { name: "BSNL", color: "bg-green-500" },
  { name: "DishTV", color: "bg-orange-500" },
  { name: "Reliance", color: "bg-purple-500" },
];

export default function RechargeInfoSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-100/30 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white px-5 py-2 text-sm font-semibold text-cyan-700 shadow-md">
              <ShieldCheck size={18} />
              All-in-One Recharge Solutions
            </span>

            {/* Heading */}
            <h2 className="mb-8 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              Recharge Anytime,{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Anywhere
              </span>
            </h2>

            {/* Main Description */}
            <p className="mb-8 text-lg leading-relaxed text-gray-600 md:text-xl">
              Mobile phones are essential to modern life, and PayTrue makes
              online mobile recharge seamless for everyone. Recharge prepaid
              mobile, DTH, broadband, and utility services instantly from
              anywhere using secure digital payment methods.
            </p>

            {/* Highlight Box */}
            <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 shadow-xl">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Multiple Operator Recharge Platform
              </h3>

              <p className="text-lg leading-relaxed text-gray-700">
                PayTrue supports secure{" "}
                <span className="rounded-lg bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                  mobile recharge
                </span>{" "}
                and{" "}
                <span className="rounded-lg bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                  bill payments
                </span>{" "}
                across all major telecom and DTH providers with fast processing,
                cashback offers, and multiple payment options.
              </p>

              {/* Provider Pills */}
              <div className="mt-6 flex flex-wrap gap-3">
                {providers.map((provider, i) => (
                  <span
                    key={i}
                    className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md ${provider.color}`}
                  >
                    {provider.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Section */}
          <div className="relative">
            {/* Main Visual Card */}
            <div className="overflow-hidden rounded-[36px] border border-white bg-white shadow-2xl">
              <div className="relative">
                <img
                  src="/images/recharge.png"
                  alt="Recharge Services Illustration"
                  className="h-[700px] w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                {/* Floating Provider Section */}
                <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/90 p-6 backdrop-blur-xl shadow-xl">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">
                    Supported Recharge Providers
                  </h3>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {providers.map((provider, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-cyan-50 px-3 py-2 text-center text-sm font-semibold text-cyan-700"
                      >
                        {provider.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -left-10 top-12 rounded-3xl bg-white p-6 shadow-2xl">
              <Smartphone className="mb-3 text-cyan-600" size={36} />
              <h4 className="text-3xl font-extrabold text-cyan-600">
                6+
              </h4>
              <p className="text-gray-600">Major Operators</p>
            </div>

            <div className="absolute -right-8 bottom-12 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white shadow-2xl">
              <BadgeCheck className="mb-3 text-white" size={34} />
              <h4 className="text-2xl font-bold">24/7</h4>
              <p className="text-cyan-100">Instant Recharge</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}