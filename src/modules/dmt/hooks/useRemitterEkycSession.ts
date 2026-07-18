"use client";

import { useCallback, useRef } from "react";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  clearEkycSession,
  selectDmtEkycSession,
  setEkycPidOptions,
} from "@/src/modules/dmt/redux/senderSlice";
import {
  useLazyFetchRemitterPidOptionsQuery,
  useSearchSenderMutation,
} from "@/src/modules/dmt/redux/dmtApi";
import {
  clearSenderPidOptionWadh,
  clearSenderReferenceKey as clearPersistedSenderReferenceKey,
  setSenderPidOptionWadh as persistSenderPidOptionWadh,
  setSenderReferenceKey as persistSenderReferenceKey,
} from "@/src/lib/dmtSession";
import { buildRdPidOptionsXml } from "@/src/lib/biometric/pidOptions";
import type { AppDispatch } from "@/src/redux/types";

export type EnsureEkycSessionOptions = {
  /** Force reload of pidOptions only — never overwrites verify-otp referenceKey */
  force?: boolean;
};

/**
 * InstantPay eKYC session:
 * - Prefer locked verify-otp referenceKey for RD + eKYC
 * - checkRemitter may refresh pidOptions/wadh only
 * - Never replace verify-otp key with RNF checkRemitter key
 */
export function useRemitterEkycSession() {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector(selectDmtEkycSession, shallowEqual);
  const [searchSender] = useSearchSenderMutation();
  const [fetchPidOptions] = useLazyFetchRemitterPidOptionsQuery();
  const inFlightRef = useRef<Promise<{
    referenceKey: string;
    pidOptions: string;
    pidOptionWadh: string;
  }> | null>(null);
  const inFlightMobileRef = useRef<string>("");

  const ensureSession = useCallback(
    async (mobile: string, options: EnsureEkycSessionOptions = {}) => {
      const normalized = String(mobile || "").trim();
      if (!normalized) {
        throw new Error("Remitter mobile is required for remitter profile.");
      }

      if (
        !options.force &&
        session.isActive &&
        session.mobile === normalized &&
        session.referenceKey &&
        session.pidOptions
      ) {
        return {
          referenceKey: session.referenceKey,
          pidOptions: session.pidOptions,
          pidOptionWadh: session.pidOptionWadh,
        };
      }

      // verify-otp key already locked with pidOptions — reuse
      if (
        !options.force &&
        session.isVerifyOtpLocked &&
        session.mobile === normalized &&
        session.referenceKey &&
        session.pidOptions
      ) {
        return {
          referenceKey: session.referenceKey,
          pidOptions: session.pidOptions,
          pidOptionWadh: session.pidOptionWadh,
        };
      }

      if (
        inFlightRef.current &&
        inFlightMobileRef.current === normalized &&
        !options.force
      ) {
        return inFlightRef.current;
      }

      inFlightMobileRef.current = normalized;
      inFlightRef.current = (async () => {
        const lockedVerifyKey =
          session.isVerifyOtpLocked && session.mobile === normalized
            ? String(session.referenceKey || "").trim()
            : "";

        const check = await searchSender({ mobile: normalized }).unwrap();

        let checkKey = String(check.referenceKey || "").trim();
        let pidOptionWadh = String(check.pidOptionWadh || "").trim();
        let pidOptions = String(
          check.pidOptions ||
            (pidOptionWadh ? buildRdPidOptionsXml({ wadh: pidOptionWadh }) : "")
        ).trim();

        if (lockedVerifyKey && checkKey && checkKey !== lockedVerifyKey) {
          // eslint-disable-next-line no-console -- InstantPay eKYC referenceKey debug
          console.log("WARNING:");
          // eslint-disable-next-line no-console
          console.log(
            "Ignoring checkRemitter referenceKey because verify referenceKey already exists."
          );
          // eslint-disable-next-line no-console
          console.log("");
          // eslint-disable-next-line no-console
          console.log("Old Verify Key:", lockedVerifyKey);
          // eslint-disable-next-line no-console
          console.log("Incoming RNF Key:", checkKey);
        }

        if (!pidOptions) {
          const pid = await fetchPidOptions({ mobile: normalized }, false).unwrap();
          if (!pidOptionWadh) pidOptionWadh = String(pid.pidOptionWadh || "").trim();
          if (!checkKey) checkKey = String(pid.referenceKey || "").trim();
          pidOptions = String(
            pid.pidOptions ||
              (pidOptionWadh ? buildRdPidOptionsXml({ wadh: pidOptionWadh }) : "")
          ).trim();
        }

        const referenceKey = lockedVerifyKey || checkKey;

        if (!referenceKey || !pidOptions) {
          throw new Error(
            "eKYC referenceKey / pidOptions missing. Complete verify-otp first."
          );
        }

        dispatch(
          setEkycPidOptions({
            mobile: normalized,
            referenceKey,
            pidOptions,
            pidOptionWadh: pidOptionWadh || undefined,
            force: options.force,
            source: lockedVerifyKey ? "verify-otp" : "check-remitter",
          })
        );
        persistSenderReferenceKey(referenceKey);
        if (pidOptionWadh) persistSenderPidOptionWadh(pidOptionWadh);

        return { referenceKey, pidOptions, pidOptionWadh };
      })().finally(() => {
        inFlightRef.current = null;
        inFlightMobileRef.current = "";
      });

      return inFlightRef.current;
    },
    [dispatch, fetchPidOptions, searchSender, session]
  );

  const clearSession = useCallback(() => {
    inFlightRef.current = null;
    inFlightMobileRef.current = "";
    dispatch(clearEkycSession());
    clearPersistedSenderReferenceKey();
    clearSenderPidOptionWadh();
  }, [dispatch]);

  return {
    session,
    ensureSession,
    clearSession,
  };
}

export default useRemitterEkycSession;
