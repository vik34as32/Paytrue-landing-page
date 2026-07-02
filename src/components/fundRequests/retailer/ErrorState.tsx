"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export default function ErrorState({
  message = "Unable to load fund requests. Please try again.",
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-base font-bold text-[#001F5B]">Something went wrong</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">{message}</p>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          className="mt-6 gap-2"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw className={retrying ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {retrying ? "Retrying..." : "Retry"}
        </Button>
      )}
    </div>
  );
}
