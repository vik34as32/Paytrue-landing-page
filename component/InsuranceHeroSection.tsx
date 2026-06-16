
"use client";

import Image from "next/image";
import {
  Shield,
  HeartPulse,
  Car,
  Plane,
  ArrowRight,
} from "lucide-react";

export default function InsuranceHeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 lg:py-28">

      {/* Background Blur */}
      <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-10">

        <div className="flex flex-col-reverse items-center gap-16 lg:flex-row">

          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">

            <div className="mb-5 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Smart Insurance Solutions
            </div>

            <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              Protect What
              <span className="text-blue-600"> Matters Most</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Secure your future with Health, Life, Motor, and Travel
              Insurance plans. Get affordable premiums, instant policy
              issuance, and reliable claim support through PayTrue.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">

              <button className="group flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700">
                Get Insured
                <ArrowRight size={18} />
              </button>

              <button className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                View Plans
              </button>

            </div>

            {/* Insurance Types */}
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <HeartPulse className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-slate-900">
                  Health
                </h4>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Shield className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-slate-900">
                  Life
                </h4>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Car className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-slate-900">
                  Motor
                </h4>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-md">
                <Plane className="mb-3 text-blue-600" size={28} />
                <h4 className="font-semibold text-slate-900">
                  Travel
                </h4>
              </div>

            </div>

          </div>

          {/* Right Image */}
          <div className="flex flex-1 justify-center lg:justify-end">

            <div className="relative w-full">

              <Image
                src="/images/insurance-hero.png"
                alt="Insurance Services"
                width={1200}
                height={900}
                priority
                className="h-auto w-full max-w-full object-contain"
              />

              {/* Floating Card 1 */}
              <div className="absolute left-0 top-8 rounded-2xl bg-white p-4 shadow-xl">
                <h4 className="text-3xl font-bold text-blue-600">
                  100%
                </h4>
                <p className="text-sm text-gray-600">
                  Secure Coverage
                </p>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute right-0 bottom-12 rounded-2xl bg-blue-600 p-4 text-white shadow-xl">
                <h4 className="text-xl font-bold">
                  Quick Claims
                </h4>
                <p className="text-xs">
                  Fast Processing Support
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
