"use client";

import {
  BadgeCheck,
  ShieldCheck,
  FileText,
  Landmark,
  CreditCard,
} from "lucide-react";

export default function PanCardInfoSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
              <BadgeCheck size={18} />
              Identity & Financial Verification
            </span>

            {/* Heading */}
            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              What is{" "}
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                PAN Card?
              </span>
            </h2>

            {/* Description */}
            <p className="mt-8 text-lg leading-relaxed text-gray-700 md:text-xl">
              <span className="font-bold text-gray-900">
                PAN (Permanent Account Number)
              </span>{" "}
              is an essential government-issued identification used for
              banking, taxation, financial investments, and secure identity
              verification across India.
            </p>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              It helps individuals and businesses conduct financial
              transactions, open bank accounts, file tax returns, and maintain
              transparent financial records under regulatory frameworks.
            </p>

            {/* Premium Info Box */}
            <div className="mt-10 rounded-[30px] border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-xl">
              <p className="text-lg leading-relaxed text-gray-700">
                PAN Card securely stores your{" "}
                <span className="rounded-lg bg-blue-100 px-3 py-1 font-semibold text-[#0057D9]">
                  financial identity
                </span>
                , enabling access to services like taxation, investments,
                banking, and digital financial ecosystems with enhanced
                compliance and security.
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            {/* Main Image Card */}
            <div className="group relative overflow-hidden rounded-[36px] border border-white/60 bg-white p-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50"></div>

              <img
                src="/images/pancard/PancardCenter2.png"
                alt="PAN Card Information"
                className="relative z-10 w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Label */}
              <div className="absolute top-8 left-8 z-20 rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md">
                <p className="text-sm font-semibold text-[#0057D9]">
                  PAN Verification & Identity
                </p>
              </div>
            </div>

            {/* Floating Stats */}
            {/* <div className="absolute -bottom-8 -left-8 rounded-3xl bg-white p-6 shadow-2xl">
              <h4 className="text-3xl font-extrabold text-[#0057D9]">
                100%
              </h4>
              <p className="mt-1 text-gray-600">
                Essential for Financial Compliance
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
}