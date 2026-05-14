"use client";

import {
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Fingerprint,
  Wallet,
  Landmark,
} from "lucide-react";

export default function AadhaarPayHeroSection() {
  const services = [
    "Cash Deposit",
    "Cash Withdrawal",
    "Balance Enquiry",
    "Mini Statement",
  ];

  const features = [
    {
      icon: Fingerprint,
      title: "Biometric Authentication",
      desc: "Secure Aadhaar-based fingerprint verification for every transaction.",
    },
    {
      icon: Wallet,
      title: "Instant Banking Access",
      desc: "Provide fast financial services without cards or physical bank visits.",
    },
    {
      icon: Landmark,
      title: "Nationwide Banking",
      desc: "Serve customers across India with Aadhaar-enabled banking solutions.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-100 via-white to-cyan-50 py-24">
      {/* Premium Background */}
      <div className="absolute top-0 left-0 h-[450px] w-[450px] rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-cyan-100/30 blur-3xl"></div>

      {/* Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_60%)]"></div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-2 lg:px-16">
        {/* Left Section */}
        <div>
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-800 shadow-md">
            <ShieldCheck size={18} />
            Aadhaar Enabled Payment Solutions
          </span>

          {/* Heading */}
          <h1 className="mb-8 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl lg:text-7xl">
            Best{" "}
            <span className="bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
              Aadhaar Pay
            </span>{" "}
            Services
          </h1>

          {/* Description */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            PayTrue delivers secure Aadhaar Pay and AEPS solutions for retailers,
            merchants, and customers. Enable biometric banking services including
            withdrawals, deposits, balance enquiries, and mini statements with
            unmatched security.
          </p>

          {/* CTA Buttons */}
          <div className="mb-14 flex flex-col gap-4 sm:flex-row">
            <button className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-900 px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:opacity-90">
              Start Aadhaar Pay
              <ArrowRight size={20} />
            </button>

            <button className="rounded-2xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-800 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-50">
              Learn More
            </button>
          </div>

          {/* Features */}
        </div>

        {/* Right Section */}
        <div className="relative">
          {/* Main Hero Card */}
          <div className="overflow-hidden rounded-[36px] border border-white bg-white shadow-2xl">
            <div className="relative">
              <img
                src="https://img.freepik.com/free-vector/biometric-authentication-concept-illustration_114360-7869.jpg?w=1800"
                alt="Aadhaar Pay Service"
                className="h-[650px] w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              {/* Floating Service Panel */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/90 p-6 backdrop-blur-xl shadow-xl">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Aadhaar Banking Services
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                  {services.map((service, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-blue-50 px-4 py-3 text-center text-sm font-semibold text-blue-800"
                    >
                      {service}
                    </div>
                  ))}
                </div>

                <div className="mt-5 h-2 rounded-full bg-gray-200">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-700"></div>
                </div>

                <p className="mt-4 text-gray-600">
                  Empowering secure Aadhaar-linked digital banking nationwide.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -left-10 top-10 rounded-3xl bg-white p-6 shadow-2xl">
            <h4 className="text-4xl font-extrabold text-blue-800">
              99.9%
            </h4>
            <p className="mt-2 text-gray-600">Secure Transactions</p>
          </div>

          <div className="absolute -right-8 bottom-12 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-700 p-6 text-white shadow-2xl">
            <h4 className="text-4xl font-extrabold">24/7</h4>
            <p className="mt-2 text-cyan-100">Banking Access</p>
          </div>

          {/* Floating Icons */}
          <div className="absolute right-16 top-20 rounded-2xl bg-white p-4 shadow-xl">
            <Fingerprint className="text-blue-700" size={32} />
          </div>

          <div className="absolute left-20 bottom-24 rounded-2xl bg-white p-4 shadow-xl">
            <BadgeCheck className="text-cyan-600" size={32} />
          </div>
        </div>
      </div>
    </section>
  );
}