"use client";

import { CheckCircle2 } from "lucide-react";
import { AnimatedMpinInput } from "./AnimatedMpinInput";
import { isValidMpin } from "../schemas";

interface CreateNewMpinStepProps {
  newMpin: string;
  confirmMpin: string;
  onNewChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  newError?: string;
  confirmError?: string;
  disabled?: boolean;
}

export function CreateNewMpinStep({
  newMpin,
  confirmMpin,
  onNewChange,
  onConfirmChange,
  newError,
  confirmError,
  disabled,
}: CreateNewMpinStepProps) {
  const matching =
    isValidMpin(newMpin) &&
    isValidMpin(confirmMpin) &&
    newMpin === confirmMpin &&
    !confirmError;

  return (
    <div className="space-y-2.5">
      <div>
        <h3 className="text-[15px] font-bold text-[#001F5B]">Create new MPIN</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Set a new 4 digit MPIN different from your current one.
        </p>
      </div>

      <AnimatedMpinInput
        label="New MPIN"
        value={newMpin}
        onChange={onNewChange}
        autoFocus
        disabled={disabled}
        error={newError}
        hint="Avoid sequences like 1234"
      />

      <AnimatedMpinInput
        label="Confirm MPIN"
        value={confirmMpin}
        onChange={onConfirmChange}
        disabled={disabled}
        error={confirmError}
        success={matching}
        hint={matching ? undefined : "Re-enter new MPIN"}
      />

      <div className="h-8">
        {matching ? (
          <div className="flex h-8 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            New MPIN confirmed — ready to update
          </div>
        ) : null}
      </div>
    </div>
  );
}
