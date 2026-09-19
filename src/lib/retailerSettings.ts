export const RETAILER_SETTINGS_KEY = "paytrue_retailer_settings";

export type RetailerSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  transactionAlerts: boolean;
  marketingUpdates: boolean;
  autoPrintReceipt: boolean;
  compactSidebar: boolean;
  language: string;
};

export const DEFAULT_RETAILER_SETTINGS: RetailerSettings = {
  emailNotifications: true,
  smsNotifications: true,
  transactionAlerts: true,
  marketingUpdates: false,
  autoPrintReceipt: false,
  compactSidebar: false,
  language: "en",
};

export function readRetailerSettings(): RetailerSettings {
  if (typeof window === "undefined") return DEFAULT_RETAILER_SETTINGS;
  try {
    const raw = localStorage.getItem(RETAILER_SETTINGS_KEY);
    if (!raw) return DEFAULT_RETAILER_SETTINGS;
    return { ...DEFAULT_RETAILER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_RETAILER_SETTINGS;
  }
}

export function writeRetailerSettings(settings: RetailerSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RETAILER_SETTINGS_KEY, JSON.stringify(settings));
}

export function isAutoPrintReceiptEnabled(): boolean {
  return Boolean(readRetailerSettings().autoPrintReceipt);
}
