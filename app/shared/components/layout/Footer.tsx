"use client";
import { Mail, Phone, MapPin, ArrowRight, Send } from 'lucide-react';


import { FaFacebookF } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";

export default function PremiumFintechFooter() {
    const quickLinks = [
        'Home',
        'About Us',
        'Products & Services',
        'Contact',
        'Login',
        'Sign Up',
    ];

    const legalLinks = [
        'Privacy Policy',
        'Customer Grievance',
        'Cancellation / Refund Policy',
        'Customer Support',
        'Terms & Conditions',
    ];

    const socialLinks = [
        { icon: FaFacebookF, name: 'Facebook' },
        { icon: FaInstagram, name: 'Instagram' },
        { icon: FaLinkedinIn, name: 'LinkedIn' },
        { icon: FaXTwitter, name: 'Twitter' },
    ];

    return (
        <footer className="relative bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 text-white overflow-hidden">
            {/* Background Glow Effects */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-cyan-500 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-700 blur-3xl"></div>
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
                {/* Top Grid */}
                <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div>
                        <div className="mb-8 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md shadow-lg">
                            <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl ring-2 ring-cyan-400/30 overflow-hidden">
                                <img
                                    src="/images/paytruelogo.png"
                                    alt="Paytrue Logo"
                                    className="h-14 w-14 object-contain"
                                />
                            </div>


                            <span className="text-3xl font-extrabold tracking-tight" style={{ color: "#003A99" }} >
                                Pay<span className="text-cyan-400" style={{ color: "#0057D9" }}>true</span>
                            </span>
                        </div>

                        <h3 className="mb-4 text-2xl font-bold leading-snug">
                            GoodLinks Services Pvt. Ltd.
                        </h3>

                        <div className="space-y-3 text-slate-300 leading-relaxed">
                            {/* <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-cyan-400" />
                <p>
                  Registered Office:<br />
                  94/1 New No 552/425, Chander Nagar, Alambagh,<br />
                  Lucknow, UP 226005
                </p>
              </div> */}

                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-cyan-400" />
                                <a href="#" className="hover:text-cyan-400 transition">
                                    support@paytrue.in
                                </a>
                            </div>

                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-cyan-400" />
                                <span>+91-9811-207-438</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="mb-8 text-2xl font-bold">Our Services</h4>
                        <div className="mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"></div>
                        <ul className="space-y-4">
                            {quickLinks.map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="group flex items-center gap-3 text-slate-300 transition-all duration-300 hover:text-cyan-400"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social Section */}
                    <div>
                        <h4 className="mb-8 text-2xl font-bold">Connect With Us</h4>
                        <div className="mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"></div>

                        <div className="space-y-4 mb-10">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href="#"
                                        className="group flex items-center gap-4 text-slate-300 transition-all duration-300 hover:text-cyan-400"
                                    >
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md group-hover:border-cyan-400/40">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        {social.name}
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="mb-8 text-2xl font-bold">Guidelines</h4>
                        <div className="mb-8 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"></div>
                        <ul className="space-y-4">
                            {legalLinks.map((link) => (
                                <li key={link}>
                                    <a
                                        href="#"
                                        className="group flex items-start gap-3 text-slate-300 transition-all duration-300 hover:text-cyan-400"
                                    >
                                        <ArrowRight className="mt-1 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 border-t border-white/10 pt-8">
                    <div className="flex justify-center items-center text-sm text-slate-400">
                        <p className="text-center">
                            © {new Date().getFullYear()} GoolinkServices. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
