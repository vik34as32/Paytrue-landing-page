"use client";

import { useState } from "react";
import Link from "next/link";
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
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            <h1 className="cursor-pointer text-3xl font-extrabold leading-none tracking-wide">
              <span className="text-[#001F5B]">Pay</span>
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                true
              </span>
            </h1>
          </Link>
        </div>

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

          {/* Products Dropdown */}
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

          <button className="rounded-xl bg-slate-100 px-6 py-2 font-bold text-slate-900 transition-all duration-300 hover:bg-slate-200">
            Sign Up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="flex items-center justify-center rounded-lg p-2 text-slate-800 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${
          mobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden border-t border-slate-200 bg-white transition-all duration-500`}
      >
        <div className="space-y-2 px-4 py-5 sm:px-6">
          <Link
            href="/"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/about"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>

          {/* Mobile Products Dropdown */}
          <div>
            <button
              onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Products & Services
              <ChevronDown
                size={20}
                className={`transition-transform duration-300 ${
                  mobileServicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {mobileServicesOpen && (
              <div className="mt-2 space-y-1 rounded-2xl bg-slate-50 p-3">
                {services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.path}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileServicesOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                  >
                    {service.name}
                    <ChevronRight size={16} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/contact"
            className="block rounded-xl px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>

          {/* Mobile Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              className="w-full rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-all duration-300 hover:bg-blue-900"
              onClick={() => {
                setMobileMenuOpen(false);
                router.replace("/auth/login");
              }}
            >
              Login
            </button>

            <button className="w-full rounded-xl bg-slate-100 px-6 py-3 font-bold text-slate-900 transition-all duration-300 hover:bg-slate-200">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;