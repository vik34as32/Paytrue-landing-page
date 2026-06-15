"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  Send,
  Smartphone,
  Landmark,
  ShieldCheck,
  Wallet,
  CheckCircle,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0A84FF] via-[#0066FF] to-[#0047B3] text-white">
      {/* Background Blur */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          <div>
            <span className="px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              India's Trusted Fintech Platform
            </span>

            <h1 className="mt-8 text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
              Digital Payments
              <span className="block text-cyan-300">
                Made Simple
              </span>
            </h1>

            <p className="mt-6 text-xl text-blue-100 max-w-xl leading-relaxed">
              Money Transfer, AEPS, BBPS, Mobile Recharge,
              Utility Bill Payments and Banking Services —
              all from one secure platform.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <button className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition">
                Get Started
                <ArrowRight size={18} />
              </button>

              <button className="border border-white/30 px-8 py-4 rounded-2xl backdrop-blur-md hover:bg-white/10 transition">
                Learn More
              </button>
            </div>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-6 mt-14">
              <div>
                <h3 className="text-4xl font-black">
                  5M+
                </h3>
                <p className="text-blue-100">
                  Transactions
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-black">
                  50K+
                </h3>
                <p className="text-blue-100">
                  Retailers
                </p>
              </div>

              <div>
                <h3 className="text-4xl font-black">
                  99.9%
                </h3>
                <p className="text-blue-100">
                  Success Rate
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="relative h-auto lg:h-[650px] mt-12 lg:mt-0">

            {/* Balance Card */}

            <motion.div
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-0 right-0 bg-white rounded-3xl p-8 shadow-2xl w-80 text-gray-900"
            >
              <div className="flex justify-between">
                <CreditCard
                  className="text-blue-600"
                  size={34}
                />

                <span className="text-gray-500">
                  Wallet Balance
                </span>
              </div>

              <h2 className="text-5xl font-black mt-5">
                ₹8,25,000
              </h2>

              <p className="text-green-600 mt-2 font-semibold">
                +12.4% This Month
              </p>
            </motion.div>

            {/* Money Transfer */}

            <motion.div
              animate={{
                x: [0, 10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="absolute top-40 left-0 bg-white rounded-3xl p-6 shadow-2xl w-80 text-gray-900"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">
                    Money Transfer
                  </p>

                  <h3 className="font-bold text-xl">
                    ₹25,000 Sent
                  </h3>
                </div>

                <CheckCircle
                  className="text-green-500"
                  size={34}
                />
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm">
                  <span>HDFC Bank</span>
                  <span>ICICI Bank</span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-green-500 w-full animate-pulse"></div>
                </div>

                <p className="text-green-600 mt-3 font-medium">
                  Transaction Successful
                </p>
              </div>
            </motion.div>

            {/* Mobile Recharge */}

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
              className="absolute bottom-10 right-0 bg-white rounded-3xl p-6 shadow-2xl w-72 text-gray-900"
            >
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">
                    Mobile Recharge
                  </p>

                  <h3 className="font-bold">
                    Airtel Prepaid
                  </h3>
                </div>

                <Smartphone
                  className="text-blue-600"
                  size={28}
                />
              </div>

              <div className="mt-6">
                <p className="text-4xl font-black">
                  ₹399
                </p>

                <p className="text-green-600 font-medium">
                  Recharge Successful
                </p>
              </div>
            </motion.div>

            {/* AEPS */}

            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="absolute bottom-48 left-20 bg-white rounded-3xl p-5 shadow-2xl text-gray-900"
            >
              <div className="flex items-center gap-3">
                <Landmark
                  className="text-blue-600"
                  size={24}
                />

                <div>
                  <p className="text-xs text-gray-500">
                    AEPS Withdrawal
                  </p>

                  <p className="font-bold">
                    ₹10,000 Credited
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Security Badge */}

            <motion.div
              animate={{
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-80 right-28 bg-white rounded-2xl p-4 shadow-xl"
            >
              <ShieldCheck
                className="text-green-500"
                size={28}
              />
            </motion.div>

            {/* Wallet Badge */}

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute top-96 left-72 bg-white rounded-2xl p-4 shadow-xl"
            >
              <Wallet
                className="text-blue-600"
                size={28}
              />
            </motion.div>

            {/* Live Transaction */}

            <motion.div
              animate={{
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
              className="absolute top-20 left-20 bg-black/20 backdrop-blur-lg border border-white/20 px-5 py-3 rounded-2xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>

                <span className="text-sm">
                  Live Transaction Processing
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}