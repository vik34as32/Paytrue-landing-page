"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const services = [
  { name: "Domestic Money Transfer", path: "/services/domestic-money-transfer" },
  { name: "Aadhaar Enabled Payment System", path: "/services/aeps" },
  { name: "Prepaid Recharges", path: "/services/prepaid-recharges" },
  { name: "Bill Payments (BBPS)", path: "/services/bbps" },
  { name: "Fastag", path: "/services/fastag" },
  { name: "Micro ATM", path: "/services/micro-atm" },
  { name: "PAN Card Center", path: "/services/pan-card" },
  { name: "Aadhaar Pay", path: "/services/aadhaar-pay" },
  { name: "Travel", path: "/services/travel" },
  { name: "Insurance", path: "/services/insurance" },
  { name: "Cash Management Service", path: "/services/cash-management-service" },
];

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[9999] w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[1fr_auto] items-center px-4 py-3 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-10 lg:py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/paytrue-logo.png"
            alt="Paytrue"
            width={44}
            height={44}
            priority
            className="h-11 w-11 rounded-full object-contain shadow-sm ring-1 ring-slate-200"
          />
          <div className="leading-none">
            <p className="text-[22px] font-extrabold tracking-tight text-[#0b1f3a] sm:text-2xl">
              Paytrue
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Digital Payment Solutions
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/about" label="About" />
          <div className="group relative">
            <button className="flex items-center gap-1 text-[15px] font-medium text-[#1e2a4a] transition hover:text-[#2563eb]">
              Products & Services
              <ChevronDown size={16} className="transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full z-50 mt-4 w-80 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_24px_50px_-20px_rgba(15,23,42,0.35)] transition group-hover:visible group-hover:opacity-100">
              <div className="max-h-[420px] overflow-y-auto">
                {services.map((service) => (
                  <Link
                    key={service.path}
                    href={service.path}
                    className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-[#0b1f3a]"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <NavLink href="/contact" label="Contact" />
        </nav>

        <div className="hidden justify-end lg:flex">
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="rounded-xl bg-[#0b1f3a] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#132a4a]"
          >
            Login
          </button>
        </div>

        <button
          type="button"
          className="justify-self-end text-[#0b1f3a] lg:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-100 bg-white lg:hidden">
          <div className="space-y-1 px-4 py-4">
            <MobileLink href="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </MobileLink>
            <MobileLink href="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </MobileLink>
            <button
              type="button"
              onClick={() => setMobileServicesOpen((open) => !open)}
              className="flex w-full items-center justify-between rounded-lg px-4 py-3 font-medium text-slate-700"
            >
              Products & Services
              <ChevronRight size={18} className={cn("transition", mobileServicesOpen && "rotate-90")} />
            </button>
            {mobileServicesOpen
              ? services.map((service) => (
                  <Link
                    key={service.path}
                    href={service.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg px-7 py-2 text-sm text-slate-500"
                  >
                    {service.name}
                  </Link>
                ))
              : null}
            <MobileLink href="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </MobileLink>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                router.push("/auth/login");
              }}
              className="mt-3 w-full rounded-xl bg-[#0b1f3a] py-3 font-semibold text-white"
            >
              Login
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[15px] font-medium text-[#1e2a4a] transition hover:text-[#2563eb]">
      {label}
    </Link>
  );
}

function MobileLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} onClick={onClick} className="block rounded-lg px-4 py-3 font-medium text-slate-700">
      {children}
    </Link>
  );
}
