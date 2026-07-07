"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useBiometricDevice } from "@/src/hooks/useBiometricDevice";
import { BIOMETRIC_DEVICE_OPTIONS } from "@/src/types/biometric";

interface DeviceSelectorProps {
  className?: string;
  disabled?: boolean;
}

export default function DeviceSelector({ className, disabled = false }: DeviceSelectorProps) {
  const { selectedDevice, changeDevice } = useBiometricDevice();

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-semibold text-slate-700">Device</Label>
      <div className="grid gap-2 sm:grid-cols-2">
        {BIOMETRIC_DEVICE_OPTIONS.map((option) => {
          const active = selectedDevice === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition",
                active
                  ? "border-[#1565d8] bg-blue-50 ring-1 ring-[#1565d8]/30"
                  : "border-slate-200 bg-white hover:border-slate-300",
                disabled && "pointer-events-none opacity-60"
              )}
            >
              <input
                type="radio"
                name="aeps-biometric-device"
                value={option.value}
                checked={active}
                disabled={disabled}
                onChange={() => changeDevice(option.value)}
                className="mt-1 h-4 w-4 accent-[#1565d8]"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-800">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
