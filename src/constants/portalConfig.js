export const SUPPORT_EMAIL = "support@paytrue.co.in";
export const SUPPORT_MOBILE = "+91 98765 43210";

export const MD_SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/md/dashboard", icon: "LayoutDashboard" },
  { label: "Distributors", href: "/md/distributors/list", icon: "Users" },
  { label: "Balance Transfer", href: "/md/balance-transfer", icon: "ArrowLeftRight" },
  { label: "Balance Deduct", href: "/md/wallet-deduct", icon: "MinusCircle" },
  { label: "Fund Requests", href: "/md/fund-requests", icon: "Wallet" },
  { label: "Transactions", href: "/md/transactions", icon: "FileText" },
  { label: "Reports", href: "/md/reports", icon: "BarChart3" },
  { label: "Wallet", href: "/md/wallet", icon: "CreditCard" },
  { label: "Wallet Summary", href: "/md/wallet-summary", icon: "FileSpreadsheet" },
  { label: "Commission Report", href: "/md/commission", icon: "IndianRupee" },
];

export const DD_SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dd/dashboard", icon: "LayoutDashboard" },
  { label: "Retailers", href: "/dd/retailers/list", icon: "Store" },
  { label: "Balance Transfer", href: "/dd/balance-transfer", icon: "ArrowLeftRight" },
  { label: "Balance Deduct", href: "/dd/wallet-deduct", icon: "MinusCircle" },
  { label: "Fund Requests", href: "/dd/fund-requests", icon: "Wallet" },
  { label: "Transactions", href: "/dd/transactions", icon: "FileText" },
  { label: "Wallet", href: "/dd/wallet", icon: "CreditCard" },
  { label: "Wallet Summary", href: "/dd/wallet-summary", icon: "FileSpreadsheet" },
  { label: "Commission Report", href: "/dd/commission", icon: "IndianRupee" },
];

export const PORTAL_CONFIG = {
  md: {
    basePath: "/md",
    dashboardPath: "/md/dashboard",
    portalLabel: "Master Distributor Portal",
    sidebarLinks: MD_SIDEBAR_LINKS,
  },
  dd: {
    basePath: "/dd",
    dashboardPath: "/dd/dashboard",
    portalLabel: "Distributor Portal",
    sidebarLinks: DD_SIDEBAR_LINKS,
  },
};
