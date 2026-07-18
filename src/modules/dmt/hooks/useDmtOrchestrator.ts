"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/src/redux/types";
import {
  applyWorkflowResponse,
  closeDialog,
  openDialog,
  resetWorkflowState,
  setWorkflowError,
  showSnackbar,
  startLoading,
  stopLoading,
} from "../redux/workflowSlice";
import {
  clearEkycSession,
  resetSenderState,
  setEkycPidOptions,
  setSenderMobile,
  setSenderProfile,
  setSenderReferenceKey,
  setVerifyOtpEkycReferenceKey,
} from "../redux/senderSlice";
import {
  resetBeneficiaryState,
  setBeneficiaries,
  setPendingBeneficiary,
  setSelectedBeneficiary,
} from "../redux/beneficiarySlice";
import {
  resetTransactionState,
  setTransactionDraft,
  setTransactionResult,
} from "../redux/transactionSlice";
import {
  clearSenderPidOptionWadh,
  clearSenderReferenceKey as clearPersistedSenderReferenceKey,
  getSenderReferenceKey,
  setActiveSenderMobile,
  setSenderPidOptionWadh as persistSenderPidOptionWadh,
  setSenderReferenceKey as persistSenderReferenceKey,
} from "@/src/lib/dmtSession";
import { getCurrentLocation } from "@/src/lib/rdService";
import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import { codeToNextAction, ensureTransferSuccessResponse } from "../services/normalizers";
import {
  buildRdPidOptionsXml,
  logEkycDebug,
} from "@/src/lib/biometric/pidOptions";
import {
  useAddBeneficiaryMutation,
  useBioAuthMutation,
  useDeleteBeneficiaryMutation,
  useFetchBeneficiariesQuery,
  useGenerateTransactionOtpMutation,
  useLazyFetchRemitterPidOptionsQuery,
  useLazyFetchRemitterProfileQuery,
  useRegisterSenderMutation,
  useSearchSenderMutation,
  useTransferMutation,
  useVerifyBeneficiaryDeleteMutation,
  useVerifyBeneficiaryOtpMutation,
  useVerifySenderOtpMutation,
  useVerifyTransactionOtpMutation,
} from "../redux/dmtApi";
import type {
  AddBeneficiaryRequest,
  BioAuthRequest,
  DmtBeneficiary,
  DmtNextAction,
  DmtTransferMode,
  DmtWorkflowResponse,
  RegisterSenderRequest,
  TransferRequest,
  VerifyBeneficiaryOtpRequest,
  VerifySenderOtpRequest,
  VerifyTransactionOtpRequest,
} from "../types";
import { useStore } from "react-redux";
import type { RootState } from "@/src/redux/types";

function getErrorMessage(error: unknown): string {
  const err = error as { data?: { message?: string }; message?: string };
  return err?.data?.message || err?.message || "Request failed";
}

/** Backend signals that the active referenceKey must be refreshed */
function isEkycReferenceExpiredError(error: unknown): boolean {
  const err = error as {
    data?: { code?: string; message?: string; error?: string };
    code?: string;
    message?: string;
  };
  const code = String(err?.data?.code || err?.code || "").toUpperCase();
  const message = String(
    err?.data?.message || err?.data?.error || err?.message || ""
  ).toUpperCase();

  if (
    [
      "REFERENCE_KEY_EXPIRED",
      "REFERENCE_EXPIRED",
      "INVALID_REFERENCE_KEY",
      "EKYC_SESSION_EXPIRED",
      "PID_OPTIONS_EXPIRED",
    ].includes(code)
  ) {
    return true;
  }

  const compact = message.replace(/\s+/g, "");
  if (compact.includes("INVALIDREFERENCEKEY")) return true;

  return (
    message.includes("REFERENCEKEY") || message.includes("REFERENCE KEY")
      ? message.includes("EXPIRED") ||
        message.includes("INVALID") ||
        message.includes("REQUIRED")
      : false
  );
}

export function useDmtOrchestrator() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const sender = useAppSelector((state) => state.dmtSender);
  const beneficiary = useAppSelector((state) => state.dmtBeneficiary);
  const transaction = useAppSelector((state) => state.dmtTransaction);
  const workflow = useAppSelector((state) => state.dmtWorkflow);

  const [searchSenderMutation] = useSearchSenderMutation();
  const [registerSenderMutation] = useRegisterSenderMutation();
  const [verifySenderOtpMutation] = useVerifySenderOtpMutation();
  const [bioAuthMutation] = useBioAuthMutation();
  const [fetchRemitterPidOptions] = useLazyFetchRemitterPidOptionsQuery();
  const [fetchRemitterProfile] = useLazyFetchRemitterProfileQuery();
  const [addBeneficiaryMutation] = useAddBeneficiaryMutation();
  const [verifyBeneficiaryOtpMutation] = useVerifyBeneficiaryOtpMutation();
  const [deleteBeneficiaryMutation] = useDeleteBeneficiaryMutation();
  const [verifyBeneficiaryDeleteMutation] = useVerifyBeneficiaryDeleteMutation();
  const [generateTransactionOtpMutation] = useGenerateTransactionOtpMutation();
  const [verifyTransactionOtpMutation] = useVerifyTransactionOtpMutation();
  const [transferMutation] = useTransferMutation();

  const verifyContextRef = useRef<{ id: string; referenceKey: string } | null>(null);
  const deleteContextRef = useRef<{ id: string; referenceKey: string; name?: string } | null>(
    null
  );
  const transferContextRef = useRef<{
    beneficiaryId: string;
    amount: number;
    transferMode: DmtTransferMode;
    remarks?: string;
    referenceKey: string;
  } | null>(null);

  const beneficiariesQuery = useFetchBeneficiariesQuery(
    { senderMobile: sender.mobile },
    { skip: !sender.mobile, refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    if (beneficiariesQuery.data?.beneficiaries) {
      dispatch(setBeneficiaries(beneficiariesQuery.data.beneficiaries));
    }
  }, [beneficiariesQuery.data?.beneficiaries, dispatch]);

  const applyResponse = useCallback(
    (response: DmtWorkflowResponse) => {
      dispatch(applyWorkflowResponse(response));

      const latest = store.getState().dmtSender;
      const verifyLocked = latest.ekycReferenceKeySource === "verify-otp";
      const incomingKey = String(response.referenceKey || "").trim();

      // Never overwrite a locked verify-otp eKYC key with checkRemitter RNF keys
      if (incomingKey && !verifyLocked) {
        dispatch(setSenderReferenceKey(incomingKey));
        persistSenderReferenceKey(incomingKey);
      } else if (incomingKey && verifyLocked && incomingKey !== latest.ekycReferenceKey) {
        // eslint-disable-next-line no-console -- InstantPay eKYC referenceKey debug
        console.log("WARNING:");
        // eslint-disable-next-line no-console
        console.log(
          "Ignoring checkRemitter referenceKey because verify referenceKey already exists."
        );
        // eslint-disable-next-line no-console
        console.log("");
        // eslint-disable-next-line no-console
        console.log("Old Verify Key:", latest.ekycReferenceKey);
        // eslint-disable-next-line no-console
        console.log("Incoming RNF Key:", incomingKey);
      }

      if (response.pidOptionWadh) {
        persistSenderPidOptionWadh(response.pidOptionWadh);
      }
      if (response.sender) dispatch(setSenderProfile(response.sender));
      if (response.beneficiaries) dispatch(setBeneficiaries(response.beneficiaries));
      if (response.beneficiary) dispatch(setSelectedBeneficiary(response.beneficiary));
      if (response.transaction) dispatch(setTransactionResult(response.transaction));
      if (response.beneficiary?.id) {
        dispatch(
          setPendingBeneficiary({
            id: response.beneficiary.id,
            referenceKey: response.referenceKey,
          })
        );
      }

      // Seed eKYC materials when BIO_AUTH is next — preserve verify-otp key if locked
      const mobile = String(
        response.sender?.mobile || sender.mobile || ""
      ).trim();
      const referenceKey = verifyLocked
        ? latest.ekycReferenceKey
        : incomingKey;
      const pidOptionWadh = String(
        response.pidOptionWadh || response.sender?.pidOptionWadh || ""
      ).trim();
      const pidOptions = String(
        response.pidOptions ||
          (pidOptionWadh ? buildRdPidOptionsXml({ wadh: pidOptionWadh }) : "")
      ).trim();

      if (
        response.nextAction === "BIO_AUTH" &&
        mobile &&
        referenceKey &&
        pidOptions
      ) {
        dispatch(
          setEkycPidOptions({
            mobile,
            referenceKey,
            pidOptions,
            pidOptionWadh: pidOptionWadh || undefined,
            force: true,
            source: verifyLocked ? "verify-otp" : "check-remitter",
          })
        );
      }

      return response;
    },
    [dispatch, sender.mobile, store]
  );

  /**
   * After verify-otp: keep the verify referenceKey locked.
   * checkRemitter may supply pidOptions/wadh only — never replace the verify key.
   */
  const refreshEkycMaterialsAfterOtp = useCallback(
    async (
      mobile: string,
      preferredNextAction?: DmtNextAction | null,
      verifyReferenceKey?: string
    ): Promise<DmtWorkflowResponse> => {
      const normalized = String(mobile || "").trim();
      if (!normalized) {
        throw new Error("Remitter mobile is required after OTP verification.");
      }

      const lockedVerifyKey = String(verifyReferenceKey || "").trim();

      // 1) Remitter check — used for pidOptions/wadh only when verify key is locked
      const check = await searchSenderMutation({ mobile: normalized }).unwrap();

      let profileWadh = "";
      let profilePidOptions = "";
      try {
        const profile = await fetchRemitterProfile({ mobile: normalized }).unwrap();
        profileWadh = String(profile.pidOptionWadh || "").trim();
        profilePidOptions = String(profile.pidOptions || "").trim();
        const profileKey = String(profile.referenceKey || "").trim();
        if (
          lockedVerifyKey &&
          profileKey &&
          profileKey !== lockedVerifyKey
        ) {
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
          console.log("Incoming RNF Key:", profileKey);
        }
      } catch {
        // Profile GET is optional if check already returned materials
      }

      const checkKey = String(check.referenceKey || "").trim();
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

      // eKYC referenceKey = verify-otp key when present; otherwise fall back to check
      const activeReferenceKey = lockedVerifyKey || checkKey;

      let newPidOptionWadh = String(
        check.pidOptionWadh || profileWadh || ""
      ).trim();
      let newPidOptions = String(
        check.pidOptions ||
          profilePidOptions ||
          (newPidOptionWadh
            ? buildRdPidOptionsXml({ wadh: newPidOptionWadh })
            : "")
      ).trim();

      if (!newPidOptions) {
        const pid = await fetchRemitterPidOptions(
          { mobile: normalized },
          false
        ).unwrap();
        if (!newPidOptionWadh) {
          newPidOptionWadh = String(pid.pidOptionWadh || "").trim();
        }
        newPidOptions = String(
          pid.pidOptions ||
            (newPidOptionWadh
              ? buildRdPidOptionsXml({ wadh: newPidOptionWadh })
              : "")
        ).trim();
      }

      if (!activeReferenceKey) {
        throw new Error(
          "eKYC referenceKey missing after verify-otp. Cannot continue eKYC."
        );
      }
      if (!newPidOptions) {
        throw new Error(
          "Fresh pidOptions missing after OTP. Cannot capture biometrics."
        );
      }

      if (lockedVerifyKey) {
        dispatch(
          setVerifyOtpEkycReferenceKey({
            mobile: normalized,
            referenceKey: lockedVerifyKey,
          })
        );
      }

      dispatch(
        setEkycPidOptions({
          mobile: normalized,
          referenceKey: activeReferenceKey,
          pidOptions: newPidOptions,
          pidOptionWadh: newPidOptionWadh || undefined,
          force: true,
          source: lockedVerifyKey ? "verify-otp" : "check-remitter",
        })
      );
      persistSenderReferenceKey(activeReferenceKey);
      if (newPidOptionWadh) persistSenderPidOptionWadh(newPidOptionWadh);

      logEkycDebug({
        referenceKey: activeReferenceKey,
        pidLength: newPidOptions.length,
      });

      const nextAction: DmtNextAction | null =
        preferredNextAction || check.nextAction || "BIO_AUTH";

      return {
        ...check,
        success: true,
        // Surface the locked verify key to callers — not the RNF check key
        referenceKey: activeReferenceKey,
        pidOptionWadh: newPidOptionWadh || check.pidOptionWadh,
        pidOptions: newPidOptions,
        nextAction,
      };
    },
    [
      dispatch,
      fetchRemitterPidOptions,
      fetchRemitterProfile,
      searchSenderMutation,
    ]
  );

  const run = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      dispatch(startLoading());
      dispatch(setWorkflowError(null));
      try {
        return await fn();
      } catch (error) {
        dispatch(setWorkflowError(getErrorMessage(error)));
        return null;
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch]
  );

  const searchSender = useCallback(
    async (mobile: string) =>
      run(async () => {
        dispatch(setSenderMobile(mobile));
        setActiveSenderMobile(mobile);
        const response = await searchSenderMutation({ mobile }).unwrap();
        return applyResponse(response);
      }),
    [applyResponse, dispatch, run, searchSenderMutation]
  );

  const registerSender = useCallback(
    async (payload: RegisterSenderRequest) =>
      run(async () => {
        let referenceKey =
          payload.referenceKey || sender.referenceKey || getSenderReferenceKey();

        if (!referenceKey) {
          const check = await searchSenderMutation({
            mobile: payload.mobile,
          }).unwrap();
          referenceKey = check.referenceKey || getSenderReferenceKey();
          if (check.referenceKey) {
            dispatch(setSenderReferenceKey(check.referenceKey));
            persistSenderReferenceKey(check.referenceKey);
          }
        }

        if (!referenceKey) {
          throw new Error("Reference key missing. Please search sender again.");
        }

        const response = await registerSenderMutation({
          ...payload,
          referenceKey,
        }).unwrap();
        return applyResponse(response);
      }),
    [
      applyResponse,
      dispatch,
      registerSenderMutation,
      run,
      searchSenderMutation,
      sender.referenceKey,
    ]
  );

  const extractVerifyOtpReferenceKey = (otpResponse: DmtWorkflowResponse): string => {
    const data =
      otpResponse.data && typeof otpResponse.data === "object"
        ? (otpResponse.data as Record<string, unknown>)
        : {};
    return String(
      otpResponse.referenceKey ||
        data.referenceKey ||
        data.verifyReferenceKey ||
        (otpResponse as { verifyReferenceKey?: string }).verifyReferenceKey ||
        ""
    ).trim();
  };

  const verifySenderOtp = useCallback(
    async (payload: Omit<VerifySenderOtpRequest, "mobile"> & { otp: string }) =>
      run(async () => {
        const otpReferenceKey = String(
          payload.referenceKey || sender.referenceKey || getSenderReferenceKey() || ""
        ).trim();

        let otpNextAction: DmtNextAction | null = null;
        let verifyReferenceKey = "";

        try {
          const otpResponse = await verifySenderOtpMutation({
            mobile: sender.mobile,
            otp: payload.otp,
            referenceKey: otpReferenceKey || undefined,
          }).unwrap();
          otpNextAction = otpResponse.nextAction;
          verifyReferenceKey = extractVerifyOtpReferenceKey(otpResponse);

          if (verifyReferenceKey) {
            dispatch(
              setVerifyOtpEkycReferenceKey({
                mobile: sender.mobile,
                referenceKey: verifyReferenceKey,
              })
            );
            persistSenderReferenceKey(verifyReferenceKey);
          }
        } catch (error) {
          // OTP accepted but eKYC still required (KYC_REQUIRED, etc.)
          const code = String(
            (error as { code?: string; data?: { code?: string } })?.code ??
              (error as { data?: { code?: string } })?.data?.code ??
              ""
          ).toUpperCase();
          const action = codeToNextAction(code);
          if (!action) throw error;
          otpNextAction = action;

          // Some backends return the new key on the error payload
          const errData = (error as { data?: Record<string, unknown> })?.data;
          verifyReferenceKey = String(
            errData?.referenceKey ||
              errData?.verifyReferenceKey ||
              ""
          ).trim();
          if (verifyReferenceKey) {
            dispatch(
              setVerifyOtpEkycReferenceKey({
                mobile: sender.mobile,
                referenceKey: verifyReferenceKey,
              })
            );
            persistSenderReferenceKey(verifyReferenceKey);
          }
        }

        // Fetch pidOptions/wadh via checkRemitter — do NOT replace verify-otp key
        const refreshed = await refreshEkycMaterialsAfterOtp(
          sender.mobile,
          otpNextAction,
          verifyReferenceKey || store.getState().dmtSender.ekycReferenceKey
        );

        return applyResponse(refreshed);
      }),
    [
      applyResponse,
      dispatch,
      refreshEkycMaterialsAfterOtp,
      run,
      sender.mobile,
      sender.referenceKey,
      store,
      verifySenderOtpMutation,
    ]
  );

  const bioAuth = useCallback(
    async (payload: Omit<BioAuthRequest, "mobile">) =>
      run(async () => {
        const latest = store.getState().dmtSender;
        const ekycReferenceKey = String(
          latest.ekycReferenceKey ||
            payload.referenceKey ||
            latest.referenceKey ||
            ""
        ).trim();
        if (!ekycReferenceKey) {
          throw new Error(
            "eKYC referenceKey missing. Complete OTP so the verify-otp referenceKey can be saved."
          );
        }

        // eslint-disable-next-line no-console -- InstantPay eKYC referenceKey debug
        console.log("==================================");
        // eslint-disable-next-line no-console
        console.log("Before eKYC:");
        // eslint-disable-next-line no-console
        console.log("");
        // eslint-disable-next-line no-console
        console.log("ReferenceKey:", ekycReferenceKey);
        // eslint-disable-next-line no-console
        console.log("Source:", latest.ekycReferenceKeySource || "unknown");
        // eslint-disable-next-line no-console
        console.log("==================================");

        logEkycDebug({
          referenceKey: ekycReferenceKey,
          pidLength: payload.pidData?.length ?? 0,
        });

        try {
          const response = await bioAuthMutation({
            mobile: latest.mobile || sender.mobile,
            referenceKey: ekycReferenceKey,
            latitude: payload.latitude,
            longitude: payload.longitude,
            consentTaken: payload.consentTaken,
            captureType: payload.captureType,
            pidData: payload.pidData,
            externalRef: payload.externalRef,
          }).unwrap();

          dispatch(clearEkycSession());
          clearPersistedSenderReferenceKey();
          clearSenderPidOptionWadh();
          return applyResponse(response);
        } catch (error) {
          if (isEkycReferenceExpiredError(error)) {
            dispatch(clearEkycSession());
            clearPersistedSenderReferenceKey();
            clearSenderPidOptionWadh();
          }
          throw error;
        }
      }),
    [applyResponse, bioAuthMutation, dispatch, run, sender.mobile, store]
  );

  const addBeneficiary = useCallback(
    async (payload: Omit<AddBeneficiaryRequest, "senderMobile">) => {
      dispatch(startLoading());
      dispatch(setWorkflowError(null));
      try {
        const response = await addBeneficiaryMutation({
          ...payload,
          senderMobile: sender.mobile,
        }).unwrap();
        const applied = applyResponse(response);
        if (applied?.beneficiary?.id) {
          dispatch(
            setPendingBeneficiary({
              id: applied.beneficiary.id,
              referenceKey: applied.referenceKey ?? applied.beneficiary.referenceKey,
            })
          );
        }
        return applied;
      } catch (error) {
        const message = getErrorMessage(error);
        if (/already exists/i.test(message)) {
          dispatch(closeDialog());
          dispatch(setWorkflowError(null));
          dispatch(
            showSnackbar({
              message: "Beneficiary already exists. Verify or delete from the list below.",
              severity: "info",
            })
          );
        } else {
          dispatch(setWorkflowError(message));
        }
        return null;
      } finally {
        dispatch(stopLoading());
        await beneficiariesQuery.refetch();
      }
    },
    [addBeneficiaryMutation, applyResponse, beneficiariesQuery, dispatch, sender.mobile]
  );

  const openVerifyBeneficiary = useCallback(
    (item: DmtBeneficiary) => {
      const referenceKey = (item.referenceKey || sender.referenceKey || "").trim();
      if (!item.id?.trim()) {
        dispatch(
          showSnackbar({ message: "Beneficiary ID is missing.", severity: "error" })
        );
        return;
      }
      if (!referenceKey) {
        dispatch(
          showSnackbar({
            message: "Reference key missing. Search sender again or re-add beneficiary.",
            severity: "error",
          })
        );
        return;
      }

      verifyContextRef.current = { id: item.id, referenceKey };
      dispatch(setSelectedBeneficiary(item));
      dispatch(
        setPendingBeneficiary({
          id: item.id,
          referenceKey,
        })
      );
      dispatch(openDialog("beneficiaryOtp"));
    },
    [dispatch, sender.referenceKey]
  );

  const verifyBeneficiaryOtp = useCallback(
    async (otp: string) =>
      run(async () => {
        const ctx = verifyContextRef.current;
        const beneficiaryId =
          ctx?.id || beneficiary.pendingBeneficiaryId || beneficiary.selected?.id || "";
        const referenceKey = (
          ctx?.referenceKey ||
          beneficiary.pendingReferenceKey ||
          beneficiary.selected?.referenceKey ||
          sender.referenceKey ||
          ""
        ).trim();

        if (!beneficiaryId) {
          throw new Error("Beneficiary not selected for verification.");
        }
        if (!referenceKey) {
          throw new Error("Reference key is required to verify beneficiary.");
        }

        const response = await verifyBeneficiaryOtpMutation({
          beneficiaryId,
          otp: otp.trim(),
          referenceKey,
          senderMobile: sender.mobile,
        }).unwrap();
        const applied = applyResponse(response);
        verifyContextRef.current = null;
        dispatch(closeDialog());
        await beneficiariesQuery.refetch();
        dispatch(
          showSnackbar({
            message: applied?.message || "Beneficiary verified successfully.",
            severity: "success",
          })
        );
        return applied;
      }),
    [
      applyResponse,
      beneficiary.pendingBeneficiaryId,
      beneficiary.pendingReferenceKey,
      beneficiary.selected?.id,
      beneficiary.selected?.referenceKey,
      beneficiariesQuery,
      dispatch,
      run,
      sender.mobile,
      sender.referenceKey,
      verifyBeneficiaryOtpMutation,
    ]
  );

  const deleteBeneficiary = useCallback(
    async (item: DmtBeneficiary) =>
      run(async () => {
        const beneficiaryId = item.id?.trim();
        if (!beneficiaryId) {
          throw new Error("Beneficiary ID is missing.");
        }

        const response = await deleteBeneficiaryMutation({ beneficiaryId }).unwrap();
        const referenceKey = (
          response.referenceKey ||
          item.referenceKey ||
          sender.referenceKey ||
          ""
        ).trim();

        deleteContextRef.current = {
          id: beneficiaryId,
          referenceKey,
          name: item.name,
        };
        dispatch(setSelectedBeneficiary(item));
        dispatch(
          setPendingBeneficiary({
            id: beneficiaryId,
            referenceKey,
          })
        );
        dispatch(openDialog("deleteBeneficiary"));
        dispatch(
          showSnackbar({
            message: response.message || "OTP sent to confirm beneficiary deletion.",
            severity: "success",
          })
        );
        return response;
      }),
    [deleteBeneficiaryMutation, dispatch, run, sender.referenceKey]
  );

  const verifyBeneficiaryDelete = useCallback(
    async (otp: string) =>
      run(async () => {
        const ctx = deleteContextRef.current;
        const beneficiaryId =
          ctx?.id || beneficiary.pendingBeneficiaryId || beneficiary.selected?.id || "";
        const referenceKey = (
          ctx?.referenceKey ||
          beneficiary.pendingReferenceKey ||
          beneficiary.selected?.referenceKey ||
          sender.referenceKey ||
          ""
        ).trim();

        if (!beneficiaryId) {
          throw new Error("Beneficiary not selected for deletion.");
        }

        const response = await verifyBeneficiaryDeleteMutation({
          beneficiaryId,
          otp: otp.trim(),
          ...(referenceKey ? { referenceKey } : {}),
        }).unwrap();

        deleteContextRef.current = null;
        dispatch(closeDialog());
        dispatch(setSelectedBeneficiary(null));
        dispatch(setPendingBeneficiary({ id: "", referenceKey: "" }));
        await beneficiariesQuery.refetch();
        dispatch(
          showSnackbar({
            message: response.message || "Beneficiary deleted successfully.",
            severity: "success",
          })
        );
        return response;
      }),
    [
      beneficiary.pendingBeneficiaryId,
      beneficiary.pendingReferenceKey,
      beneficiary.selected?.id,
      beneficiary.selected?.referenceKey,
      beneficiariesQuery,
      dispatch,
      run,
      sender.referenceKey,
      verifyBeneficiaryDeleteMutation,
    ]
  );

  const startTransfer = useCallback(
    (item: DmtBeneficiary) => {
      if (!item.isVerified) {
        dispatch(
          showSnackbar({
            message: "Please verify beneficiary before transfer.",
            severity: "error",
          })
        );
        return;
      }
      transferContextRef.current = null;
      dispatch(
        setTransactionDraft({
          amount: 0,
          transferMode: "IMPS",
          remarks: "",
          otp: "",
          referenceKey: "",
        })
      );
      dispatch(setSelectedBeneficiary(item));
    },
    [dispatch]
  );

  const cancelTransfer = useCallback(() => {
    transferContextRef.current = null;
    dispatch(setSelectedBeneficiary(null));
  }, [dispatch]);

  const initiateTransfer = useCallback(
    async (values: { amount: number; transferMode: DmtTransferMode; remarks?: string }) =>
      run(async () => {
        if (!beneficiary.selected) throw new Error("Select a beneficiary first.");
        if (!sender.referenceKey?.trim()) {
          throw new Error("Reference key missing. Search sender again.");
        }

        transferContextRef.current = {
          beneficiaryId: beneficiary.selected.id,
          amount: values.amount,
          transferMode: values.transferMode,
          remarks: values.remarks,
          referenceKey: sender.referenceKey,
        };
        dispatch(setTransactionDraft(values));

        const response = await generateTransactionOtpMutation({
          senderMobile: sender.mobile,
          amount: values.amount,
          beneficiaryId: beneficiary.selected.id,
          transferMode: values.transferMode,
          referenceKey: sender.referenceKey,
        }).unwrap();

        const referenceKey = response.referenceKey || sender.referenceKey;
        if (referenceKey) {
          transferContextRef.current = {
            ...transferContextRef.current!,
            referenceKey,
          };
          dispatch(setTransactionDraft({ referenceKey }));
        }

        dispatch(openDialog("transactionOtp"));
        dispatch(
          showSnackbar({
            message: response.message || "Transaction OTP sent.",
            severity: "success",
          })
        );
        return response;
      }),
    [
      beneficiary.selected,
      dispatch,
      generateTransactionOtpMutation,
      run,
      sender.mobile,
      sender.referenceKey,
    ]
  );

  const generateTransactionOtp = initiateTransfer;

  const verifyTransactionOtpAndTransfer = useCallback(
    async (otp: string) =>
      run(async () => {
        const ctx = transferContextRef.current;
        const beneficiaryId =
          ctx?.beneficiaryId || beneficiary.selected?.id || "";
        const amount = ctx?.amount || transaction.draft.amount;
        const transferMode = ctx?.transferMode || transaction.draft.transferMode;
        const remarks = ctx?.remarks ?? transaction.draft.remarks;
        const referenceKey = (
          ctx?.referenceKey ||
          transaction.draft.referenceKey ||
          sender.referenceKey ||
          ""
        ).trim();

        if (!beneficiaryId) throw new Error("Select a beneficiary first.");
        if (!amount || amount < 1) throw new Error("Enter a valid transfer amount.");
        if (!referenceKey) throw new Error("Reference key missing. Search sender again.");

        const verifyPayload: VerifyTransactionOtpRequest = {
          senderMobile: sender.mobile,
          otp: otp.trim(),
          referenceKey,
          amount,
          beneficiaryId,
          transferMode,
        };

        await verifyTransactionOtpMutation(verifyPayload).unwrap();
        dispatch(setTransactionDraft({ otp: otp.trim() }));

        let latitude = "28.6139";
        let longitude = "77.2090";
        try {
          const coords = await getCurrentLocation();
          latitude = coords.latitude;
          longitude = coords.longitude;
        } catch {
          dispatch(
            showSnackbar({
              message: "Using fallback location for transfer.",
              severity: "info",
            })
          );
        }

        const transferPayload: TransferRequest = {
          senderMobile: sender.mobile,
          beneficiaryId,
          amount,
          transferMode,
          otp: otp.trim(),
          referenceKey,
          latitude,
          longitude,
          remarks: remarks || undefined,
        };

        const transferResponse = await transferMutation(transferPayload).unwrap();
        transferContextRef.current = null;
        const enriched = ensureTransferSuccessResponse(transferResponse, {
          amount,
          transferMode,
          remarks,
          beneficiary: beneficiary.selected,
        });
        const applied = applyResponse(enriched);
        refreshRetailerWalletData();
        dispatch(closeDialog());
        dispatch(
          showSnackbar({
            message: applied?.message || "Transfer initiated successfully.",
            severity: "success",
          })
        );
        return applied;
      }),
    [
      applyResponse,
      beneficiary.selected?.id,
      dispatch,
      run,
      sender.mobile,
      sender.referenceKey,
      transaction.draft.amount,
      transaction.draft.referenceKey,
      transaction.draft.remarks,
      transaction.draft.transferMode,
      transferMutation,
      verifyTransactionOtpMutation,
    ]
  );

  const resetAll = useCallback(() => {
    dispatch(resetWorkflowState());
    dispatch(resetSenderState());
    dispatch(resetBeneficiaryState());
    dispatch(resetTransactionState());
    dispatch(showSnackbar({ message: "Workflow reset", severity: "info" }));
  }, [dispatch]);

  return {
    sender,
    beneficiary,
    transaction,
    workflow,
    beneficiaries: beneficiariesQuery.data?.beneficiaries ?? beneficiary.list,
    beneficiariesLoading: beneficiariesQuery.isLoading || beneficiariesQuery.isFetching,
    beneficiariesError: beneficiariesQuery.isError
      ? getErrorMessage(beneficiariesQuery.error)
      : null,
    searchSender,
    registerSender,
    verifySenderOtp,
    bioAuth,
    addBeneficiary,
    verifyBeneficiaryOtp,
    openVerifyBeneficiary,
    deleteBeneficiary,
    verifyBeneficiaryDelete,
    startTransfer,
    cancelTransfer,
    initiateTransfer,
    generateTransactionOtp,
    verifyTransactionOtpAndTransfer,
    resetAll,
    openAddBeneficiary: () => dispatch(openDialog("addBeneficiary")),
    closeDialog: () => dispatch(closeDialog()),
    setSelectedBeneficiary: (b: Parameters<typeof setSelectedBeneficiary>[0]) =>
      dispatch(setSelectedBeneficiary(b)),
    setTransactionDraft: (draft: Parameters<typeof setTransactionDraft>[0]) =>
      dispatch(setTransactionDraft(draft)),
    refetchBeneficiaries: beneficiariesQuery.refetch,
  };
}
