"use client";

import {
  ArrowRight,
  CreditCard,
  Send,
  Wallet,
  ShieldCheck,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/20 blur-3xl rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/20 blur-3xl rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
              Fast • Secure • Trusted
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight">
              Find easy and <br />
              fast ways to <br />
              send money
            </h1>

            <p className="text-blue-100 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Card to card money transfers made simple and affordable.
              Search among hundreds of services and save money on fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-white text-[#0057D9] hover:bg-blue-50 px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-2xl transition-all duration-300">
                Get Started
                <ArrowRight size={20} />
              </button>

              <button className="border border-white/30 hover:bg-white/10 px-8 py-4 rounded-2xl font-semibold backdrop-blur-md transition-all duration-300">
                Learn More
              </button>
            </div>

            {/* Trusted Logos */}
            <div className="pt-8">
              <p className="text-sm text-blue-100 mb-4">
                Trusted by global payment partners
              </p>
              <div className="flex flex-wrap gap-8 justify-center lg:justify-start items-center text-white/90 font-semibold">
                <span className="text-xl">VISA</span>
                <span className="text-xl">PayPal</span>
                <span className="text-xl">Mastercard</span>
              </div>
            </div>
          </div>

          {/* Right Cards */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg h-[500px]">
              {/* Main Balance Card */}
              <div className="absolute top-0 right-0 bg-white text-gray-900 rounded-3xl p-8 shadow-2xl w-80 backdrop-blur-xl">
                <div className="flex justify-between items-center mb-6">
                  <CreditCard className="text-[#0A84FF]" size={32} />
                  <span className="text-sm font-medium text-gray-500">
                    Balance
                  </span>
                </div>

                <h2 className="text-4xl font-bold mb-6">$8,250</h2>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>••••</span>
                  <span>••••</span>
                  <span>••••</span>
                  <span>5218</span>
                </div>
              </div>

              {/* Send Money Card */}
              <div className="absolute top-44 left-0 bg-white rounded-3xl p-6 shadow-2xl w-72 text-gray-900">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="User"
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold">Eleanor Pena</h4>
                    <p className="text-sm text-gray-500">Designer</p>
                  </div>
                </div>

                <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold mb-4">
                  Send money
                </button>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Send className="text-[#0A84FF]" size={18} />
                    <span className="text-sm">You send</span>
                  </div>
                  <span className="font-bold">$1,400</span>
                </div>
              </div>

              {/* Receipt Card */}
              <div className="absolute bottom-0 right-4 bg-white rounded-3xl p-6 shadow-2xl w-64 text-gray-900">
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="User"
                    className="w-14 h-14 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold">Jacob Jones</h4>
                    <p className="text-sm text-gray-500">Developer</p>
                  </div>
                </div>

                <button className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-semibold">
                  View receipt
                </button>
              </div>

              {/* Floating Icons */}
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-lg">
                  <Wallet className="text-[#0A84FF]" />
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-lg">
                  <ShieldCheck className="text-pink-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}