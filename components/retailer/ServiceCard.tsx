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
  QrCode,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { ServiceItem } from "@/types/retailer";
import { cn } from "@/lib/utils";
import type { AppDispatch } from "@/src/redux/types";
import {
  openBiometricModal,
  selectMerchantIsPendingApproval,
  selectMerchantServicesEnabled,
  selectMerchantStatusChecked,
} from "@/src/redux/slices/merchantSlice";
import { isBiometricProtectedPath } from "@/src/lib/merchantUtils";

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
  QrCode,
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
  const dispatch = useDispatch<AppDispatch>();
  const Icon = iconMap[service.icon] || Send;
  const iconBg = iconBgMap[service.category] || iconBgMap.transfer;
  const servicesEnabled = useSelector(selectMerchantServicesEnabled);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const isPendingApproval = useSelector(selectMerchantIsPendingApproval);
  const locked =
    statusChecked &&
    !servicesEnabled &&
    isBiometricProtectedPath(service.href);
  const useLink = !locked || isPendingApproval;

  const body = (
    <>
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-300 sm:h-[52px] sm:w-[52px]",
          iconBg,
          useLink && !locked && "group-hover:scale-105",
          locked && "opacity-70"
        )}
      >
        <Icon className="h-6 w-6 sm:h-[26px] sm:w-[26px]" strokeWidth={1.75} />
        {locked ? (
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 ring-2 ring-white">
            <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>

      <span
        className={cn(
          "text-center text-[11px] font-semibold leading-tight text-slate-700 sm:text-xs",
          useLink && !locked && "transition-colors group-hover:text-[#1565d8]"
        )}
      >
        {service.title}
      </span>
    </>
  );

  if (!useLink) {
    return (
      <button
        type="button"
        onClick={() => dispatch(openBiometricModal())}
        title="Complete biometric eKYC to unlock"
        className={cn(
          "group flex flex-col items-center gap-2.5 rounded-[20px] border border-amber-200/80 bg-amber-50/50 p-3.5",
          "transition-all duration-300 ease-out hover:border-amber-300",
          "sm:gap-3 sm:p-4"
        )}
      >
        {body}
      </button>
    );
  }

  return (
    <Link
      href={service.href}
      className={cn(
        "group flex flex-col items-center gap-2.5 rounded-[20px] p-3.5",
        "transition-all duration-300 ease-out",
        "sm:gap-3 sm:p-4",
        locked
          ? "border border-amber-200/80 bg-amber-50/50 hover:border-amber-300"
          : "border border-slate-100/90 bg-white hover:scale-105 hover:border-[#1565d8]/20 hover:shadow-[0_8px_28px_rgba(21,101,216,0.14)]"
      )}
      style={locked ? undefined : { boxShadow: "var(--rt-service-shadow)" }}
    >
      {body}
    </Link>
  );
}
