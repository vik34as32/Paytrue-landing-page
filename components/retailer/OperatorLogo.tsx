"use client";

import { useState } from "react";
import { RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  normalizeOperatorInput,
  resolveOperatorLogoPath,
  type OperatorInput,
  type OperatorServiceType,
} from "@/src/lib/operatorLogos";

interface OperatorLogoProps {
  operator: OperatorInput;
  serviceType: OperatorServiceType;
  size?: number;
  className?: string;
}

export default function OperatorLogo({
  operator,
  serviceType,
  size = 24,
  className,
}: OperatorLogoProps) {
  const normalized = normalizeOperatorInput(operator);
  const logoPath = resolveOperatorLogoPath(serviceType, normalized);
  const [hasError, setHasError] = useState(false);

  if (!logoPath || hasError) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500",
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <RadioTower className="h-[55%] w-[55%]" />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoPath}
      alt=""
      loading="lazy"
      decoding="async"
      width={size}
      height={size}
      onError={() => setHasError(true)}
      className={cn("shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

interface OperatorOptionLabelProps {
  operator: OperatorInput;
  serviceType: OperatorServiceType;
  logoSize?: number;
  className?: string;
}

export function OperatorOptionLabel({
  operator,
  serviceType,
  logoSize = 24,
  className,
}: OperatorOptionLabelProps) {
  const normalized = normalizeOperatorInput(operator);

  return (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <OperatorLogo
        operator={normalized}
        serviceType={serviceType}
        size={logoSize}
      />
      <span className="truncate">{normalized.name}</span>
    </span>
  );
}
