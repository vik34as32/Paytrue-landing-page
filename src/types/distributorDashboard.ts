export interface DistributorBusinessPeriods {
  today: number;
  monthly: number;
  yearly: number;
  total: number;
}

export interface DistributorBusinessResponse {
  scope?: string;
  business: DistributorBusinessPeriods;
  meta?: {
    retailerCount?: number;
    generatedAt?: string;
  };
}

export interface DistributorStatsResponse {
  totalCommission?: number;
  todayCommission?: number;
  commissionEarned?: {
    today?: number;
    total?: number;
  };
  businessVolume?: number;
  retailerCount?: number;
  totalRetailerBusiness?: number;
}

export interface DistributorDashboardMetrics {
  totalBusiness: number;
  todayBusiness: number;
  monthlyBusiness: number;
  todayCommission: number;
  totalCommission: number;
}

export type DistributorStatAccent = "blue" | "emerald" | "violet" | "amber" | "cyan";

export interface DistributorStatCard {
  id: string;
  label: string;
  value: string;
  icon: "IndianRupee" | "TrendingUp" | "CalendarDays" | "BarChart3" | "Wallet";
  accent: DistributorStatAccent;
}
