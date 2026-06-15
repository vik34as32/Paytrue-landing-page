"use client";

import {
  Fingerprint,
  ShieldCheck,
  Wallet,
  BadgeCheck,
  Smartphone,
  ArrowRightLeft,
} from "lucide-react";

export default function AadhaarPayInfoSection() {
  const services = [
    {
      icon: Wallet,
      title: "Cash Withdrawal",
      desc: "Enable customers to withdraw funds securely using Aadhaar authentication.",
    },
    {
      icon: ShieldCheck,
      title: "Balance Enquiry",
      desc: "Instantly access linked bank account balances with biometric verification.",
    },
    {
      icon: ArrowRightLeft,
      title: "Instant Settlement",
      desc: "Real-time merchant settlement directly into registered bank accounts.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-24">
      {/* Background Blur Effects */}
      <div className="absolute top-0 left-0 h-[350px] w-[350px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-800 shadow-md">
            <BadgeCheck size={18} />
            Aadhaar Enabled Digital Payments
          </span>

          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
            Aadhaar Pay{" "}
            <span className="bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
              Service
            </span>
          </h2>

          <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-blue-700 to-cyan-600"></div>
        </div>

        {/* Main Section */}
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <h3 className="mb-8 text-3xl font-bold text-gray-900 leading-snug">
              Secure Merchant Payments Through Aadhaar Authentication
            </h3>

            <div className="space-y-6 text-lg leading-relaxed text-gray-600">
              <p>
                Aadhaar Pay is an innovative payment solution that allows
                merchants to collect digital payments directly from customers
                using their Aadhaar number and biometric verification.
              </p>

              <p>
                The Aadhaar-linked bank account of the customer is securely
                debited, while the merchant’s account is credited instantly —
                enabling seamless cashless transactions without debit cards,
                mobile wallets, or UPI.
              </p>

              <p>
                Registration is simple, app-based, and designed for merchants,
                retailers, and service providers. Users can easily register
                using Aadhaar credentials and fingerprint authentication.
              </p>
            </div>

            {/* Highlight Box */}
            <div className="mt-10 rounded-[28px] border-l-4 border-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow-lg">
              <h4 className="mb-4 text-2xl font-bold text-gray-900">
                Why Aadhaar Pay?
              </h4>

              <p className="text-lg leading-relaxed text-gray-700">
                Aadhaar Pay offers a secure, cardless, and cashless payment
                ecosystem, making financial transactions highly accessible for
                merchants and rural banking customers across India.
              </p>
            </div>
          </div>

          {/* Right Image + Services */}
          <div className="relative">
            {/* Main Card */}
            <div className="rounded-[36px] border border-white bg-white p-8 shadow-2xl">
              <img
                src="/images/AEPS.jpeg"
                alt="Aadhaar Pay Illustration"
                className="w-full rounded-3xl object-cover"
              />
            </div>

            {/* Floating Security Badge */}
            <div className="absolute -top-8 left-10 rounded-3xl bg-white p-5 shadow-2xl">
              <Fingerprint className="text-blue-700" size={34} />
            </div>

            <div className="absolute -bottom-8 right-10 rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-600 p-5 text-white shadow-2xl">
              <Smartphone size={34} />
            </div>

            {/* Service Cards */}
            <div className="mt-10 grid gap-5">
              {services.map((service, index) => {
                const Icon = service.icon;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                      <Icon className="text-blue-800" size={28} />
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {service.title}
                      </h4>
                      <p className="mt-2 text-gray-600 leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}