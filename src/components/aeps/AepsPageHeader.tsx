"use client";

import type { ReactNode } from "react";

interface AepsPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function AepsPageHeader({
  title,
  description,
  actions,
}: AepsPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0b1f3a]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
