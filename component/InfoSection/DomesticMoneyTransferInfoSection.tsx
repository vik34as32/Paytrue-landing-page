"use client";

import { Landmark, ArrowRightLeft, ShieldCheck, BadgeCheck } from "lucide-react";

export default function DomesticMoneyTransferInfoSection() {
  const highlights = [
    {
      icon: ArrowRightLeft,
      title: "Instant Bank Transfers",
      desc: "Transfer money securely between bank accounts across India in real-time.",
    },
    {
      icon: ShieldCheck,
      title: "Safe & Secure",
      desc: "Advanced encrypted transactions with trusted banking infrastructure.",
    },
    {
      icon: BadgeCheck,
      title: "Reliable Service",
      desc: "24/7 dependable domestic transfer solutions for retailers and customers.",
    },
  ];

  return (
    <section className="relative w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Background Blur */}
      <div className="absolute top-0 left-0 h-[300px] w-[300px] rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-100/30 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
        {/* Main Info Box */}
        <div className="rounded-[36px] border border-blue-100 bg-gradient-to-r from-[#0B1F5F] via-[#143D8D] to-[#1E56C9] p-10 md:p-16 shadow-2xl">
          {/* Top Badge */}
          <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-blue-100 backdrop-blur-md border border-white/20">
            <Landmark size={18} />
            Secure Domestic Money Transfer
          </div>

          {/* Heading */}
          <h2 className="mb-8 text-4xl md:text-5xl font-extrabold leading-tight text-white">
            Fast, Secure & Reliable{" "}
            <span className="text-cyan-300">Bank-to-Bank Transfers</span>
          </h2>

          {/* Main Description */}
          <div className="space-y-6 text-lg md:text-xl leading-relaxed text-blue-50">
            <p>
              Direct Money Transfer enables users to send money instantly to any
              bank account across India electronically. Whether transferring
              within the same bank or across multiple financial institutions,
              PayTrue ensures smooth and secure transactions.
            </p>

            <p>
              Powered by advanced banking systems, domestic transfers require
              minimal manual intervention, making every transaction quick,
              reliable, and highly secure for businesses, retailers, and
              customers.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-lg shadow-lg transition-all duration-300 hover:-translate-y-2 hover:bg-white/15"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Icon className="text-cyan-300" size={28} />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="text-blue-100 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}