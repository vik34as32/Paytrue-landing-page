"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { validateBankVerifyInputs } from "@/src/lib/dmtBankVerify";
import type { VerifyBankAccountResponse } from "@/src/types/dmt";

type VerifyFn = (input: {
  accountNumber: string;
  ifscCode: string;
  name?: string;
}) => Promise<VerifyBankAccountResponse>;

export function useBankAccountVerification({
  accountNumber,
  ifscCode,
  name,
  verifyFn,
  onVerified,
}: {
  accountNumber: string;
  ifscCode: string;
  name?: string;
  verifyFn: VerifyFn;
  onVerified?: (result: VerifyBankAccountResponse) => void;
}) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [holderName, setHolderName] = useState<string | null>(null);
  const [nameMatchPercent, setNameMatchPercent] = useState<number | null>(null);
  const lastVerifiedKeyRef = useRef("");

  const verificationKey = `${accountNumber.trim()}|${ifscCode.trim().toUpperCase()}`;

  useEffect(() => {
    if (lastVerifiedKeyRef.current && verificationKey !== lastVerifiedKeyRef.current) {
      setVerified(false);
      setHolderName(null);
      setNameMatchPercent(null);
      lastVerifiedKeyRef.current = "";
    }
  }, [verificationKey]);

  const verify = useCallback(async () => {
    const validationError = validateBankVerifyInputs({ accountNumber, ifscCode });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyFn({
        accountNumber: accountNumber.trim(),
        ifscCode: ifscCode.trim().toUpperCase(),
        name: name?.trim() || undefined,
      });

      if (!result.verified) {
        setVerified(false);
        setHolderName(null);
        setNameMatchPercent(null);
        lastVerifiedKeyRef.current = "";
        toast.error(result.status || "Bank account verification failed");
        return;
      }

      const accountHolder = result.payee?.name?.trim() || null;
      setVerified(true);
      setHolderName(accountHolder);
      setNameMatchPercent(
        result.payee?.nameMatchPercent === null || result.payee?.nameMatchPercent === undefined
          ? null
          : result.payee.nameMatchPercent
      );
      lastVerifiedKeyRef.current = verificationKey;
      onVerified?.(result);

      if (accountHolder) {
        const matchText =
          result.payee?.nameMatchPercent != null
            ? ` (${result.payee.nameMatchPercent}% name match)`
            : "";
        toast.success(`Verified: ${accountHolder}${matchText}`);
      } else {
        toast.success("Bank account verified successfully");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Bank account verification failed";
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  }, [accountNumber, ifscCode, name, onVerified, verificationKey, verifyFn]);

  return {
    verify,
    verifying,
    verified,
    holderName,
    nameMatchPercent,
  };
}
