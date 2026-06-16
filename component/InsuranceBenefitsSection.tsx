
"use client";

import {
  HeartPulse,
  Shield,
  Car,
  Plane,
  FileCheck,
  Wallet,
  Clock,
  Headphones,
} from "lucide-react";

const benefits = [
  {
    icon: HeartPulse,
    title: "Health Insurance",
    desc: "Protect yourself and your family with comprehensive health insurance plans and cashless hospitalization benefits.",
  },
  {
    icon: Shield,
    title: "Life Insurance",
    desc: "Secure your loved ones with life insurance coverage and long-term financial protection.",
  },
  {
    icon: Car,
    title: "Motor Insurance",
    desc: "Get complete protection for your car or bike against accidents, theft, and damages.",
  },
  {
    icon: Plane,
    title: "Travel Insurance",
    desc: "Stay protected during domestic and international trips with travel insurance coverage.",
  },
  {
    icon: FileCheck,
    title: "Instant Policy Issuance",
    desc: "Purchase and receive your insurance policy online with quick approval and documentation.",
  },
  {
    icon: Wallet,
    title: "Affordable Premiums",
    desc: "Choose from flexible plans and premium options that fit your budget and requirements.",
  },
  {
    icon: Clock,
    title: "Quick Claim Support",
    desc: "Fast claim assistance and hassle-free settlement process through trusted insurance partners.",
  },
  {
    icon: Headphones,
    title: "24/7 Assistance",
    desc: "Dedicated customer support to help you with policy selection, renewal, and claims.",
  },
];

export default function InsuranceBenefitsSection() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mb-14 text-center">
          <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600">
            Insurance Solutions
          </span>

          <h2 className="mt-5 text-3xl font-bold text-slate-900 md:text-5xl">
            Insurance Plans &
            <span className="text-blue-600"> Benefits</span>
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
            Secure your future with health, life, motor, and travel
            insurance plans. Get reliable coverage, affordable premiums,
            and quick claim assistance through PayTrue.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-blue-100 hover:shadow-2xl"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Icon size={26} />
                </div>

                <h3 className="mb-3 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-sm leading-7 text-gray-600">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
