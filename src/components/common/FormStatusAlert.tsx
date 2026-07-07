"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FormStatusVariant = "success" | "error" | "warning" | "info";

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    container:
      "border-emerald-200/80 bg-emerald-50 text-emerald-950 shadow-emerald-100/50",
    iconColor: "text-emerald-600",
    defaultTitle: "Success",
  },
  error: {
    icon: AlertCircle,
    container: "border-rose-200/80 bg-rose-50 text-rose-950 shadow-rose-100/50",
    iconColor: "text-rose-600",
    defaultTitle: "Unable to proceed",
  },
  warning: {
    icon: AlertTriangle,
    container:
      "border-amber-200/80 bg-amber-50 text-amber-950 shadow-amber-100/50",
    iconColor: "text-amber-600",
    defaultTitle: "Action required",
  },
  info: {
    icon: Info,
    container: "border-blue-200/80 bg-blue-50 text-blue-950 shadow-blue-100/50",
    iconColor: "text-blue-600",
    defaultTitle: "Information",
  },
} as const;

export interface FormStatusAlertProps {
  variant: FormStatusVariant;
  message: string;
  title?: string;
  className?: string;
  onDismiss?: () => void;
}

export default function FormStatusAlert({
  variant,
  message,
  title,
  className,
  onDismiss,
}: FormStatusAlertProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3.5 shadow-sm",
        "animate-in fade-in slide-in-from-top-1 duration-200",
        config.container,
        className
      )}
    >
      <Icon
        className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconColor)}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{displayTitle}</p>
        <p className="mt-0.5 text-sm leading-relaxed opacity-90">{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export function isFormErrorVariant(variant: FormStatusVariant) {
  return variant === "error" || variant === "warning";
}
