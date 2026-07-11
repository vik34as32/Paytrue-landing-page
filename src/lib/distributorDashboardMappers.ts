import { formatCurrency } from "@/lib/utils";
import type {
  DistributorDashboardMetrics,
  DistributorStatCard,
} from "@/src/types/distributorDashboard";

export function mapDistributorDashboardStats(
  metrics?: DistributorDashboardMetrics | null
): DistributorStatCard[] {
  const data = metrics ?? {
    totalBusiness: 0,
    todayBusiness: 0,
    monthlyBusiness: 0,
    todayCommission: 0,
    totalCommission: 0,
  };

  return [
    {
      id: "total-business",
      label: "Total Business",
      value: formatCurrency(data.totalBusiness),
      icon: "BarChart3",
      accent: "blue",
    },
    {
      id: "today-business",
      label: "Today Business",
      value: formatCurrency(data.todayBusiness),
      icon: "IndianRupee",
      accent: "emerald",
    },
    {
      id: "monthly-business",
      label: "Monthly Business",
      value: formatCurrency(data.monthlyBusiness),
      icon: "CalendarDays",
      accent: "violet",
    },
    {
      id: "today-commission",
      label: "Today Commission Earned",
      value: formatCurrency(data.todayCommission),
      icon: "TrendingUp",
      accent: "amber",
    },
    {
      id: "total-commission",
      label: "Total Commission Earned",
      value: formatCurrency(data.totalCommission),
      icon: "Wallet",
      accent: "cyan",
    },
  ];
}
