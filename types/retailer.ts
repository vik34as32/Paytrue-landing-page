export type TransactionType = "debit" | "credit";
export type WalletType = "main" | "retailer";

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  balanceAfter: number;
  walletType: WalletType;
  createdAt: string;
}

export interface RetailerUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  retailerId: string;
  kycStatus: "pending" | "verified" | "rejected";
  avatar?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  mobile: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  createdAt: string;
}

export interface DMTTransfer {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  remark: string;
  status: "success" | "pending" | "failed";
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  color: string;
  category: string;
}

export interface NewsItem {
  id: string;
  message: string;
  type: "info" | "warning" | "success";
}

export interface RechargeOperator {
  id: string;
  name: string;
  type: "mobile" | "postpaid" | "dth" | "fastag";
}

export interface RechargePlan {
  id: string;
  operatorId: string;
  amount: number;
  validity: string;
  description: string;
}
