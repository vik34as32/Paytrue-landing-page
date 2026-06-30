export const mdDashboardStats = [
  {
    id: "total_distributors",
    label: "Total Distributors",
    valueKey: "totalDistributors",
    icon: "Users",
    format: "number",
    trend: "up",
    change: "",
  },
  {
    id: "active_distributors",
    label: "Active Distributors",
    valueKey: "activeDistributors",
    icon: "UserCheck",
    format: "number",
    trend: "up",
    change: "",
  },
  {
    id: "inactive_distributors",
    label: "Inactive Distributors",
    valueKey: "inactiveDistributors",
    icon: "UserX",
    format: "number",
    trend: "down",
    change: "",
  },
  {
    id: "today_distributors",
    label: "Today's Distributors",
    valueKey: "todayDistributors",
    icon: "CalendarPlus",
    format: "number",
    trend: "up",
    change: "Today",
  },
];

export const ddDashboardStats = [
  {
    id: "wallet_balance",
    label: "Wallet Balance",
    valueKey: "walletBalance",
    icon: "Wallet",
    format: "currency",
    trend: "up",
    change: "+1.8%",
  },
  {
    id: "total_retailers",
    label: "Total Retailers",
    valueKey: "totalRetailers",
    icon: "Store",
    format: "number",
    trend: "up",
    change: "+5",
  },
  {
    id: "today_business",
    label: "Today's Business",
    valueKey: "todayBusiness",
    icon: "IndianRupee",
    format: "currency",
    trend: "up",
    change: "+9%",
  },
  {
    id: "today_commission",
    label: "Today's Commission",
    valueKey: "todayCommission",
    icon: "TrendingUp",
    format: "currency",
    trend: "up",
    change: "+6%",
  },
];

export const mdDashboardValues = {
  totalDistributors: 0,
  activeDistributors: 0,
  inactiveDistributors: 0,
  todayDistributors: 0,
  recentDistributors: [],
  recentLogins: [],
};

export const ddDashboardValues = {
  walletBalance: 850000,
  totalRetailers: 126,
  todayBusiness: 98450,
  todayCommission: 5680,
};

export const mdUser = {
  id: "md_10001",
  name: "Rajesh Sharma",
  email: "rajesh.sharma@paytrue.co.in",
  mobile: "+91 98765 11111",
  role: "master_distributor",
  roleLabel: "Master Distributor",
  portalLabel: "Master Distributor Portal",
  userId: "PTMD784521",
};

export const ddUser = {
  id: "dd_20001",
  name: "Vikram Singh",
  email: "vikram.singh@paytrue.co.in",
  mobile: "+91 98765 22222",
  role: "distributor",
  roleLabel: "Distributor",
  portalLabel: "Distributor Portal",
  userId: "PTDD452189",
};
