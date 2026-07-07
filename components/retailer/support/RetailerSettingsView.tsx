"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Globe,
  KeyRound,
  Lock,
  Monitor,
  Printer,
  Settings,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ChangePasswordDialog from "@/src/components/common/ChangePasswordDialog";
import { cn } from "@/lib/utils";

const SETTINGS_KEY = "paytrue_retailer_settings";

type SettingsTab = "notifications" | "security" | "portal";

type RetailerSettings = {
  emailNotifications: boolean;
  smsNotifications: boolean;
  transactionAlerts: boolean;
  marketingUpdates: boolean;
  autoPrintReceipt: boolean;
  compactSidebar: boolean;
  language: string;
};

const DEFAULT_SETTINGS: RetailerSettings = {
  emailNotifications: true,
  smsNotifications: true,
  transactionAlerts: true,
  marketingUpdates: false,
  autoPrintReceipt: false,
  compactSidebar: false,
  language: "en",
};

const TABS: { id: SettingsTab; label: string; icon: typeof Bell }[] = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "portal", label: "Portal", icon: Monitor },
];

function SettingToggle({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon?: typeof Bell;
}) {
  return (
    <div className="group flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 transition hover:border-[#1565d8]/25 hover:shadow-md">
      <div className="flex gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1565d8]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-[#0b1f3a]">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors",
          checked ? "bg-[#1565d8]" : "bg-slate-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

function SecurityAction({
  icon: Icon,
  label,
  description,
  actionLabel,
  onClick,
  disabled = false,
}: {
  icon: typeof KeyRound;
  label: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0b1f3a]">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onClick} disabled={disabled}>
        {actionLabel}
      </Button>
    </div>
  );
}

export default function RetailerSettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("notifications");
  const [settings, setSettings] = useState<RetailerSettings>(DEFAULT_SETTINGS);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  const updateSetting = <K extends keyof RetailerSettings>(
    key: K,
    value: RetailerSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setSaved(true);
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="min-w-0 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-[#001F5B] via-[#0b1f3a] to-[#1565d8] p-6 shadow-xl sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#0A84FF]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-32 w-32 rounded-full bg-[#ff9800]/15 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm">
              <Settings className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1 max-w-xl text-sm text-blue-100/80">
                Manage notifications, security, and portal preferences.
              </p>
            </div>
          </div>
          <Button
            onClick={saveSettings}
            className="shrink-0 bg-white text-[#001F5B] hover:bg-blue-50"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <motion.nav
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-row gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur-sm lg:flex-col lg:overflow-visible"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all",
                  active
                    ? "bg-gradient-to-r from-[#1565d8] to-[#0A84FF] text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <AnimatePresence mode="wait">
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-[#001F5B]">
                    Notifications
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Control how you receive alerts and updates
                  </p>
                </div>
                <SettingToggle
                  icon={Bell}
                  label="Email Notifications"
                  description="Fund request approvals, ticket replies and account updates"
                  checked={settings.emailNotifications}
                  onChange={(v) => updateSetting("emailNotifications", v)}
                />
                <SettingToggle
                  icon={Smartphone}
                  label="SMS Alerts"
                  description="OTP, transaction confirmations on registered mobile"
                  checked={settings.smsNotifications}
                  onChange={(v) => updateSetting("smsNotifications", v)}
                />
                <SettingToggle
                  icon={Zap}
                  label="Transaction Alerts"
                  description="Instant alert on every wallet credit or debit"
                  checked={settings.transactionAlerts}
                  onChange={(v) => updateSetting("transactionAlerts", v)}
                />
                <SettingToggle
                  icon={Globe}
                  label="Marketing Updates"
                  description="Commission offers, new services and promotions"
                  checked={settings.marketingUpdates}
                  onChange={(v) => updateSetting("marketingUpdates", v)}
                />
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-[#001F5B]">Security</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Protect your account and manage access
                  </p>
                </div>
                <SecurityAction
                  icon={KeyRound}
                  label="Change Password"
                  description="Update login password — signs out all devices"
                  actionLabel="Update"
                  onClick={() => setShowChangePassword(true)}
                />
                <SecurityAction
                  icon={Lock}
                  label="Two-Factor Authentication"
                  description="Extra security layer for your account"
                  actionLabel="Enable"
                  disabled
                />
                <SecurityAction
                  icon={Smartphone}
                  label="Active Sessions"
                  description="View and manage logged-in devices"
                  actionLabel="Manage"
                  disabled
                />
              </motion.div>
            )}

            {activeTab === "portal" && (
              <motion.div
                key="portal"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h2 className="text-lg font-bold text-[#001F5B]">
                    Portal Preferences
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Customize your dashboard experience
                  </p>
                </div>
                <SettingToggle
                  icon={Printer}
                  label="Auto-print Receipt"
                  description="Open print dialog automatically after successful transactions"
                  checked={settings.autoPrintReceipt}
                  onChange={(v) => updateSetting("autoPrintReceipt", v)}
                />
                <SettingToggle
                  icon={Monitor}
                  label="Compact Sidebar"
                  description="Narrower sidebar with icons on desktop"
                  checked={settings.compactSidebar}
                  onChange={(v) => updateSetting("compactSidebar", v)}
                />
                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-[#0b1f3a]">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    className="h-11 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1565d8]"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
}
