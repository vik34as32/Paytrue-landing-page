"use client";

import {
  ArrowRight,
  Fingerprint,
  ShieldCheck,
  Wallet,
  BadgeCheck,
} from "lucide-react";

export default function AEPSHeroSection() {
  const features = [
    {
      icon: Fingerprint,
      title: "Biometric Authentication",
      desc: "Secure Aadhaar verification with fingerprint authentication.",
    },
    {
      icon: Wallet,
      title: "Cash Withdrawal",
      desc: "Instant secure cash withdrawal from Aadhaar linked bank accounts.",
    },
    {
      icon: BadgeCheck,
      title: "Balance Enquiry",
      desc: "Check account balance and mini statements in real-time.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-100 via-white to-blue-50 py-24">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-100/40 blur-3xl"></div>

      {/* Circular Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,87,217,0.04),transparent_65%)]"></div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-2 lg:px-16">
        {/* Left Content */}
        <div>
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
            <ShieldCheck size={18} />
            Secure Aadhaar Enabled Payment System
          </span>

          {/* Heading */}
          <h1 className="mb-8 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl lg:text-7xl">
            Best{" "}
            <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
              AEPS
            </span>{" "}
            Services
          </h1>

          {/* Description */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            PayTrue empowers retailers and businesses with secure AEPS solutions
            including Aadhaar based cash withdrawal, balance enquiry, mini
            statements, and biometric banking services across India.
          </p>

          {/* CTA Buttons */}
          <div className="mb-14 flex flex-col gap-4 sm:flex-row">
            <button className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:opacity-90">
              Start AEPS Service
              <ArrowRight size={20} />
            </button>

            <button className="rounded-2xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-800 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-50">
              Learn More
            </button>
          </div>

          {/* Features */}
          <div className="grid gap-5 sm:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                    <Icon className="text-[#0057D9]" size={28} />
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

        {/* Right Visual */}
        <div className="relative">
          {/* Main Hero Card */}
          <div className="overflow-hidden rounded-[36px] border border-white bg-white shadow-2xl">
            <div className="relative">
              <img
                src="/images/Aeps.jpeg"
                alt="AEPS Services Illustration"
                className="h-[650px] w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              {/* Floating Info Card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/90 p-6 backdrop-blur-xl shadow-xl">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Aadhaar Banking Made Easy
                </h3>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Fingerprint Verify</span>
                  <ArrowRight className="text-[#0057D9]" />
                  <span>Secure Transaction</span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-gray-200">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>
                </div>

                <p className="mt-4 text-gray-600">
                  Fast, safe, and reliable biometric financial transactions.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
            {/* <div className="absolute -left-10 top-10 rounded-3xl bg-white p-6 shadow-2xl">
              <h4 className="text-4xl font-extrabold text-[#0057D9]">10K+</h4>
              <p className="mt-2 text-gray-600">Retailers Connected</p>
            </div> */}

          <div className="absolute -right-8 bottom-12 rounded-3xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] p-6 text-white shadow-2xl">
            <h4 className="text-4xl font-extrabold">99.9%</h4>
            <p className="mt-2 text-blue-100">Secure Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}