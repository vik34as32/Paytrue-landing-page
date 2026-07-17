import type { ServiceItem } from "@/types/retailer";

export const SERVICE_CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "transfer", label: "Money Transfer" },
  { id: "aeps", label: "AEPS & Banking" },
  { id: "recharge", label: "Recharge" },
  { id: "utility", label: "BBPS Utilities" },
  { id: "payment", label: "Bill Payments" },
] as const;

export const QUICK_ACTIONS = [
  {
    id: "dmt",
    label: "Send Money",
    href: "/rt/retailer/dmt",
    icon: "Send",
    color: "bg-indigo-600",
  },
  {
    id: "upi_cash_point",
    label: "UPI",
    href: "/rt/retailer/upi-cash-point",
    icon: "QrCode",
    color: "bg-violet-600",
  },
  {
    id: "aeps",
    label: "AEPS",
    href: "/rt/retailer/aeps",
    icon: "Fingerprint",
    color: "bg-purple-600",
  },
  {
    id: "recharge",
    label: "Recharge",
    href: "/rt/retailer/recharge",
    icon: "Smartphone",
    color: "bg-emerald-600",
  },
];

export function filterServicesByCategory(
  services: ServiceItem[],
  category: string
): ServiceItem[] {
  if (category === "all") return services;
  return services.filter((s) => s.category === category);
}
