"use client";

import { motion } from "framer-motion";
import { Eye, FileImage } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resolveStatusBadge } from "@/src/lib/profileUtils";

export const profileFadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export const profileStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export function ProfileStatusBadge({ status }) {
  const badge = resolveStatusBadge(status);
  return <Badge variant={badge.variant}>{badge.label}</Badge>;
}

export function ProfileDetailItem({ label, value, mono = false }) {
  return (
    <motion.div
      variants={profileFadeUp}
      className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition hover:border-[#1565d8]/20 hover:shadow-md"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-[#0b1f3a] ${mono ? "font-mono" : ""}`}
      >
        {value !== undefined && value !== null && String(value).trim()
          ? String(value)
          : "—"}
      </p>
    </motion.div>
  );
}

export function ProfileSectionCard({
  icon: Icon,
  iconClass,
  title,
  description,
  badge,
  children,
  className = "",
}) {
  return (
    <motion.div variants={profileFadeUp} className={className}>
      <Card className="h-full overflow-hidden border-slate-100 shadow-sm">
        <CardHeader className="border-b border-slate-50 bg-slate-50/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            {badge}
          </div>
        </CardHeader>
        <CardContent className="pt-5">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function ProfileStatCard({ icon: Icon, label, value, tone, delay = 0 }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
    >
      <div className={`h-1 bg-gradient-to-r ${tone}`} />
      <div className="flex items-start gap-3 p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-bold text-[#0b1f3a]">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function ProfileDocumentCard({ label, subtitle, url, onPreview, index = 0 }) {
  return (
    <motion.div
      variants={profileFadeUp}
      custom={index}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-[#1565d8]/35 hover:shadow-lg"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-2.5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#1565d8]">
          {label}
        </p>
        {subtitle ? <p className="text-[11px] text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="relative aspect-[1.58/1] bg-gradient-to-br from-slate-100 to-slate-50">
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onPreview(url, label)}
              className="absolute inset-0 flex items-center justify-center bg-[#0b1f3a]/0 opacity-0 transition group-hover:bg-[#0b1f3a]/45 group-hover:opacity-100"
              aria-label={`View ${label}`}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0b1f3a] shadow-lg">
                <Eye className="h-3.5 w-3.5" />
                View Full
              </span>
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
            <FileImage className="h-8 w-8 opacity-40" />
            <p className="text-xs font-medium">Not uploaded</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ProfileHeroMetric({ label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-sm"
    >
      <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100/70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </motion.div>
  );
}
