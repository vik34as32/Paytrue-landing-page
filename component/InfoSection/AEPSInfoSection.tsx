"use client";

import {
  ShieldCheck,
  Fingerprint,
  Wallet,
  BadgeCheck,
  Landmark,
  CreditCard,
} from "lucide-react";

export default function AEPSInfoSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-cyan-100/30 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
              <ShieldCheck size={18} />
              Aadhaar Enabled Banking Solutions
            </span>

            {/* Heading */}
            <h2 className="mb-8 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl lg:text-6xl">
              What is{" "}
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                AEPS?
              </span>
            </h2>

            {/* Main Description */}
            <p className="mb-8 text-lg leading-relaxed text-gray-600 md:text-xl">
              Aadhaar Enabled Payment System (AEPS) is a revolutionary banking
              service that empowers customers to securely access their bank
              accounts using Aadhaar authentication. Through biometric
              verification, users can perform essential banking services like
              cash withdrawals, balance enquiries, and mini statements without
              needing cards or traditional banking infrastructure.
            </p>

            {/* Highlight Card */}
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-xl">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Secure Aadhaar Banking Access
              </h3>

              <p className="text-lg leading-relaxed text-gray-700">
                AEPS allows Aadhaar cardholders to perform secure financial
                transactions using only{" "}
                <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-[#0057D9]">
                  biometric authentication
                </span>{" "}
                and their{" "}
                <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-[#0057D9]">
                  12-digit Aadhaar number
                </span>
                , making banking simpler, safer, and more accessible.
              </p>
            </div>
          </div>

          {/* Right Visual Section */}
          <div className="relative">
            {/* Main Image Card */}
            <div className="overflow-hidden rounded-[36px] border border-white bg-white shadow-2xl">
              <div className="relative">
                <img
                  src="/images/AEPS2.jpeg"
                  alt="AEPS Aadhaar Banking Illustration"
                  className="h-[700px] w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>

                {/* Bottom Info Card */}
                <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/90 p-6 backdrop-blur-xl shadow-xl">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">
                    Aadhaar Banking Services
                  </h3>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
                    {[
                      "Cash Withdrawal",
                      "Balance Enquiry",
                      "Mini Statement",
                      "Secure Banking",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-xl bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-[#0057D9]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Aadhaar Security Card */}
            <div className="absolute -left-10 top-12 rounded-3xl bg-white p-6 shadow-2xl">
              <Fingerprint className="mb-3 text-[#0057D9]" size={38} />
              <h4 className="text-xl font-bold text-gray-900">100%</h4>
              <p className="text-gray-600">Biometric Security</p>
            </div>

            {/* Floating Banking Card */}
            <div className="absolute -right-8 bottom-12 rounded-3xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] p-6 text-white shadow-2xl">
              <BadgeCheck className="mb-3 text-white" size={34} />
              <h4 className="text-2xl font-bold">24/7</h4>
              <p className="text-blue-100">Banking Access</p>
            </div>
          </div>
        </div>

        {/* Bottom Features */}
      </div>
    </section>
  );
}