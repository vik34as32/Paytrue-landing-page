import type { ServiceItem } from "@/types/retailer";

export const SERVICE_CATEGORIES = [
  { id: "all", label: "All Services" },
  { id: "transfer", label: "Money Transfer" },
  { id: "aeps", label: "AEPS & Banking" },
  { id: "recharge", label: "Recharge" },
  { id: "utility", label: "BBPS Utilities" },
  { id: "payment", label: "Bill Payments" },
] as const;

export const DASHBOARD_STATS = [
  {
    id: "today_txn",
    label: "Today's Transactions",
    value: "47",
    change: "+12%",
    trend: "up" as const,
    icon: "Activity",
  },
  {
    id: "commission",
    label: "Commission Earned",
    value: "₹1,284",
    change: "+8.5%",
    trend: "up" as const,
    icon: "IndianRupee",
  },
  {
    id: "success_rate",
    label: "Success Rate",
    value: "98.6%",
    change: "+0.4%",
    trend: "up" as const,
    icon: "CheckCircle2",
  },
  {
    id: "pending",
    label: "Pending Settlement",
    value: "₹3,450",
    change: "2 items",
    trend: "neutral" as const,
    icon: "Clock",
  },
];

export const QUICK_ACTIONS = [
  {
    id: "fund",
    label: "Fund Request",
    href: "/rt/retailer/fund-request",
    icon: "Wallet",
    color: "bg-blue-600",
  },
  {
    id: "dmt",
    label: "Send Money",
    href: "/rt/retailer/dmt",
    icon: "Send",
    color: "bg-indigo-600",
  },
  {
    id: "statement",
    label: "Statement",
    href: "/rt/retailer/statement",
    icon: "FileText",
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
  {
    id: "profile",
    label: "My Profile",
    href: "/rt/retailer/profile",
    icon: "User",
    color: "bg-slate-600",
  },
];

export function filterServicesByCategory(
  services: ServiceItem[],
  category: string
): ServiceItem[] {
  if (category === "all") return services;
  return services.filter((s) => s.category === category);
}
