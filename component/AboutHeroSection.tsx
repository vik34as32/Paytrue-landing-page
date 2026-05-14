"use client";

import { ArrowRight, BadgeCheck } from "lucide-react";

export default function AboutHeroSection() {
  return (
    <section
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=2000&auto=format&fit=crop")',
      }}
    >
      {/* Dark Premium Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-[#0057D9]/75 to-slate-950/90" />

      {/* Glow Effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Section */}
          <div className="text-white">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 mb-8">
              <span className="px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-semibold tracking-[0.25em] uppercase">
                About Us
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight mb-8">
              About{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                PayTrue
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-2xl text-slate-200 leading-relaxed max-w-3xl mb-10">
              PayTrue is India’s trusted fintech platform empowering retailers,
              entrepreneurs, and businesses with secure Money Transfer, AEPS,
              Recharge, BBPS, Mini ATM, and digital financial solutions.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                "Trusted Nationwide Financial Network",
                "Secure Digital Transactions",
                "Retailer Growth Opportunities",
                "24/7 Customer Support",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-3"
                >
                  <BadgeCheck className="text-cyan-400" size={20} />
                  <span className="text-slate-200 font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 hover:scale-105">
                Explore Services
                <ArrowRight size={20} />
              </button>

              <button className="border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105">
                Contact Us
              </button>
            </div>
          </div>

          {/* Right Section Stats Cards */}
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: "50K+", label: "Active Partners" },
              { value: "99.9%", label: "Secure Transactions" },
              { value: "24/7", label: "Support Available" },
              { value: "All India", label: "Service Reach" },
            ].map((stat, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-8 text-center shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-3">
                  {stat.value}
                </h3>
                <p className="text-slate-200 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
}