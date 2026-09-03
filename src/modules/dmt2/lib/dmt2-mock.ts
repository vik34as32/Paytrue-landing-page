/** Mock OTP used across DMT2 until real APIs are wired. */
export const DMT2_MOCK_OTP = "123456";

export function maskMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length < 4) return mobile;
  return `+91 XXXXXXX${digits.slice(-3)}`;
}

export function maskAccount(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `XXXX XXXX ${digits.slice(-4)}`;
}

export function generateTxnId(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `DMT2PAYOUT${n}`;
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateLong(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;
export const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const SEED_TRANSACTIONS = [
  {
    customerName: "Rahul Kumar",
    accountNumber: "123456789012",
    ifsc: "HDFC0001234",
    customerMobile: "9876543210",
    amount: 10000,
    mode: "IMPS" as const,
    purpose: "Customer Refund",
    referenceId: "ORD-10245",
    status: "SUCCESS" as const,
  },
  {
    customerName: "Amit Verma",
    accountNumber: "998877665544",
    ifsc: "SBIN0000456",
    customerMobile: "9876500002",
    amount: 25000,
    mode: "NEFT" as const,
    purpose: "Vendor payment",
    referenceId: "ORD-20011",
    status: "PROCESSING" as const,
  },
  {
    customerName: "Ravi Singh",
    accountNumber: "112233445566",
    ifsc: "ICIC0000789",
    customerMobile: "9876500003",
    amount: 5000,
    mode: "IMPS" as const,
    purpose: "Family support",
    referenceId: "ORD-20012",
    status: "SUCCESS" as const,
  },
];
