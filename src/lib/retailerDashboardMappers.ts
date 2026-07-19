import { formatCurrency } from "@/lib/utils";
import type {
  DashboardStatCard,
  RetailerBusinessPeriods,
  RetailerDashboardData,
} from "@/src/types/retailerDashboard";

export function formatChangePercent(value: number | undefined): {
  text: string;
  trend: "up" | "down" | "neutral";
} {
  const num = Number(value ?? 0);
  if (num > 0) return { text: `+${num}%`, trend: "up" };
  if (num < 0) return { text: `${num}%`, trend: "down" };
  return { text: "0%", trend: "neutral" };
}

/** Retailer dashboard badges — never show negative change */
export function formatDashboardChangePercent(value: number | undefined): {
  text: string;
  trend: "up" | "down" | "neutral";
} {
  const num = Math.max(0, Number(value ?? 0));
  if (num > 0) return { text: `+${num}%`, trend: "up" };
  return { text: "0%", trend: "neutral" };
}

/** Success rate change badge must never show a negative value */
export function formatSuccessChangePercent(value: number | undefined): {
  text: string;
  trend: "up" | "down" | "neutral";
} {
  return formatDashboardChangePercent(value);
}

export function clampSuccessRate(rate: number | undefined): number {
  return Math.max(0, Number(rate ?? 0));
}

export function mapRetailerDashboardStats(
  dashboard: RetailerDashboardData | undefined
): DashboardStatCard[] {
  if (!dashboard?.stats) return [];

  const { stats } = dashboard;
  const txnChange = formatDashboardChangePercent(stats.todayTransactions.changePercent);
  const commissionChange = formatDashboardChangePercent(stats.commissionEarned.changePercent);
  const successChange = formatSuccessChangePercent(stats.todaySuccess.changePercent);

  const pendingCount = stats.pendingSettlement.count ?? 0;
  const pendingLabel =
    stats.pendingSettlement.label ||
    (pendingCount === 1 ? "1 item" : `${pendingCount} items`);

  return [
    {
      id: "transactions",
      label: "Transactions",
      todayLabel: "Today",
      todayValue: String(stats.todayTransactions.count ?? 0),
      totalLabel: "Total",
      totalValue: String(stats.totalTransactions.count ?? 0),
      change: txnChange.text,
      trend: txnChange.trend,
      icon: "Activity",
      accent: "blue",
    },
    {
      id: "commission",
      label: "Commission Earned",
      todayLabel: "Today",
      todayValue: formatCurrency(stats.commissionEarned.today ?? 0),
      totalLabel: "Total",
      totalValue: formatCurrency(stats.commissionEarned.total ?? 0),
      change: commissionChange.text,
      trend: commissionChange.trend,
      icon: "IndianRupee",
      accent: "emerald",
    },
    {
      id: "success_rate",
      label: "Success Rate",
      todayLabel: "Today",
      todayValue: `${clampSuccessRate(stats.todaySuccess.rate)}%`,
      totalLabel: "Total",
      totalValue: `${clampSuccessRate(stats.totalSuccess.rate)}%`,
      change: successChange.text,
      trend: successChange.trend,
      icon: "CheckCircle2",
      accent: "violet",
    },
    {
      id: "pending",
      label: "Pending Settlement",
      todayLabel: "Today",
      todayValue: pendingLabel,
      totalLabel: "Total",
      totalValue: formatCurrency(stats.pendingSettlement.amount ?? 0),
      change: pendingLabel,
      trend: "neutral",
      icon: "Clock",
      accent: "amber",
    },
  ];
}

export function formatDashboardGreeting(greeting: string | undefined): string {
  if (!greeting?.trim()) {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }
  return greeting
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatLastLogin(value: string | null | undefined): string {
  if (!value) {
    return new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface BusinessVolumeCard {
  id: string;
  label: string;
  value: string;
  amount: number;
}

export function mapBusinessVolumeCards(
  business: RetailerBusinessPeriods | undefined
): BusinessVolumeCard[] {
  if (!business) return [];

  const today = business.today ?? 0;
  const monthly = business.monthly ?? 0;
  const yearly = business.yearly ?? 0;
  const total = business.total ?? 0;

  return [
    {
      id: "today",
      label: "Today's Business",
      value: formatCurrency(today),
      amount: today,
    },
    {
      id: "monthly",
      label: "Monthly Business",
      value: formatCurrency(monthly),
      amount: monthly,
    },
    {
      id: "yearly",
      label: "Yearly Business",
      value: formatCurrency(yearly),
      amount: yearly,
    },
    {
      id: "total",
      label: "Total Business",
      value: formatCurrency(total),
      amount: total,
    },
  ];
}
