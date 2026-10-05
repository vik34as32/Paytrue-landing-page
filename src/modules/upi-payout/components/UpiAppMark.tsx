"use client";

import { AtSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectUpiApp } from "../lib/upi-payout-normalizers";

export default function UpiAppMark({
  vpa,
  size = "md",
  className,
}: {
  vpa: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const app = detectUpiApp(vpa);
  const box = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";
  const initials = app
    ? app.name
        .replace(/^@/, "")
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-extrabold text-white shadow-sm ring-1 ring-white/30",
        app?.tone ?? "from-slate-400 to-slate-600",
        box,
        className
      )}
      title={app?.name}
    >
      {initials || <AtSign className="h-1/2 w-1/2" />}
    </span>
  );
}
