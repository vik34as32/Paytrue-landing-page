"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
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
  name: "TRAVEL",
  path: "/services/travel",
},
{
  name: "INSURANCE",
  path: "/services/insurance",
},
  {
    name: "Cash Management Service",
    path: "/services/cash-management-service",
  },
];

export default function Header() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/paytrue-logo.png"
            alt="PayTrue Logo"
            width={42}
            height={42}
            priority
            className="object-contain"
          />

          <div className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-wide sm:text-3xl">
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

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            className="font-semibold text-slate-800 transition hover:text-blue-900"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="font-semibold text-slate-800 transition hover:text-blue-900"
          >
            About
          </Link>

          <div className="group relative">
            <button className="flex items-center gap-1 font-semibold text-slate-800 hover:text-blue-900">
              Products & Services
              <ChevronDown
                size={18}
                className="transition group-hover:rotate-180"
              />
            </button>

            <div className="invisible absolute left-0 top-full mt-4 w-80 rounded-2xl border border-slate-200 bg-white p-3 opacity-0 shadow-2xl transition-all duration-300 group-hover:visible group-hover:opacity-100">
              <div className="max-h-[450px] overflow-y-auto">
                {services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.path}
                    className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            className="font-semibold text-slate-800 transition hover:text-blue-900"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop Login */}
        <div className="hidden lg:flex">
          <button
            onClick={() => router.push("/auth/login")}
            className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white transition hover:bg-blue-900"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X size={28} />
          ) : (
            <Menu size={28} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-4">

            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              About
            </Link>

            {/* Mobile Services */}
            <button
              onClick={() =>
                setMobileServicesOpen(!mobileServicesOpen)
              }
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              Products & Services

              <ChevronRight
                size={18}
                className={`transition-transform ${
                  mobileServicesOpen ? "rotate-90" : ""
                }`}
              />
            </button>

            {mobileServicesOpen && (
              <div className="ml-3 border-l border-slate-200 pl-3">
                {services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.path}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMobileServicesOpen(false);
                    }}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-900"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
            >
              Contact
            </Link>

            <div className="pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/auth/login");
                }}
                className="w-full rounded-xl bg-slate-900 px-6 py-3 font-bold text-white hover:bg-blue-900"
              >
                Login
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}