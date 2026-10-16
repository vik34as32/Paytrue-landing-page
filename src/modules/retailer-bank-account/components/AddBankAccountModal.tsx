"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Info, Landmark, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankLogo } from "@/components/retailer/BankLogo";
import { useIfscLookup } from "@/src/hooks/useIfscLookup";
import { getCurrentLocation } from "@/src/lib/rdService";
import { isValidIfscCode } from "@/src/types/ifsc";
import { addRetailerBankAccount, retailerBankAccountErrorMessage } from "../api";
import type { AddRetailerBankAccountResult } from "../types";

const ACCOUNT_PATTERN = /^\d{9,18}$/;

interface AddBankAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasExistingAccount: boolean;
  onCompleted: (result: AddRetailerBankAccountResult | null) => void;
}

interface FieldErrors {
  account?: string;
  confirm?: string;
  ifsc?: string;
}

function validate(account: string, confirm: string, ifsc: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!ACCOUNT_PATTERN.test(account)) errors.account = "Bank account number must be 9 to 18 digits";
  if (!confirm) errors.confirm = "Re-enter the bank account number";
  else if (account !== confirm) errors.confirm = "Bank account numbers do not match";
  if (!isValidIfscCode(ifsc)) errors.ifsc = "Enter a valid 11-character IFSC code";
  return errors;
}

function AddBankAccountForm({
  hasExistingAccount,
  onClose,
  onCompleted,
}: {
  hasExistingAccount: boolean;
  onClose: () => void;
  onCompleted: AddBankAccountModalProps["onCompleted"];
}) {
  const [account, setAccount] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"idle" | "locating" | "submitting">("idle");

  const ifscLookup = useIfscLookup(ifsc);
  const ifscDetails = ifscLookup.data;
  const busy = stage !== "idle";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const nextErrors = validate(account, confirm, ifsc);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError("");
    setStage("locating");
    let location: { latitude: string; longitude: string };
    try {
      location = await getCurrentLocation();
    } catch (locationError) {
      setStage("idle");
      setError(locationError instanceof Error ? locationError.message : "Unable to fetch current location.");
      return;
    }

    setStage("submitting");
    try {
      const result = await addRetailerBankAccount({
        bankAccountNo: account,
        confirmBankAccountNo: confirm,
        bankIfsc: ifsc,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      if (result.linked) {
        toast.success(result.message || "Bank account linked successfully");
      } else if (result.pending) {
        toast.info(result.message || "Bank account confirmation is pending. Please check again later.");
      } else {
        toast.info(result.message);
      }
      onCompleted(result);
      onClose();
    } catch (submitError) {
      setError(retailerBankAccountErrorMessage(submitError));
      onCompleted(null);
    } finally {
      setStage("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {hasExistingAccount ? (
        <div className="flex gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Adding a new account will replace your currently linked bank account.</span>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="rba-account">Bank account number</Label>
        <Input
          id="rba-account"
          value={account}
          inputMode="numeric"
          autoComplete="off"
          maxLength={18}
          disabled={busy}
          placeholder="Enter account number"
          onChange={(event) => setAccount(event.target.value.replace(/\D/g, ""))}
          className="h-11 rounded-xl"
        />
        {fieldErrors.account ? <p className="text-xs text-red-600">{fieldErrors.account}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rba-confirm">Confirm bank account number</Label>
        <Input
          id="rba-confirm"
          value={confirm}
          inputMode="numeric"
          autoComplete="off"
          maxLength={18}
          disabled={busy}
          placeholder="Re-enter account number"
          onPaste={(event) => event.preventDefault()}
          onChange={(event) => setConfirm(event.target.value.replace(/\D/g, ""))}
          className="h-11 rounded-xl"
        />
        {fieldErrors.confirm ? <p className="text-xs text-red-600">{fieldErrors.confirm}</p> : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rba-ifsc">IFSC code</Label>
        <Input
          id="rba-ifsc"
          value={ifsc}
          autoComplete="off"
          maxLength={11}
          disabled={busy}
          placeholder="e.g. SBIN0001234"
          onChange={(event) => setIfsc(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
          className="h-11 rounded-xl uppercase"
        />
        {fieldErrors.ifsc ? <p className="text-xs text-red-600">{fieldErrors.ifsc}</p> : null}

        {isValidIfscCode(ifsc) ? (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {ifscLookup.isLoading ? (
              <span className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking IFSC...
              </span>
            ) : ifscDetails ? (
              <>
                <BankLogo
                  bank={{ name: ifscDetails.BANK || ifsc.slice(0, 4), ifscPrefix: ifsc.slice(0, 4) }}
                  size={32}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">{ifscDetails.BANK}</p>
                  <p className="truncate text-xs text-slate-500">
                    {[ifscDetails.BRANCH, ifscDetails.CITY].filter(Boolean).join(", ")}
                  </p>
                </div>
              </>
            ) : (
              <span className="text-xs text-amber-700">
                Bank details for this IFSC could not be found. Please double-check the code.
              </span>
            )}
          </div>
        ) : null}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        Your current location is required to link the bank account.
      </p>

      {error ? (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" disabled={busy} onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {stage === "locating" ? "Fetching location..." : "Linking account..."}
            </>
          ) : (
            "Add Bank Account"
          )}
        </Button>
      </div>
    </form>
  );
}

export default function AddBankAccountModal({
  open,
  onOpenChange,
  hasExistingAccount,
  onCompleted,
}: AddBankAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1565d8] to-[#0b4fb3] text-white">
              <Landmark className="h-5 w-5" />
            </span>
            <div className="text-left">
              <DialogTitle className="text-lg">Add Bank Account</DialogTitle>
              <DialogDescription>Link your own bank account for settlements.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {open ? (
          <AddBankAccountForm
            hasExistingAccount={hasExistingAccount}
            onClose={() => onOpenChange(false)}
            onCompleted={onCompleted}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
