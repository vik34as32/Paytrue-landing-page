"use client";

import { ArrowRight, BadgeCheck, PlayCircle, ShieldCheck } from "lucide-react";

export default function AboutPaytrueSection() {
    return (
        <section className="relative w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 px-4 sm:px-8 lg:px-16 overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-100 text-[#0057D9] font-semibold text-sm">
                        <BadgeCheck size={18} />
                        Trusted Digital Financial Platform
                    </span>

                    <h2 className="mt-6 text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Welcome to <span className="text-[#0057D9]">PayTrue</span>
                    </h2>

                    <p className="mt-6 max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
                        Paytrue empowers retailers, entrepreneurs, and businesses with
                        secure financial solutions including Money Transfer, AEPS, Recharge,
                        Mini ATM, PAN Services, Insurance, and Online Shopping — all under
                        one trusted platform.
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-14 items-center">
                    {/* Left Content */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-10 hover:shadow-blue-100 transition-all duration-500">
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">
                                Build Your Business With PayTrue
                            </h3>

                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                Become part of PayTrue’s rapidly growing network of successful partners across India who are transforming businesses through our powerful digital payment ecosystem. Empower your business with secure, scalable, and trusted financial solutions designed to boost revenue, expand customer reach, and create long-term growth opportunities in the evolving digital economy.
                            </p>

                            {/* Feature List */}
                            <div className="space-y-4">
                                {[
                                    "High commission & attractive retailer earnings",
                                    "Secure AEPS, money transfer & recharge services",
                                    "24/7 customer support & business assistance",
                                    "Trusted by growing digital entrepreneurs",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <ShieldCheck
                                                className="text-[#0057D9]"
                                                size={18}
                                            />
                                        </div>
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="mt-10 bg-gradient-to-r from-[#0A84FF] to-[#0057D9] hover:opacity-90 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-lg transition-all duration-300">
                                Explore Paytrue Services
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Right Video/Image Card */}
                    <div className="relative">
                        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 group hover:shadow-blue-100 transition-all duration-500">
                            <div className="relative h-[420px]">
                                <img
                                    src="/images/why_choose.jpeg"
                                    alt="MoolPay Business Growth"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                {/* Play Button */}
                                {/* <div className="absolute inset-0 flex items-center justify-center">
                                    <button className="bg-white/20 backdrop-blur-md hover:bg-white/30 p-6 rounded-full border border-white/30 transition-all duration-300">
                                        <PlayCircle
                                            className="text-white"
                                            size={70}
                                            fill="white"
                                        />
                                    </button>
                                </div> */}

                                {/* Overlay Content */}
                                <div className="absolute bottom-8 left-8 right-8">
                                    <h3 className="text-white text-3xl font-bold mb-3">
                                        Why Choose Paytrue?
                                    </h3>

                                    <p className="text-blue-100 text-lg leading-relaxed">
                                        Powerful digital payment solutions designed for India's next
                                        generation of financial service providers.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Stats Card */}

                    </div>
                </div>

                {/* Bottom Company Section */}
                <div className="mt-28 grid md:grid-cols-2 gap-12 items-center">
                    {/* Image */}
                    <div className="relative">
                        <img
                            src="/images/We_are.jpeg"
                            alt="Team Collaboration"
                            className="rounded-3xl shadow-2xl w-full h-[420px] object-cover"
                        />

                        <div className="absolute inset-0 bg-gradient-to-r from-[#0057D9]/70 to-transparent rounded-3xl"></div>

                        <div className="absolute bottom-8 left-8 text-white max-w-md">
                            <h3 className="text-3xl font-bold mb-3">
                                Supporting India's Digital Future
                            </h3>
                            <p className="text-blue-100">
                                Empowering businesses through innovation, trust, and seamless
                                digital payment solutions.
                            </p>
                        </div>
                    </div>

                    {/* Text */}
                    <div>
                        <h3 className="text-4xl font-bold text-gray-900 mb-6">
                            We Are <span className="text-[#0057D9]">Paytrue</span>
                        </h3>

                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            PayTrue is driving the future of India’s digital economy by delivering premium fintech solutions that empower retailers, distributors, and entrepreneurs to grow faster and serve smarter. Our mission is to unlock scalable business opportunities through secure, seamless, and innovation-led financial services—built to accelerate success, strengthen trust, and transform commerce nationwide.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { value: "10K+", label: "Retailers" },
                                { value: "99.9%", label: "Secure Payments" },
                                { value: "24/7", label: "Support" },
                                { value: "All India", label: "Service Reach" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center"
                                >
                                    <h4 className="text-3xl font-bold text-[#0057D9]">
                                        {item.value}
                                    </h4>
                                    <p className="text-gray-600 mt-2">{item.label}</p>
                                </div>
                            ))}
                        </div>

                        <button className="mt-10 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all duration-300">
                            Learn More About Us
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}