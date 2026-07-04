import type { CompanyBankAccount } from "@/src/types/fundRequest";

/**
 * Demo company bank accounts for the fund request form.
 * Used when the API returns no accounts so retailers can select a deposit account in the UI.
 * Automatically replaced by real API data once company bank accounts are available.
 */
export const DEMO_COMPANY_BANK_ACCOUNTS: CompanyBankAccount[] = [
  {
    id: "demo-hdfc",
    bankName: "HDFC BANK",
    accountHolderName: "PAYTRUE TECHNOLOGIES PRIVATE LIMITED",
    accountNumber: "5010045919187",
    ifscCode: "HDFC0008610",
    branch: "Noida",
    isActive: true,
  },
  {
    id: "demo-yes",
    bankName: "YES BANK",
    accountHolderName: "PAYTRUE TECHNOLOGIES PRIVATE LIMITED",
    accountNumber: "0000000000038",
    ifscCode: "YESB0001474",
    branch: "Noida",
    isActive: true,
  },
  {
    id: "demo-axis",
    bankName: "AXIS BANK",
    accountHolderName: "PAYTRUE TECHNOLOGIES PRIVATE LIMITED",
    accountNumber: "9120000039247",
    ifscCode: "UTIB0000039",
    branch: "Noida",
    isActive: true,
  },
  {
    id: "demo-icici",
    bankName: "ICICI BANK",
    accountHolderName: "PAYTRUE TECHNOLOGIES PRIVATE LIMITED",
    accountNumber: "000000001201",
    ifscCode: "ICIC0000001",
    branch: "Noida",
    isActive: true,
  },
  {
    id: "demo-sbi",
    bankName: "STATE BANK OF INDIA",
    accountHolderName: "PAYTRUE TECHNOLOGIES PRIVATE LIMITED",
    accountNumber: "0000000007438",
    ifscCode: "SBIN00064002",
    branch: "Noida",
    isActive: true,
  },
];

export function resolveDisplayBankAccounts(
  accounts: CompanyBankAccount[],
  loading: boolean
): CompanyBankAccount[] {
  if (loading) return [];
  if (accounts.length > 0) return accounts;
  return DEMO_COMPANY_BANK_ACCOUNTS;
}

export function isDemoBankAccountId(id: string): boolean {
  return id.startsWith("demo-");
}
