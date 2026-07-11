"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReferenceCopyCellProps {
  value: string;
  className?: string;
}

export default function ReferenceCopyCell({
  value,
  className,
}: ReferenceCopyCellProps) {
  if (!value) {
    return <span className="text-slate-400">—</span>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Reference copied");
    } catch {
      toast.error("Could not copy reference");
    }
  };

  return (
    <div className={cn("flex min-w-0 items-start gap-1", className)}>
      <span className="min-w-0 break-all font-mono text-xs font-medium leading-snug text-[#1565d8]">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-slate-500 hover:text-[#1565d8]"
        onClick={() => void handleCopy()}
        title="Copy reference"
      >
        <Copy className="h-3.5 w-3.5" />
        <span className="sr-only">Copy reference</span>
      </Button>
    </div>
  );
}
