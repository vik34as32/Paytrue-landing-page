"use client";

import {
  MonitorSmartphone,
  Wallet,
  ShieldCheck,
  Receipt,
  Landmark,
  BadgeCheck,
  Cpu,
  Smartphone,
  ArrowRight,
} from "lucide-react";

/* ---------------- Features ---------------- */
const microAtmBenefits = [
  {
    icon: MonitorSmartphone,
    title: "Portable Banking Device",
    description:
      "Compact and easy-to-use Micro-ATM devices allow retailers and agents to deliver banking services anywhere.",
  },
  {
    icon: Wallet,
    title: "Instant Cash Withdrawal",
    description:
      "Enable customers to withdraw cash securely using Aadhaar, debit cards, or biometric authentication instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Transactions",
    description:
      "Advanced encrypted technology ensures safe, reliable, and RBI-compliant digital banking transactions.",
  },
  {
    icon: Receipt,
    title: "Mini Statements & Receipts",
    description:
      "Provide instant account balance checks, mini statements, and transaction receipts for customers.",
  },
  {
    icon: Landmark,
    title: "Banking Accessibility",
    description:
      "Bridge banking gaps in rural and urban areas by delivering essential banking solutions to every customer.",
  },
  {
    icon: Cpu,
    title: "Smart Fintech Integration",
    description:
      "Integrated with leading banking systems for seamless deposits, withdrawals, and financial management.",
  },
];

export default function MicroAtmInfoBenefitsSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50 py-24">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 h-[320px] w-[320px] rounded-full bg-blue-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-cyan-100/20 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* ================= Info Section ================= */}
        <div className="mb-28 grid items-center gap-14 lg:grid-cols-2">
          {/* Left Content */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
              <BadgeCheck size={18} />
              Smart Banking Technology
            </span>

            <h2 className="mt-6 text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
              What is{" "}
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                Micro-ATM?
              </span>
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Micro-ATM is a revolutionary portable banking solution that
              enables secure banking services such as cash withdrawal, balance
              enquiry, mini statements, and financial transactions through
              compact digital devices connected directly to banking networks.
            </p>

            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Designed for retailers, business correspondents, and financial
              service providers, Micro-ATM empowers businesses to deliver
              banking access to customers anytime, anywhere with low-cost,
              high-efficiency technology.
            </p>

            {/* Highlight Card */}
            <div className="mt-8 rounded-3xl border-l-4 border-[#0057D9] bg-gradient-to-r from-blue-50 to-cyan-50 p-8 shadow-md">
              <p className="text-lg leading-relaxed text-gray-700">
                <strong className="text-[#0057D9]">Micro-ATM</strong> supports
                secure banking transactions using{" "}
                <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-[#0057D9]">
                  Aadhaar Authentication
                </span>
                ,{" "}
                <span className="rounded-lg bg-cyan-100 px-2 py-1 font-semibold text-cyan-700">
                  Debit Cards
                </span>
                , and{" "}
                <span className="rounded-lg bg-blue-100 px-2 py-1 font-semibold text-[#0057D9]">
                  Banking APIs
                </span>{" "}
                for seamless customer service.
              </p>
            </div>

            <button className="mt-10 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:opacity-90">
              Explore Micro-ATM Services
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-2xl">
              <img
                src="/images/micro_atm_all_bank.png"
                alt="Micro ATM Device"
                className="h-[600px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

              {/* Floating Card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <h3 className="text-2xl font-bold text-white">
                  Banking at Your Fingertips
                </h3>
                <p className="mt-2 text-blue-100">
                  Secure, portable, and scalable digital banking for modern
                  financial entrepreneurs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= Benefits Section ================= */}
        <div>
          {/* Header */}
          <div className="mb-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-[#0057D9] shadow-md">
              <Smartphone size={18} />
              Micro-ATM Advantages
            </span>

            <h2 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl lg:text-6xl">
              Benefits of{" "}
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                Micro-ATM System
              </span>
            </h2>

            <div className="mx-auto mt-5 h-1.5 w-24 rounded-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-gray-600">
              Empower retailers and customers with seamless banking
              accessibility, secure transactions, and next-generation financial
              infrastructure.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {microAtmBenefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl"
                >
                  {/* Top Border */}
                  <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"></div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-cyan-50/0 group-hover:from-blue-50 group-hover:to-cyan-50 transition-all duration-500"></div>

                  {/* Icon */}
                  <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] shadow-lg">
                    <Icon className="text-white" size={28} />
                  </div>

                  {/* Title */}
                  <h3 className="relative z-10 mb-4 text-2xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="relative z-10 text-lg leading-relaxed text-gray-600">
                    {benefit.description}
                  </p>

                  {/* Decorative Dot */}
                  <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-cyan-400 opacity-70 group-hover:scale-125 transition-transform duration-500"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}