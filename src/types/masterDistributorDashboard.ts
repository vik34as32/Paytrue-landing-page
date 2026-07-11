export interface BusinessPeriods {
  today: number;
  monthly: number;
  yearly: number;
  total: number;
}

export interface BusinessBreakdownUser {
  id?: string;
  name?: string;
  userCode?: string;
  email?: string;
  mobile?: string;
  userType?: string;
}

export interface BusinessBreakdownItem {
  user: BusinessBreakdownUser;
  retailerCount?: number;
  business: BusinessPeriods;
}

export interface MasterDistributorBusinessResponse {
  scope?: string;
  business: BusinessPeriods;
  breakdown?: BusinessBreakdownItem[];
  meta?: {
    retailerCount?: number;
    generatedAt?: string;
  };
}

export interface MasterDistributorDashboardMetrics {
  totalDistributors: number;
  activeDistributors: number;
  inactiveDistributors: number;
  todayDistributors: number;
  todayBusiness: number;
  monthlyBusiness: number;
  yearlyBusiness: number;
  totalBusiness: number;
  retailerCount: number;
  breakdown: BusinessBreakdownItem[];
  recentDistributors: Record<string, unknown>[];
  recentLogins: Record<string, unknown>[];
}

export type MasterDistributorStatAccent =
  | "blue"
  | "emerald"
  | "violet"
  | "amber"
  | "cyan"
  | "rose"
  | "indigo"
  | "orange";

export interface MasterDistributorStatCard {
  id: string;
  label: string;
  value: string;
  icon: string;
  accent: MasterDistributorStatAccent;
  group: "network" | "business";
}
