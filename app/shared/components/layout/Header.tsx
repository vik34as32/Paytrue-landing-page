"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

const services = [
  {
    name: "Domestic Money Transfer",
    path: "/services/domestic-money-transfer",
  },
  {
    name: "Aadhaar Enabled Payment System",
    path: "/services/aeps",
  },
  {
    name: "Prepaid Recharges",
    path: "/services/prepaid-recharges",
  },
  {
    name: "Bill Payments (BBPS)",
    path: "/services/bbps",
  },
  {
    name: "Fastag",
    path: "/services/fastag",
  },
  {
    name: "Micro ATM",
    path: "/services/micro-atm",
  },
  {
    name: "PAN Card Center",
    path: "/services/pan-card",
  },
  {
    name: "Aadhaar Pay",
    path: "/services/aadhaar-pay",
  },
  {
    name: "Cash Management Service",
    path: "/services/cash-management-service",
  },
];

const Header = () => {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        
        {/* Professional Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/paytrue-logo.png"
            alt="PayTrue Logo"
            width={40}
            height={40}
            priority
            className="object-contain"
          />

          <div className="flex flex-col leading-none">
            <span className="text-3xl font-extrabold tracking-wide">
              <span className="text-[#001F5B]">Pay</span>
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                true
              </span>
            </span>

            <span className="mt-1 text-[10px] uppercase tracking-[2px] text-slate-500">
              Digital Payment Solutions
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            className="font-semibold text-slate-800 transition-colors duration-300 hover:text-blue-900"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="font-semibold text-slate-800 transition-colors duration-300 hover:text-blue-900"
          >
            About
          </Link>

          <div className="group relative">
            <button className="flex items-center gap-1 font-semibold text-slate-800 transition-colors duration-300 hover:text-blue-900">
              Products & Services
              <ChevronDown
                size={18}
                className="mt-[2px] transition-transform duration-300 group-hover:rotate-180"
              />
            </button>

            <div className="invisible absolute left-0 top-full mt-4 w-80 rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:opacity-100">
              <div className="flex max-h-[500px] flex-col overflow-y-auto">
                {services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.path}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-900"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            className="font-semibold text-slate-800 transition-colors duration-300 hover:text-blue-900"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden items-center gap-4 lg:flex">
          <button
            className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white transition-all duration-300 hover:bg-blue-900"
            onClick={() => router.replace("/auth/login")}
          >
            Login
          </button>

          {/* <button className="rounded-xl bg-slate-100 px-6 py-2 font-bold text-slate-900 transition-all duration-300 hover:bg-slate-200">
            Sign Up
          </button> */}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-slate-800 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </header>
  );
};

export default Header;