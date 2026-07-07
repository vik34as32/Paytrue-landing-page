"use client";

import { RefreshCw, Wifi, WifiOff, Fingerprint, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatRdDeviceSubtitle } from "@/src/lib/rdService";
import type { RdServiceStatus } from "@/src/types/aeps";

interface DeviceStatusCardProps {
  status: RdServiceStatus;
  isChecking?: boolean;
  onRefresh?: () => void | Promise<unknown>;
}

function yesNo(value: boolean | undefined, pending: boolean): string {
  if (pending) return "Checking...";
  return value ? "Yes" : "No";
}

function StatusRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span
        className={cn(
          "min-w-0 break-all text-right font-medium",
          ok === true && "text-emerald-600",
          ok === false && "text-rose-600",
          ok === undefined && "text-slate-800"
        )}
      >
        {value || "—"}
      </span>
    </div>
  );
}

export default function DeviceStatusCard({
  status,
  isChecking = false,
  onRefresh,
}: DeviceStatusCardProps) {
  const pending = isChecking && !status.lastCheckedAt;
  const communicated = Boolean(status.lastCheckedAt) && status.isRunning;

  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-4 w-4 shrink-0 text-[#1565d8]" />
              Device Status
            </CardTitle>
            <CardDescription className="break-words text-xs leading-relaxed">
              {formatRdDeviceSubtitle(status)}
            </CardDescription>
          </div>
          {onRefresh ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isChecking}
            >
              <RefreshCw
                className={cn("mr-1 h-3.5 w-3.5", isChecking && "animate-spin")}
              />
              Refresh
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {status.baseUrl ? (
          <p className="break-all rounded-md bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-500">
            {status.baseUrl}
          </p>
        ) : null}

        <StatusRow
          label="RD Service Running"
          value={yesNo(status.isRunning, pending)}
          ok={communicated ? status.isRunning : undefined}
        />
        <StatusRow
          label="Device Connected"
          value={
            communicated || status.deviceConnected
              ? yesNo(status.deviceConnected, pending)
              : pending
                ? "Checking..."
                : "No"
          }
          ok={
            communicated
              ? status.deviceConnected
              : status.deviceConnected
                ? true
                : pending
                  ? undefined
                  : false
          }
        />
        <StatusRow
          label="Device Ready"
          value={
            communicated || status.deviceReady
              ? yesNo(status.deviceReady, pending)
              : pending
                ? "Checking..."
                : "No"
          }
          ok={
            communicated
              ? status.deviceReady
              : status.deviceReady
                ? true
                : pending
                  ? undefined
                  : false
          }
        />
        <StatusRow
          label="Scanner Model"
          value={communicated ? status.scannerModel || "—" : pending ? "..." : "—"}
        />
        <StatusRow
          label="Scanner Serial Number"
          value={
            communicated ? status.scannerSerialNumber || "—" : pending ? "..." : "—"
          }
        />
        <StatusRow
          label="RD Version"
          value={communicated ? status.rdVersion || "—" : pending ? "..." : "—"}
        />

        {status.error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {status.error}
          </div>
        ) : status.isRunning ? (
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            <Fingerprint className="h-3.5 w-3.5" />
            {status.deviceReady
              ? "Scanner ready for fingerprint capture"
              : "RD Service found — capture will be attempted on submit"}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {status.isRunning ? (
              <WifiOff className="h-3.5 w-3.5" />
            ) : (
              <Wifi className="h-3.5 w-3.5" />
            )}
            Connect Mantra device and ensure RD Service is running
          </div>
        )}
      </CardContent>
    </Card>
  );
}
