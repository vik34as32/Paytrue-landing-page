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
  resetSenderState,
  setSenderMobile,
  setSenderProfile,
  setSenderReferenceKey,
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
  getSenderReferenceKey,
  setActiveSenderMobile,
  setSenderReferenceKey as persistSenderReferenceKey,
} from "@/src/lib/dmtSession";
import { getCurrentLocation } from "@/src/lib/rdService";
import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import { codeToNextAction, ensureTransferSuccessResponse } from "../services/normalizers";
import {
  useAddBeneficiaryMutation,
  useBioAuthMutation,
  useDeleteBeneficiaryMutation,
  useFetchBeneficiariesQuery,
  useGenerateTransactionOtpMutation,
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
  DmtTransferMode,
  DmtWorkflowResponse,
  RegisterSenderRequest,
  TransferRequest,
  VerifyBeneficiaryOtpRequest,
  VerifySenderOtpRequest,
  VerifyTransactionOtpRequest,
} from "../types";

function getErrorMessage(error: unknown): string {
  const err = error as { data?: { message?: string }; message?: string };
  return err?.data?.message || err?.message || "Request failed";
}

export function useDmtOrchestrator() {
  const dispatch = useAppDispatch();
  const sender = useAppSelector((state) => state.dmtSender);
  const beneficiary = useAppSelector((state) => state.dmtBeneficiary);
  const transaction = useAppSelector((state) => state.dmtTransaction);
  const workflow = useAppSelector((state) => state.dmtWorkflow);

  const [searchSenderMutation] = useSearchSenderMutation();
  const [registerSenderMutation] = useRegisterSenderMutation();
  const [verifySenderOtpMutation] = useVerifySenderOtpMutation();
  const [bioAuthMutation] = useBioAuthMutation();
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
      if (response.referenceKey) {
        dispatch(setSenderReferenceKey(response.referenceKey));
        persistSenderReferenceKey(response.referenceKey);
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
      return response;
    },
    [dispatch]
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

  const verifySenderOtp = useCallback(
    async (payload: Omit<VerifySenderOtpRequest, "mobile"> & { otp: string }) =>
      run(async () => {
        try {
          const response = await verifySenderOtpMutation({
            mobile: sender.mobile,
            otp: payload.otp,
            referenceKey: payload.referenceKey || sender.referenceKey,
          }).unwrap();
          return applyResponse(response);
        } catch (error) {
          // OTP validated but sender still needs biometric eKYC. Backend signals
          // this with code KYC_REQUIRED instead of a nextAction, so move the
          // workflow forward to Bio Auth (step 4) rather than showing an error.
          const code = String(
            (error as { code?: string; data?: { code?: string } })?.code ??
              (error as { data?: { code?: string } })?.data?.code ??
              ""
          ).toUpperCase();
          const action = codeToNextAction(code);
          if (action) {
            return applyResponse({ success: true, nextAction: action });
          }
          throw error;
        }
      }),
    [applyResponse, run, sender.mobile, sender.referenceKey, verifySenderOtpMutation]
  );

  const bioAuth = useCallback(
    async (payload: Omit<BioAuthRequest, "mobile">) =>
      run(async () => {
        const response = await bioAuthMutation({
          mobile: sender.mobile,
          referenceKey: payload.referenceKey || sender.referenceKey,
          latitude: payload.latitude,
          longitude: payload.longitude,
          consentTaken: payload.consentTaken,
          captureType: payload.captureType,
          pidData: payload.pidData,
          externalRef: payload.externalRef,
        }).unwrap();
        return applyResponse(response);
      }),
    [applyResponse, bioAuthMutation, run, sender.mobile, sender.referenceKey]
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
