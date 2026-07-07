"use client";

import { motion } from "framer-motion";
import { BellRing, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NEWS_ITEMS, PORTAL_NOTICES } from "@/features/retailer/constants";
import RetailerPageHeader from "@/components/retailer/RetailerPageHeader";

const typeConfig = {
  success: {
    icon: CheckCircle2,
    badge: "Success",
    accent: "border-emerald-200 bg-emerald-50/60",
    iconColor: "text-emerald-600",
  },
  info: {
    icon: Info,
    badge: "Info",
    accent: "border-blue-200 bg-blue-50/60",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    badge: "Important",
    accent: "border-amber-200 bg-amber-50/60",
    iconColor: "text-amber-600",
  },
} as const;

export default function NoticesView() {
  const allNotices = [
    ...PORTAL_NOTICES,
    ...NEWS_ITEMS.map((item) => ({
      id: item.id,
      title: "Announcement",
      message: item.message,
      date: new Date().toISOString().slice(0, 10),
      type: item.type,
    })),
  ];

  return (
    <div className="min-w-0 space-y-6">
      <RetailerPageHeader
        title="Notices & Updates"
        description="Stay informed about service updates, maintenance, and important announcements."
        icon={BellRing}
        iconClassName="from-sky-500 to-sky-700"
      />

      <Card>
        <CardHeader>
          <CardTitle>Latest Updates</CardTitle>
          <CardDescription>
            {allNotices.length} announcements from PayTrue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {allNotices.map((notice, index) => {
            const config = typeConfig[notice.type as keyof typeof typeConfig] ?? typeConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`rounded-xl border p-4 ${config.accent}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                    <Icon className={`h-4 w-4 ${config.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#0b1f3a]">
                        {notice.title}
                      </p>
                      <Badge variant="outline" className="text-[10px]">
                        {config.badge}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {notice.message}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(notice.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
