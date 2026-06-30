export const SUPPORT_EMAIL = "support@paytrue.co.in";
export const SUPPORT_MOBILE = "+91 98765 43210";

export const MD_SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/md/dashboard", icon: "LayoutDashboard" },
  { label: "Distributors", href: "/md/distributors/list", icon: "Users" },
  { label: "Balance Transfer", href: "/md/balance-transfer", icon: "ArrowLeftRight" },
  { label: "Fund Requests", href: "/md/fund-requests", icon: "Wallet" },
  { label: "Transactions", href: "/md/transactions", icon: "FileText" },
  { label: "Reports", href: "/md/reports", icon: "BarChart3" },
  { label: "Wallet", href: "/md/wallet", icon: "CreditCard" },
  { label: "Profile", href: "/md/profile", icon: "User" },
  { label: "Settings", href: "/md/settings", icon: "Settings" },
];

export const DD_SIDEBAR_LINKS = [
  { label: "Dashboard", href: "/dd/dashboard", icon: "LayoutDashboard" },
  { label: "Retailers", href: "/dd/retailers/list", icon: "Store" },
  { label: "Balance Transfer", href: "/dd/balance-transfer", icon: "ArrowLeftRight" },
  { label: "Fund Requests", href: "/dd/fund-requests", icon: "Wallet" },
  { label: "Transactions", href: "/dd/transactions", icon: "FileText" },
  { label: "Reports", href: "/dd/reports", icon: "BarChart3" },
  { label: "Wallet", href: "/dd/wallet", icon: "CreditCard" },
  { label: "Profile", href: "/dd/profile", icon: "User" },
  { label: "Settings", href: "/dd/settings", icon: "Settings" },
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
