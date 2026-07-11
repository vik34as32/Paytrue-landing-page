import { formatCurrency } from "@/lib/utils";
import type {
  MasterDistributorDashboardMetrics,
  MasterDistributorStatCard,
} from "@/src/types/masterDistributorDashboard";

export function mapMasterDistributorDashboardStats(
  metrics?: MasterDistributorDashboardMetrics | null
): MasterDistributorStatCard[] {
  const data = metrics ?? {
    totalDistributors: 0,
    activeDistributors: 0,
    inactiveDistributors: 0,
    todayDistributors: 0,
    todayBusiness: 0,
    monthlyBusiness: 0,
    yearlyBusiness: 0,
    totalBusiness: 0,
    retailerCount: 0,
    breakdown: [],
    recentDistributors: [],
    recentLogins: [],
  };

  return [
    {
      id: "total-distributors",
      label: "Total Distributors",
      value: String(data.totalDistributors),
      icon: "Users",
      accent: "blue",
      group: "network",
    },
    {
      id: "active-distributors",
      label: "Active Distributors",
      value: String(data.activeDistributors),
      icon: "UserCheck",
      accent: "emerald",
      group: "network",
    },
    {
      id: "inactive-distributors",
      label: "Inactive Distributors",
      value: String(data.inactiveDistributors),
      icon: "UserX",
      accent: "rose",
      group: "network",
    },
    {
      id: "today-distributors",
      label: "Today's Onboarded",
      value: String(data.todayDistributors),
      icon: "CalendarPlus",
      accent: "violet",
      group: "network",
    },
    {
      id: "today-business",
      label: "Today Business",
      value: formatCurrency(data.todayBusiness),
      icon: "IndianRupee",
      accent: "cyan",
      group: "business",
    },
    {
      id: "monthly-business",
      label: "Monthly Business",
      value: formatCurrency(data.monthlyBusiness),
      icon: "CalendarDays",
      accent: "indigo",
      group: "business",
    },
    {
      id: "yearly-business",
      label: "Yearly Business",
      value: formatCurrency(data.yearlyBusiness),
      icon: "BarChart3",
      accent: "orange",
      group: "business",
    },
    {
      id: "total-business",
      label: "Total Business",
      value: formatCurrency(data.totalBusiness),
      icon: "TrendingUp",
      accent: "amber",
      group: "business",
    },
  ];
}
