"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Smartphone,
  Landmark,
  CreditCard,
  BadgeCheck,
} from "lucide-react";

/* ---------------- Animated Counter ---------------- */
function AnimatedCounter({
  target,
  suffix = "",
  duration = 2500,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 30);

    const timer = setInterval(() => {
      start += increment;

      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 30);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------- Services Data ---------------- */
const services = [
  {
    title: "Money Transfer Services",
    description:
      "Instant domestic money transfer to any bank account with secure processing, low fees, and fast settlements.",
    icon: Landmark,
    image:  "/images/money_transfer.png",
    primaryBtn: "Send Money",
    secondaryBtn: "Know More",
  },
  {
    title: "AEPS Cash Withdrawal",
    description:
      "Secure Aadhaar enabled banking for withdrawals, mini statements, and balance enquiry services.",
    icon: BadgeCheck,
    image:"/images/AEPSCashWithdrawal.png",
    primaryBtn: "Withdraw Now",
    secondaryBtn: "Learn More",
  },
  {
    title: "Recharge & Bill Payments",
    description:
      "Mobile recharge, DTH, electricity, broadband, and utility bill payments in one seamless platform.",
    icon: Smartphone,
    image:"/images/recharge_bil_payments.png",
    primaryBtn: "Recharge Now",
    secondaryBtn: "View Plans",
  },
  {
    title: "Mini ATM Services",
    description:
      "Cash withdrawal, account balance check, and mini ATM solutions for retailers and customers.",
    icon: CreditCard,
    image:"/images/min_atm.png",
    primaryBtn: "Start Service",
    secondaryBtn: "Explore",
  },
];

/* ---------------- Main Component ---------------- */
export default function ServicesSection() {
  const stats = [
    { value: 10, suffix: "K+", label: "Active Retailers" },
    { value: 50, suffix: "K+", label: "Daily Transactions" },
    { value: 99.9, suffix: "%", label: "Secure Payments" },
    { value: 24, suffix: "/7", label: "Customer Support" },
  ];

  return (
    <section className="w-full bg-white py-20 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-16">
          <span className="inline-block px-5 py-2 rounded-full bg-blue-100 text-[#0057D9] text-sm font-semibold mb-4">
            Our Financial Services
          </span>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Powerful Digital Payment <br className="hidden md:block" />
            Solutions For Your Business
          </h2>

          <p className="text-gray-600 mt-5 max-w-3xl mx-auto text-lg">
            We provide trusted money transfer, AEPS, recharge, and mini ATM
            services with premium customer experience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className="group bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="h-full flex flex-col">
                  {/* Image Section */}
                  <div className="relative h-72 overflow-hidden rounded-t-[32px]">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                    {/* Icon */}
                    <div className="absolute top-5 left-5 bg-white/20 backdrop-blur-lg p-4 rounded-2xl border border-white/30 shadow-lg">
                      <Icon className="text-white" size={30} />
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white text-3xl font-bold leading-tight">
                        {service.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 flex flex-col justify-between flex-1 bg-white rounded-b-[32px]">
                    <div>
                      <p className="text-gray-600 text-lg leading-relaxed mb-6">
                        {service.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-3 mb-8">
                        {["Secure", "Fast", "Trusted"].map((tag, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 rounded-full bg-blue-50 text-[#0057D9] text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="flex-1 bg-gradient-to-r from-[#0A84FF] to-[#0057D9] hover:opacity-90 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:scale-105">
                        {service.primaryBtn}
                        <ArrowRight size={18} />
                      </button>

                      <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:scale-105">
                        {service.secondaryBtn}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] p-8 text-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

              {/* Counter */}
              <h4 className="relative z-10 text-4xl md:text-5xl font-extrabold text-white">
                {stat.value === 99.9 ? (
                  <>
                    <AnimatedCounter target={99} />
                    .9{stat.suffix}
                  </>
                ) : (
                  <AnimatedCounter
                    target={Math.floor(stat.value)}
                    suffix={stat.suffix}
                  />
                )}
              </h4>

              {/* Label */}
              <p className="relative z-10 text-blue-100 mt-3 text-base md:text-lg">
                {stat.label}
              </p>

              {/* Decorative Dot */}
              <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-cyan-300 opacity-70 group-hover:scale-125 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}