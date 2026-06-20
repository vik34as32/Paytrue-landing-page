"use client";

import Link from "next/link";
import {
  Send,
  Zap,
  Fingerprint,
  ScanFace,
  BadgeCheck,
  Smartphone,
  Tv,
  Car,
  Phone,
  PhoneCall,
  Flame,
  Wind,
  Droplets,
  Wifi,
  CreditCard,
  Landmark,
  Shield,
  Building2,
  Heart,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import type { ServiceItem } from "@/types/retailer";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Send,
  Zap,
  Fingerprint,
  ScanFace,
  BadgeCheck,
  Smartphone,
  Tv,
  Car,
  Phone,
  PhoneCall,
  Flame,
  Wind,
  Droplets,
  Wifi,
  CreditCard,
  Landmark,
  Shield,
  Building2,
  Heart,
  Monitor,
};

const iconBgMap: Record<string, string> = {
  transfer: "bg-blue-50 text-blue-600 ring-blue-100",
  aeps: "bg-violet-50 text-violet-600 ring-violet-100",
  recharge: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  utility: "bg-amber-50 text-amber-600 ring-amber-100",
  payment: "bg-rose-50 text-rose-600 ring-rose-100",
};

interface ServiceCardProps {
  service: ServiceItem;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Send;
  const iconBg = iconBgMap[service.category] || iconBgMap.transfer;

  return (
    <Link
      href={service.href}
      className={cn(
        "group flex flex-col items-center gap-2.5 rounded-[20px] border border-slate-100/90 bg-white p-3.5",
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:border-[#1565d8]/20 hover:shadow-[0_8px_28px_rgba(21,101,216,0.14)]",
        "sm:gap-3 sm:p-4"
      )}
      style={{ boxShadow: "var(--rt-service-shadow)" }}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 group-hover:scale-105 sm:h-[52px] sm:w-[52px]",
          iconBg
        )}
      >
        <Icon className="h-6 w-6 sm:h-[26px] sm:w-[26px]" strokeWidth={1.75} />
      </div>

      <span className="text-center text-[11px] font-semibold leading-tight text-slate-700 transition-colors group-hover:text-[#1565d8] sm:text-xs">
        {service.title}
      </span>
    </Link>
  );
}
