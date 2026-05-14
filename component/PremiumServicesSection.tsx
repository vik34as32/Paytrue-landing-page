"use client";

import { motion } from "framer-motion";
import {
    Landmark,
    Send,
    Smartphone,
    Wallet,
    BadgeCheck,
    CreditCard,
    ShieldCheck,
    FileBadge,
} from "lucide-react";

const services = [
    {
        title: "AEPS (ICICI)",
        description:
            "Secure Aadhaar Enabled Payment System for cash withdrawal, balance enquiry, and seamless biometric banking.",
        icon: Landmark,
        color: "from-cyan-500 to-blue-600",
    },
    {
        title: "Money Transfer",
        description:
            "Fast and secure domestic money transfer solutions with instant settlements to all major banks.",
        icon: Send,
        color: "from-green-400 to-emerald-600",
    },
    {
        title: "BBPS",
        description:
            "Utility bill payments including electricity, gas, DTH, water, and broadband with instant processing.",
        icon: CreditCard,
        color: "from-orange-400 to-pink-500",
    },
    {
        title: "Mobile/DTH Recharge",
        description:
            "Recharge mobile, DTH, and data cards instantly with multiple operator support and cashback.",
        icon: Smartphone,
        color: "from-green-400 to-cyan-500",
    },
    {
        title: "CMS",
        description:
            "Cash management solutions for merchants and businesses with secure deposit services.",
        icon: Wallet,
        color: "from-cyan-500 to-blue-600",
        featured: true,
    },
    {
        title: "Bank Account Verify",
        description:
            "Instant account validation and verification APIs for secure financial transactions.",
        icon: ShieldCheck,
        color: "from-yellow-400 to-orange-500",
    },
    {
        title: "Micro-ATM",
        description:
            "Mini ATM services for secure withdrawals and financial inclusion in remote areas.",
        icon: BadgeCheck,
        color: "from-sky-400 to-cyan-500",
    },
    {
        title: "PSA",
        description:
            "PAN card registration, updates, and digital processing services for businesses.",
        icon: FileBadge,
        color: "from-green-400 to-emerald-500",
    },
];

export default function PremiumServicesSection() {
    return (
        <section className="relative w-full bg-white py-24 px-4 sm:px-8 lg:px-20 overflow-hidden">
            {/* Background Blur */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-40"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="inline-block px-6 py-2 rounded-full bg-blue-50 text-[#0057D9] font-semibold text-sm mb-5">
                        Our Services
                    </span>

                    <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                        Comprehensive Financial Solutions
                    </h2>

                    <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                        PayTrue delivers advanced fintech solutions that accelerate
                        business growth, strengthen customer trust, and ensure secure
                        digital transactions nationwide.
                    </p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 60 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                }}
                                viewport={{ once: true }}
                                whileHover={{
                                    y: -12,
                                    scale: 1.03,
                                }}
                                className={`group relative rounded-3xl border ${service.featured
                                        ? "border-cyan-300 bg-gradient-to-br from-cyan-50 to-blue-50"
                                        : "border-gray-200 bg-white"
                                    } p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden`}
                            >
                                {/* Glow Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/10 transition-all duration-500"></div>

                                {/* Icon */}
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg mb-6`}
                                >
                                    <Icon className="text-white" size={30} />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {service.title}
                                </h3>

                                <p className="text-gray-600 leading-relaxed mb-6">
                                    {service.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-[#0057D9] font-semibold group-hover:translate-x-1 transition-transform duration-300">
                                        Learn More →
                                    </span>

                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#0057D9] transition-all duration-300">
                                        <Send
                                            className="text-[#0057D9] group-hover:text-white"
                                            size={18}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom Stats */}
                {/* <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-24"
        >
          {[
            { value: "50K+", label: "Active Users" },
            { value: "99.9%", label: "Secure Payments" },
            { value: "24/7", label: "Support" },
            { value: "All India", label: "Service Reach" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#0A84FF] to-[#0057D9] rounded-3xl p-8 text-center shadow-xl hover:scale-105 transition-transform duration-300"
            >
              <h4 className="text-4xl font-bold text-white">{stat.value}</h4>
              <p className="text-blue-100 mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div> */}
            </div>
        </section>
    );
}