export interface RetailerDashboardUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: string;
  userType: string;
  userCode?: string;
  email?: string;
  mobile?: string;
  lastLoginAt?: string | null;
}

export interface RetailerDashboardWallet {
  balance: number;
  holdAmount: number;
  status: string | null;
}

export interface RetailerDashboardStatCount {
  count: number;
  changePercent?: number;
}

export interface RetailerDashboardSuccessStat {
  count: number;
  rate: number;
  changePercent?: number;
}

export interface RetailerDashboardCommission {
  today: number;
  total: number;
  changePercent?: number;
}

export interface RetailerDashboardPendingSettlement {
  amount: number;
  count: number;
  label: string;
}

export interface RetailerDashboardStats {
  todayTransactions: RetailerDashboardStatCount;
  totalTransactions: { count: number };
  todaySuccess: RetailerDashboardSuccessStat;
  totalSuccess: RetailerDashboardSuccessStat;
  commissionEarned: RetailerDashboardCommission;
  pendingSettlement: RetailerDashboardPendingSettlement;
}

export interface RetailerDashboardData {
  greeting: string;
  systemStatus: string;
  user: RetailerDashboardUser;
  wallet: RetailerDashboardWallet;
  stats: RetailerDashboardStats;
}

export interface RetailerBusinessPeriods {
  today: number;
  monthly: number;
  yearly: number;
  total: number;
}

export interface RetailerBusinessStats {
  scope: string;
  user: RetailerDashboardUser;
  business: RetailerBusinessPeriods;
  meta?: {
    retailerCount?: number;
    generatedAt?: string;
  };
}

export type DashboardStatTrend = "up" | "down" | "neutral";

export type DashboardStatAccent = "blue" | "emerald" | "violet" | "amber";

export interface DashboardStatCard {
  id: string;
  label: string;
  todayLabel: string;
  todayValue: string;
  totalLabel: string;
  totalValue: string;
  change: string;
  trend: DashboardStatTrend;
  icon: "Activity" | "IndianRupee" | "CheckCircle2" | "Clock";
  accent: DashboardStatAccent;
}
