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
  Receipt,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ChangePasswordDialog from "@/src/components/common/ChangePasswordDialog";
import { cn } from "@/lib/utils";
import {
  DEFAULT_RETAILER_SETTINGS,
  readRetailerSettings,
  writeRetailerSettings,
  type RetailerSettings,
} from "@/src/lib/retailerSettings";

type SettingsTab = "notifications" | "security" | "portal";

const TABS: { id: SettingsTab; label: string; icon: typeof Bell }[] = [
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "portal", label: "Receipts & Portal", icon: Receipt },
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
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "group flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition",
        checked
          ? "border-blue-200 bg-blue-50/40 shadow-sm"
          : "border-slate-200/80 bg-white hover:border-[#1565d8]/25 hover:shadow-md"
      )}
    >
      <div className="flex gap-3">
        {Icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              checked ? "bg-[#1565d8] text-white" : "bg-blue-50 text-[#1565d8]"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <div>
          <p className="text-sm font-semibold text-[#0b1f3a]">{label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <span
        role="switch"
        aria-checked={checked}
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
      </span>
    </button>
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
        "flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        disabled && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0b1f3a]">{label}</p>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        onClick={onClick}
        disabled={disabled}
      >
        {actionLabel}
      </Button>
    </div>
  );
}

function AutoPrintFeatureCard({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 transition sm:p-6",
        enabled
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-md shadow-emerald-100/60"
          : "border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50"
      )}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#1565d8]/10 blur-2xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm",
              enabled
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                : "bg-gradient-to-br from-[#1565d8] to-[#0A84FF] text-white"
            )}
          >
            <Printer className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-extrabold text-[#0b1f3a]">
                Auto-print Receipt
              </h3>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  enabled
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-400 text-white"
                )}
              >
                {enabled ? "ON" : "OFF"}
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-600">
              After a successful DMT / DMT3 / AEPS / UPI ATM transaction, the
              print dialog opens automatically so you can give the customer a
              receipt without extra clicks.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#1565d8]" />
                Works on success receipts in the portal
              </li>
              <li className="flex items-center gap-2">
                <Receipt className="h-3.5 w-3.5 text-[#1565d8]" />
                You can still print or download PDF manually anytime
              </li>
            </ul>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 self-start sm:mt-1">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? "Auto-print is ON" : "Auto-print is OFF"}
            onClick={() => onChange(!enabled)}
            className={cn(
              "relative flex h-11 w-[88px] items-center rounded-full border-2 px-1.5 shadow-inner transition-all",
              enabled
                ? "border-emerald-600 bg-emerald-500"
                : "border-slate-400 bg-slate-300"
            )}
          >
            <span
              className={cn(
                "absolute text-[11px] font-extrabold tracking-wide text-white",
                enabled ? "left-2.5" : "right-2.5"
              )}
            >
              {enabled ? "ON" : "OFF"}
            </span>
            <span
              className={cn(
                "relative z-10 h-8 w-8 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200",
                enabled ? "translate-x-[44px]" : "translate-x-0"
              )}
            />
          </button>
          <p
            className={cn(
              "text-xs font-bold",
              enabled ? "text-emerald-700" : "text-slate-500"
            )}
          >
            {enabled ? "Currently ON" : "Currently OFF"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RetailerSettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("portal");
  const [settings, setSettings] = useState<RetailerSettings>(
    DEFAULT_RETAILER_SETTINGS
  );
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(readRetailerSettings());
  }, []);

  const updateSetting = <K extends keyof RetailerSettings>(
    key: K,
    value: RetailerSettings[K]
  ) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      writeRetailerSettings(next);
      return next;
    });
    setSaved(true);
    if (key === "autoPrintReceipt") {
      toast.success(
        value
          ? "Auto-print receipt enabled"
          : "Auto-print receipt turned off"
      );
    }
  };

  const saveSettings = () => {
    writeRetailerSettings(settings);
    setSaved(true);
    toast.success("Settings saved successfully.");
  };

  return (
    <div className="mx-auto min-w-0 max-w-5xl space-y-6">
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
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200/80">
                Retailer Portal
              </p>
              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1 max-w-xl text-sm text-blue-100/80">
                Notifications, security, and receipt preferences — simple and
                quick to manage.
              </p>
            </div>
          </div>
          <Button
            onClick={saveSettings}
            className="shrink-0 rounded-xl bg-white text-[#001F5B] hover:bg-blue-50"
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

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <motion.nav
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-row gap-2 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible"
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
          className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
          <AnimatePresence mode="wait">
            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                <div className="mb-3">
                  <h2 className="text-lg font-bold text-[#001F5B]">
                    Notifications
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose what alerts you want to receive
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
                  description="OTP and transaction confirmations on registered mobile"
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
                className="space-y-3"
              >
                <div className="mb-3">
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
                  actionLabel="Coming soon"
                  disabled
                />
                <SecurityAction
                  icon={Smartphone}
                  label="Active Sessions"
                  description="View and manage logged-in devices"
                  actionLabel="Coming soon"
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
                className="space-y-5"
              >
                <div>
                  <h2 className="text-lg font-bold text-[#001F5B]">
                    Receipts & Portal
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Make everyday work faster at your shop counter
                  </p>
                </div>

                <AutoPrintFeatureCard
                  enabled={settings.autoPrintReceipt}
                  onChange={(v) => updateSetting("autoPrintReceipt", v)}
                />

                <SettingToggle
                  icon={Monitor}
                  label="Compact Sidebar"
                  description="Narrower sidebar with icons on desktop"
                  checked={settings.compactSidebar}
                  onChange={(v) => updateSetting("compactSidebar", v)}
                />

                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-[#0b1f3a]">
                    <Globe className="h-4 w-4 text-[#1565d8]" />
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting("language", e.target.value)}
                    className="mt-2 h-11 w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1565d8]"
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
