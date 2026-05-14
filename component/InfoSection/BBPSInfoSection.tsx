"use client";

import { ShieldCheck, BadgeCheck, Zap, Globe } from "lucide-react";

export default function BBPSInfoSection() {
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
              Bharat Bill Payment System
            </span>

            {/* Heading */}
            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              Smart & Secure{" "}
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                BBPS Services
              </span>
            </h2>

            {/* Description */}
            <p className="mt-8 text-lg leading-relaxed text-gray-700 md:text-xl">
              <span className="font-bold text-gray-900">
                Bharat Bill Payment System (BBPS)
              </span>{" "}
              empowers users with secure, centralized, and convenient bill
              payment solutions for electricity, water, gas, telecom, DTH,
              broadband, and many recurring services.
            </p>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              PayTrue’s BBPS platform helps retailers and customers manage
              multiple utility payments seamlessly with instant confirmations,
              secure processing, and nationwide accessibility.
            </p>

            {/* Premium Info Box */}
            <div className="mt-10 rounded-[30px] border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 shadow-xl">
              <p className="text-lg leading-relaxed text-gray-700">
                It also supports{" "}
                <span className="rounded-lg bg-blue-100 px-3 py-1 font-semibold text-[#0057D9]">
                  e-commerce payments
                </span>{" "}
                and regulated financial transactions under the guidance of{" "}
                <span className="rounded-lg bg-blue-100 px-3 py-1 font-semibold text-[#0057D9]">
                  Reserve Bank of India (RBI)
                </span>
                , ensuring trusted service delivery through authorized entities,
                agents, and banking partners.
              </p>
            </div>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure Payments",
                },
                {
                  icon: Zap,
                  title: "Instant Processing",
                },
                {
                  icon: Globe,
                  title: "All India Access",
                },
                {
                  icon: BadgeCheck,
                  title: "Trusted Platform",
                },
              ].map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-md"
                  >
                    <div className="rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] p-3">
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50"></div>

              <img
                src="/bbps-info.png"
                alt="BBPS Services"
                className="relative z-10 w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Label */}
              <div className="absolute top-8 left-8 z-20 rounded-2xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur-md">
                <p className="text-sm font-semibold text-[#0057D9]">
                  Multi-Bill Payment Ecosystem
                </p>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-8 -left-8 rounded-3xl bg-white p-6 shadow-2xl">
              <h4 className="text-3xl font-extrabold text-[#0057D9]">100+</h4>
              <p className="mt-1 text-gray-600">Bill Categories Supported</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}