"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Copy, Gift, Share2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REFERRAL_BONUS_TIERS } from "@/features/retailer/constants";
import { selectUser } from "@/src/redux/slices/authSlice";
import { formatCurrency } from "@/lib/utils";
import RetailerPageHeader from "@/components/retailer/RetailerPageHeader";

function buildReferralCode(userId?: string | null) {
  const base = (userId || "PTRT000000").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `PTREF-${base.slice(-8).padStart(8, "0")}`;
}

export default function ReferEarnView() {
  const user = useSelector(selectUser);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const referralCode = useMemo(
    () => buildReferralCode(user?.userId || user?.retailerId || user?.id),
    [user]
  );

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/login?ref=${referralCode}`
      : `https://paytrue.co.in/auth/login?ref=${referralCode}`;

  const stats = {
    totalReferrals: 3,
    successful: 2,
    pending: 1,
    totalBonus: 1000,
  };

  const copyText = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(type === "code" ? "Referral code copied!" : "Referral link copied!");
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Could not copy. Please copy manually.");
    }
  };

  const shareReferral = async () => {
    const message = `Join PayTrue as a retailer using my referral code ${referralCode} and earn together! ${referralLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "PayTrue Refer & Earn",
          text: message,
          url: referralLink,
        });
        return;
      } catch {
        /* user cancelled */
      }
    }
    void copyText(message, "link");
  };

  return (
    <div className="min-w-0 space-y-6">
      <RetailerPageHeader
        title="Refer & Earn"
        description="Invite new retailers and earn bonus rewards on every successful referral."
        icon={Gift}
        iconClassName="from-fuchsia-500 to-pink-600"
        actions={
          <Button variant="outline" onClick={() => void shareReferral()}>
            <Share2 className="h-4 w-4" />
            Share Link
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Referrals", value: stats.totalReferrals, icon: Users },
          { label: "Successful", value: stats.successful, icon: Gift },
          { label: "Pending", value: stats.pending, icon: Users },
          {
            label: "Bonus Earned",
            value: formatCurrency(stats.totalBonus),
            icon: Wallet,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {stat.label}
              </p>
              <stat.icon className="h-4 w-4 text-[#1565d8]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#001F5B]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>
              Share this code when inviting new retailers to PayTrue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                readOnly
                value={referralCode}
                className="font-mono font-semibold text-[#001F5B]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => void copyText(referralCode, "code")}
                aria-label="Copy referral code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied === "code" && (
              <p className="text-xs font-medium text-emerald-600">Copied to clipboard!</p>
            )}

            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Referral Link
              </p>
              <div className="flex gap-2">
                <Input readOnly value={referralLink} className="text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => void copyText(referralLink, "link")}
                  aria-label="Copy referral link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bonus Structure</CardTitle>
            <CardDescription>
              Earn more as you refer more active retailers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {REFERRAL_BONUS_TIERS.map((tier, index) => (
              <motion.div
                key={tier.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-600">
                  {tier.label}
                </span>
                <span className="text-lg font-bold text-[#1565d8]">
                  {tier.unit}
                  {tier.amount.toLocaleString("en-IN")}
                </span>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              "Share your referral code or link with a new retailer.",
              "They register and complete KYC verification on PayTrue.",
              "You receive bonus credit in your wallet after approval.",
            ].map((step, index) => (
              <li
                key={step}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4 text-sm text-slate-600"
              >
                <span className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#1565d8] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <p className="mt-2 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
