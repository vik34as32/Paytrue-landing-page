"use client";

import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  Landmark,
  BadgeCheck,
  TrendingUp,
  Banknote,
} from "lucide-react";

export default function CMSHeroSection() {
  const cmsFeatures = [
    {
      icon: Wallet,
      title: "Cash Collection",
      desc: "Secure merchant cash pickup and collection management services.",
    },
    {
      icon: Landmark,
      title: "Bank Deposits",
      desc: "Fast and reliable business cash deposit solutions nationwide.",
    },
    {
      icon: BadgeCheck,
      title: "Secure Processing",
      desc: "Protected high-volume cash flow management for enterprises.",
    },
  ];

  const cmsServices = [
    "Cash Pickup",
    "Merchant Deposits",
    "Real-Time Reporting",
    "Business Settlements",
    "Secure Transfers",
    "Daily Collections",
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24">
      {/* Premium Background Effects */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-100/30 blur-3xl"></div>

      {/* Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05),transparent_65%)]"></div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-8 lg:grid-cols-2 lg:px-16">
        {/* Left Section */}
        <div>
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-sm font-semibold text-blue-800 shadow-md">
            <ShieldCheck size={18} />
            Secure Cash Management Solutions
          </span>

          {/* Heading */}
          <h1 className="mb-8 text-4xl font-extrabold leading-tight text-gray-900 md:text-6xl lg:text-7xl">
            Best{" "}
            <span className="bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent">
              CMS
            </span>{" "}
            Services
          </h1>

          {/* Description */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            PayTrue empowers businesses, retailers, and enterprises with
            advanced Cash Management Services including secure cash collection,
            merchant settlements, daily deposits, and real-time business
            financial management.
          </p>

          {/* CTA Buttons */}
          <div className="mb-14 flex flex-col gap-4 sm:flex-row">
            <button className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-900 px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:opacity-90">
              Start CMS Service
              <ArrowRight size={20} />
            </button>

            <button className="rounded-2xl border border-gray-200 bg-white px-8 py-4 font-semibold text-gray-800 shadow-md transition-all duration-300 hover:scale-105 hover:bg-gray-50">
              Learn More
            </button>
          </div>

          {/* Features */}
          <div className="grid gap-5 sm:grid-cols-3">
            {cmsFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-3xl border border-gray-100 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                    <Icon className="text-blue-800" size={28} />
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

        {/* Right Section */}
        <div className="relative">
          {/* Main CMS Card */}
          <div className="overflow-hidden rounded-[36px] border border-white bg-white shadow-2xl">
            <div className="relative">
              <img
                src="/images/Cash-Management-copy.webp"
                alt="Cash Management Service Illustration"
                className="h-[650px] w-full object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>

              {/* Floating CMS Info Card */}
              <div className="absolute bottom-8 left-8 right-8 rounded-3xl border border-white/20 bg-white/90 p-6 backdrop-blur-xl shadow-xl">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Enterprise Cash Flow Solutions
                </h3>

                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {cmsServices.map((service, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-blue-50 px-3 py-2 text-center text-sm font-semibold text-blue-800"
                    >
                      {service}
                    </div>
                  ))}
                </div>

                <div className="mt-4 h-2 rounded-full bg-gray-200">
                  <div className="h-2 w-full rounded-full bg-gradient-to-r from-blue-700 to-indigo-900"></div>
                </div>

                <p className="mt-4 text-gray-600">
                  Powerful secure cash handling designed for growing businesses.
                </p>
              </div>
            </div>
          </div>

          {/* Floating Stats */}
          <div className="absolute -left-10 top-10 rounded-3xl bg-white p-6 shadow-2xl">
            <h4 className="text-4xl font-extrabold text-blue-800">
              ₹50Cr+
            </h4>
            <p className="mt-2 text-gray-600">Managed Transactions</p>
          </div>

          <div className="absolute -right-8 bottom-12 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-900 p-6 text-white shadow-2xl">
            <h4 className="text-4xl font-extrabold">24/7</h4>
            <p className="mt-2 text-blue-100">Business Support</p>
          </div>

          {/* Floating Growth Indicator */}
          <div className="absolute right-16 top-20 rounded-2xl bg-white p-4 shadow-xl">
            <TrendingUp className="text-blue-800" size={32} />
          </div>

          <div className="absolute left-20 bottom-24 rounded-2xl bg-white p-4 shadow-xl">
            <Banknote className="text-indigo-800" size={32} />
          </div>
        </div>
      </div>
    </section>
  );
}