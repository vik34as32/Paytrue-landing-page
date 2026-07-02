"use client";

import { memo, useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizeBankOption, resolveBankLogoPath } from "@/src/lib/bankLogos";
import type { BankApiInput, BankOption } from "@/types/bank";

interface BankLogoProps {
  bank: BankApiInput | BankOption | string;
  size?: number;
  className?: string;
}

function BankLogoComponent({
  bank,
  size = 28,
  className,
}: BankLogoProps) {
  const normalized = normalizeBankOption(bank);
  const logoPath = normalized.logo || resolveBankLogoPath(normalized);
  const [hasError, setHasError] = useState(false);

  if (!logoPath || hasError) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-[#0057D9]",
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Building2 className="h-[55%] w-[55%]" />
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
      className={cn("shrink-0 rounded-md object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

export const BankLogo = memo(BankLogoComponent);

interface BankOptionLabelProps {
  bank: BankApiInput | BankOption | string;
  logoSize?: number;
  className?: string;
  showShortName?: boolean;
}

export function BankOptionLabel({
  bank,
  logoSize = 28,
  className,
  showShortName = false,
}: BankOptionLabelProps) {
  const normalized = normalizeBankOption(bank);

  return (
    <span className={cn("flex min-w-0 items-center gap-3", className)}>
      <BankLogo bank={normalized} size={logoSize} />
      <span className="min-w-0 truncate text-base font-medium text-slate-800">
        {showShortName ? normalized.shortName : normalized.name}
      </span>
    </span>
  );
}
