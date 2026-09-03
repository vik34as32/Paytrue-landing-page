"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  Clock3,
  Fingerprint,
  IndianRupee,
  LayoutGrid,
  LockKeyhole,
  Plane,
  Send,
  Smartphone,
} from "lucide-react";
import { BankLogo } from "@/components/retailer/BankLogo";

const QUICK = [
  { title: "Money Transfer", icon: Send, color: "text-emerald-500 bg-emerald-50" },
  { title: "AEPS", icon: Fingerprint, color: "text-violet-500 bg-violet-50" },
  { title: "Mobile Recharge", icon: Smartphone, color: "text-sky-500 bg-sky-50" },
];

const PARTNERS = [
  { name: "HDFC", src: "/indian-bank/hdfc.svg" },
  { name: "ICICI", src: "/indian-bank/icici.svg" },
  { name: "SBI", src: "/indian-bank/sbi.svg" },
  { name: "Axis", src: "/indian-bank/axis.svg" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f4f6fb] text-[#0b1f3a]">
      <div className="pointer-events-none absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-[#dbe7ff] blur-[90px]" />
      <div className="pointer-events-none absolute right-[-120px] top-24 h-[520px] w-[520px] rounded-full bg-[#e4dcff] blur-[110px]" />

      <div className="relative mx-auto max-w-[1280px] px-5 pb-16 pt-10 sm:px-8 lg:px-10 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
          <div className="max-w-[560px]">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-[40px] font-extrabold leading-[1.08] tracking-[-0.04em] text-[#0b1f3a] sm:text-5xl lg:text-[58px]"
            >
              Payments Simplified.
              <span className="mt-1 block">Business Amplified.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-6 max-w-[480px] text-[17px] leading-8 text-slate-500"
            >
              All-in-one solution for Retailers to collect, transfer, recharge & grow their
              business with{" "}
              <span className="font-semibold text-[#2563eb]">secure and instant transactions.</span>
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-8"
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-xl bg-[#0b1f3a] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(11,31,58,0.7)] transition hover:-translate-y-0.5"
              >
                Login
              </Link>
            </motion.div>
          </div>

          <div className="relative mx-auto h-[560px] w-full max-w-[620px] sm:h-[620px]">
            <GlassOrb className="left-2 top-16" delay={0}>
              <IndianRupee className="h-6 w-6 text-indigo-400" />
            </GlassOrb>
            <GlassOrb className="right-4 top-10" delay={0.4}>
              <Plane className="h-6 w-6 -rotate-12 text-indigo-300" />
            </GlassOrb>
            <GlassOrb className="bottom-24 left-0" delay={0.8}>
              <IndianRupee className="h-5 w-5 text-indigo-400" />
            </GlassOrb>

            <motion.div
              initial={{ opacity: 0, x: 40, rotateY: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-6 top-6 sm:inset-x-10"
              style={{ perspective: 1400 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="origin-center rounded-[28px] bg-white p-3 shadow-[0_40px_80px_-28px_rgba(37,60,120,0.45)]"
                style={{ transform: "rotateY(-14deg) rotateX(8deg) rotateZ(2deg)" }}
              >
                <DashboardMock />
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-50 grayscale sm:mt-4"
        >
          <span className="text-lg font-black italic tracking-tight text-slate-500">VISA</span>
          <span className="text-sm font-bold text-slate-500">mastercard</span>
          <span className="text-sm font-extrabold text-slate-500">RuPay</span>
          {PARTNERS.map((p) => (
            <img key={p.name} src={p.src} alt={p.name} className="h-7 w-auto object-contain" />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function GlassOrb({
  className,
  delay,
  children,
}: {
  className?: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4.5, delay, repeat: Infinity, ease: "easeInOut" }}
      className={`absolute z-20 flex h-14 w-14 items-center justify-center rounded-full border border-white/70 bg-white/40 shadow-[0_12px_30px_rgba(80,90,160,0.18)] backdrop-blur-md ${className}`}
    >
      {children}
    </motion.div>
  );
}

function DashboardMock() {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#f7f8fc]">
      <div className="flex min-h-[430px]">
        <aside className="flex w-[58px] flex-col items-center gap-3 bg-[#1e3a8a] py-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-sm font-black text-white">
            P
          </div>
          <SideIcon active>
            <LayoutGrid className="h-4 w-4" />
          </SideIcon>
          <SideIcon>
            <IndianRupee className="h-4 w-4" />
          </SideIcon>
          <SideIcon>
            <Send className="h-4 w-4" />
          </SideIcon>
          <SideIcon>
            <Clock3 className="h-4 w-4" />
          </SideIcon>
          <SideIcon>
            <LockKeyhole className="h-4 w-4" />
          </SideIcon>
        </aside>

        <div className="relative flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[15px] font-bold text-[#0b1f3a]">Hello, Retailer 👋</p>
              <p className="text-[11px] text-slate-400">Let&apos;s grow your business today!</p>
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
              <Bell className="h-4 w-4 text-slate-500" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                3
              </span>
            </div>
          </div>

          <div className="relative mt-4 overflow-visible rounded-2xl bg-white p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]">
            <p className="text-[11px] font-semibold text-slate-400">Wallet Balance</p>
            <p className="mt-1 text-[28px] font-extrabold tracking-tight text-[#0b1f3a]">
              ₹3,25,000<span className="text-lg font-semibold text-slate-400">.00</span>
            </p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-500">↗ 12.4% from last month</p>
            <div className="pointer-events-none absolute -right-3 top-3 hidden h-[88px] w-[120px] sm:block">
              <div className="absolute left-0 top-3 h-[58px] w-[92px] -rotate-[18deg] rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#2563eb] shadow-lg" />
              <div className="absolute left-6 top-8 h-[58px] w-[92px] rotate-[8deg] rounded-xl bg-gradient-to-br from-[#818cf8] to-[#4f46e5] shadow-xl">
                <div className="absolute right-3 top-3 h-4 w-6 rounded-sm bg-white/30" />
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-3.5 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-400">Money Transfer</p>
                  <p className="mt-1 text-xl font-extrabold text-[#0b1f3a]">₹25,000</p>
                  <p className="text-[10px] font-semibold text-emerald-500">Sent Successfully</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-white shadow-md">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <BankLogo bank="HDFC" size={18} />
                  <span className="text-[10px] font-semibold text-slate-500">HDFC</span>
                </div>
                <span className="text-slate-300">→</span>
                <div className="flex items-center gap-1.5">
                  <BankLogo bank="ICICI" size={18} />
                  <span className="text-[10px] font-semibold text-slate-500">ICICI</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-3.5 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)]">
              <p className="text-[11px] font-semibold text-slate-400">Quick Services</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {QUICK.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex flex-col items-center gap-1">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-center text-[8px] font-semibold leading-tight text-slate-500">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideIcon({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
        active ? "bg-violet-500 text-white shadow-lg shadow-violet-400/40" : "text-white/70"
      }`}
    >
      {children}
    </span>
  );
}
