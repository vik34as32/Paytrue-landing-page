"use client";

import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Wallet,
  Landmark,
  MessageCircle,
} from "lucide-react";
import Header from "../shared/components/layout/Header";
import PremiumFintechFooter from "../shared/components/layout/Footer";

const contactCards = [
  {
    icon: Phone,
    title: "Call Support",
    value: "+91 9876543210",
  },
  {
    icon: Mail,
    title: "Email Us",
    value: "support@paytrue.com",
  },
  {
    icon: MapPin,
    title: "Head Office",
    value: "Noida, India",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    value: "Always Available",
  },
];

const services = [
  "Money Transfer Issues",
  "Mobile Recharge Support",
  "Bill Payment Queries",
  "KYC Verification",
  "Business Partnership",
  "Transaction Disputes",
];

export default function ContactPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Header />

      <main className="bg-slate-950 text-white overflow-hidden">

        {/* Background Effects */}

        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 blur-[150px]" />
          <div className="absolute right-0 top-40 w-[500px] h-[500px] bg-cyan-500/20 blur-[150px]" />
          <div className="absolute bottom-0 left-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px]" />
        </div>

        {/* Hero */}

        <section className="relative py-32">
          <div className="max-w-7xl mx-auto px-6">

            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <span className="inline-flex px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl text-cyan-400">
                Contact PayTrue
              </span>

              <h1 className="mt-8 text-6xl md:text-8xl font-black leading-tight">
                Let's Talk
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  Payments
                </span>
              </h1>

              <p className="max-w-3xl mx-auto text-slate-400 mt-8 text-xl">
                Get instant assistance for money transfers, mobile recharge,
                bill payments, KYC verification and fintech business support.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-10">
                <button className="bg-blue-600 hover:bg-blue-500 transition px-8 py-4 rounded-2xl font-semibold flex items-center gap-2">
                  Contact Team
                  <ArrowRight size={18} />
                </button>

                <button className="border border-white/10 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-2xl">
                  View Office
                </button>
              </div>

              {/* Stats */}

              <div className="grid md:grid-cols-3 gap-6 mt-20">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-4xl font-bold text-cyan-400">
                    50K+
                  </h3>
                  <p className="text-slate-400 mt-2">
                    Daily Transactions
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-4xl font-bold text-cyan-400">
                    99.99%
                  </h3>
                  <p className="text-slate-400 mt-2">
                    Platform Uptime
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                  <h3 className="text-4xl font-bold text-cyan-400">
                    24/7
                  </h3>
                  <p className="text-slate-400 mt-2">
                    Dedicated Support
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Cards */}

        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">

            {contactCards.map((item, i) => (
              <motion.div
                key={i}
                whileHover={{
                  y: -10,
                  scale: 1.03,
                }}
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8"
              >
                <item.icon
                  className="text-cyan-400 mb-5"
                  size={36}
                />

                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="text-slate-400 mt-2">
                  {item.value}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Form Section */}

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Form */}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-10">
              <h2 className="text-4xl font-bold mb-8">
                Send Message
              </h2>

              <div className="space-y-5">
                <input
                  placeholder="Full Name"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4"
                />

                <input
                  placeholder="Email Address"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4"
                />

                <input
                  placeholder="Phone Number"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4"
                />

                <textarea
                  rows={6}
                  placeholder="Your Message"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4"
                />

                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 py-4 rounded-xl font-semibold">
                  Send Message
                </button>
              </div>
            </div>

            {/* Office Info */}

            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-[32px] p-10 relative overflow-hidden">

              <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <h2 className="text-4xl font-bold">
                  Visit Our Headquarters
                </h2>

                <p className="mt-4 text-white/80">
                  Meet our support and business team.
                </p>

                <div className="mt-10 space-y-5">

                  <div className="flex gap-4">
                    <MapPin />
                    <div>
                      <h4 className="font-semibold">
                        Office Address
                      </h4>
                      <p>
                        C-30, Sector 63 <br />
                        Noida, Uttar Pradesh 201301 <br />
                        India
                      </p>

                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Mail />
                    <div>
                      <h4 className="font-semibold">
                        Email
                      </h4>
                      <p className="text-white/80">
                        care@paytrue.co.in
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Phone />
                    <div>
                      <h4 className="font-semibold">
                        Phone
                      </h4>
                      <p className="text-white/80">
                        +91-9811-207-438
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Map */}

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="rounded-[32px] overflow-hidden border border-white/10">

            <iframe
              title="map"
              src="https://maps.google.com/maps?q=28.618170,77.382252&z=16&output=embed"
              width="100%"
              height="550"
              loading="lazy"
            />
          </div>
        </section>

        {/* Services */}



        {/* CTA */}

        <section className="py-32">
          <div className="max-w-5xl mx-auto px-6">

            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[40px] p-16 text-center">

              <Wallet
                className="mx-auto mb-6"
                size={50}
              />

              <h2 className="text-6xl font-black">
                Need Help Right Now?
              </h2>

              <p className="mt-6 text-xl text-white/80">
                Connect with our payment experts instantly.
              </p>

              <div className="flex justify-center gap-4 mt-10 flex-wrap">
                <button className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold">
                  Call Support
                </button>

                <button className="bg-black/20 px-8 py-4 rounded-xl font-bold flex items-center gap-2">
                  <MessageCircle size={18} />
                  WhatsApp
                </button>
              </div>

            </div>
          </div>
        </section>
      </main>
      <PremiumFintechFooter />
    </div>
  );
}