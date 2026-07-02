import type { NewsItem, RetailerUser, ServiceItem } from "@/types/retailer";

export const RETAILER_USER: RetailerUser = {
  id: "rt_100245",
  name: "Amit Kumar",
  email: "support@paytrue.co.in",
  mobile: "+91 98765 43210",
  retailerId: "PTRT784521",
  kycStatus: "pending",
};

export const SUPPORT_EMAIL = "support@paytrue.co.in";
export const SUPPORT_MOBILE = "+91 98765 43210";

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "news_1",
    message:
      "🎉 New commission structure effective from 1st July 2026 — Check your earnings dashboard!",
    type: "success",
  },
  {
    id: "news_2",
    message:
      "⚡ ICICI AEPS services now available 24x7 with instant settlement.",
    type: "info",
  },
  {
    id: "news_3",
    message:
      "📢 Complete your KYC verification to unlock higher transaction limits.",
    type: "warning",
  },
];

export const SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/rt/retailer", icon: "LayoutDashboard" },
  {
    label: "Fund Request",
    href: "/rt/retailer/fund-request",
    icon: "Wallet",
  },
  { label: "Services", href: "/rt/retailer", icon: "Grid3x3" },
  {
    label: "Statement",
    href: "/rt/retailer/statement",
    icon: "FileText",
  },
  {
    label: "Profile Management",
    href: "/rt/retailer/profile",
    icon: "UserCog",
  },
  // {
  //   label: "My Account",
  //   href: "/rt/retailer/profile",
  //   icon: "User",
  // },
];

export const POPULAR_SERVICES: ServiceItem[] = [
  {
    id: "dmt",
    title: "DMT",
    href: "/rt/retailer/dmt",
    icon: "Send",
    color: "from-blue-500 to-blue-700",
    category: "transfer",
  },
  {
    id: "xpress_dmt",
    title: "Xpress DMT",
    href: "/rt/retailer/dmt",
    icon: "Zap",
    color: "from-indigo-500 to-indigo-700",
    category: "transfer",
  },
  {
    id: "nsdl_aeps",
    title: "NSDL AEPS",
    href: "/rt/retailer/aeps",
    icon: "Fingerprint",
    color: "from-purple-500 to-purple-700",
    category: "aeps",
  },
  {
    id: "icici_aeps",
    title: "ICICI AEPS",
    href: "/rt/retailer/aeps",
    icon: "ScanFace",
    color: "from-violet-500 to-violet-700",
    category: "aeps",
  },
  {
    id: "aadhaar_pay",
    title: "Aadhaar Pay",
    href: "/rt/retailer/aeps",
    icon: "BadgeCheck",
    color: "from-fuchsia-500 to-fuchsia-700",
    category: "aeps",
  },
  {
    id: "mobile_recharge",
    title: "Mobile Recharge",
    href: "/rt/retailer/recharge",
    icon: "Smartphone",
    color: "from-green-500 to-green-700",
    category: "recharge",
  },
  {
    id: "dth_recharge",
    title: "DTH Recharge",
    href: "/rt/retailer/recharge",
    icon: "Tv",
    color: "from-orange-500 to-orange-700",
    category: "recharge",
  },
  {
    id: "fastag_recharge",
    title: "Fastag",
    href: "/rt/retailer/recharge",
    icon: "Car",
    color: "from-amber-500 to-amber-700",
    category: "recharge",
  },
  {
    id: "electricity",
    title: "Electricity Bill",
    href: "/rt/retailer/electricity",
    icon: "Zap",
    color: "from-yellow-500 to-yellow-700",
    category: "utility",
  },
  {
    id: "cable_tv",
    title: "Cable TV",
    href: "/rt/retailer/broadband",
    icon: "Monitor",
    color: "from-rose-500 to-rose-700",
    category: "utility",
  },
  {
    id: "postpaid",
    title: "Postpaid",
    href: "/rt/retailer/recharge",
    icon: "Phone",
    color: "from-cyan-500 to-cyan-700",
    category: "recharge",
  },
  {
    id: "landline",
    title: "Landline",
    href: "/rt/retailer/recharge",
    icon: "PhoneCall",
    color: "from-teal-500 to-teal-700",
    category: "recharge",
  },
  {
    id: "lpg_gas",
    title: "LPG Gas",
    href: "/rt/retailer/gas",
    icon: "Flame",
    color: "from-red-500 to-red-700",
    category: "utility",
  },
  {
    id: "piped_gas",
    title: "Piped Gas",
    href: "/rt/retailer/gas",
    icon: "Wind",
    color: "from-orange-400 to-orange-600",
    category: "utility",
  },
  {
    id: "water",
    title: "Water Bill",
    href: "/rt/retailer/water",
    icon: "Droplets",
    color: "from-sky-500 to-sky-700",
    category: "utility",
  },
  {
    id: "broadband",
    title: "Broadband",
    href: "/rt/retailer/broadband",
    icon: "Wifi",
    color: "from-blue-400 to-blue-600",
    category: "utility",
  },
  {
    id: "credit_card",
    title: "Credit Card Bill",
    href: "/rt/retailer/credit-card",
    icon: "CreditCard",
    color: "from-slate-600 to-slate-800",
    category: "payment",
  },
  {
    id: "loan",
    title: "Loan Repayment",
    href: "/rt/retailer/credit-card",
    icon: "Landmark",
    color: "from-stone-500 to-stone-700",
    category: "payment",
  },
  {
    id: "insurance",
    title: "Insurance",
    href: "/rt/retailer/insurance",
    icon: "Shield",
    color: "from-emerald-500 to-emerald-700",
    category: "payment",
  },
  {
    id: "municipal",
    title: "Municipal Tax",
    href: "/rt/retailer/electricity",
    icon: "Building2",
    color: "from-gray-500 to-gray-700",
    category: "utility",
  },
  {
    id: "lic",
    title: "LIC Payment",
    href: "/rt/retailer/insurance",
    icon: "Heart",
    color: "from-pink-500 to-pink-700",
    category: "payment",
  },
];
