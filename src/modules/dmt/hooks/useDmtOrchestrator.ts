"use client";

import { useCallback, useEffect } from "react";
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
import { codeToNextAction } from "../services/normalizers";
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

  const beneficiariesQuery = useFetchBeneficiariesQuery(
    { senderMobile: sender.mobile },
    { skip: !sender.mobile }
  );

  useEffect(() => {
    if (beneficiariesQuery.data?.beneficiaries?.length) {
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
    async (payload: Omit<AddBeneficiaryRequest, "senderMobile">) =>
      run(async () => {
        const response = await addBeneficiaryMutation({
          ...payload,
          senderMobile: sender.mobile,
        }).unwrap();
        const applied = applyResponse(response);
        if (applied?.beneficiary?.id) {
          dispatch(
            setPendingBeneficiary({
              id: applied.beneficiary.id,
              referenceKey: applied.referenceKey,
            })
          );
        }
        await beneficiariesQuery.refetch();
        return applied;
      }),
    [addBeneficiaryMutation, applyResponse, beneficiariesQuery, dispatch, run, sender.mobile]
  );

  const verifyBeneficiaryOtp = useCallback(
    async (otp: string) =>
      run(async () => {
        const response = await verifyBeneficiaryOtpMutation({
          beneficiaryId: beneficiary.pendingBeneficiaryId,
          otp,
          referenceKey: beneficiary.pendingReferenceKey || sender.referenceKey,
          senderMobile: sender.mobile,
        } as VerifyBeneficiaryOtpRequest).unwrap();
        const applied = applyResponse(response);
        dispatch(closeDialog());
        await beneficiariesQuery.refetch();
        return applied;
      }),
    [
      applyResponse,
      beneficiary.pendingBeneficiaryId,
      beneficiary.pendingReferenceKey,
      beneficiariesQuery,
      dispatch,
      run,
      sender.mobile,
      sender.referenceKey,
      verifyBeneficiaryOtpMutation,
    ]
  );

  const deleteBeneficiary = useCallback(
    async (beneficiaryId: string) =>
      run(async () => {
        const response = await deleteBeneficiaryMutation({
          beneficiaryId,
          senderMobile: sender.mobile,
        }).unwrap();
        const applied = applyResponse(response);
        dispatch(
          setPendingBeneficiary({
            id: beneficiaryId,
            referenceKey: applied?.referenceKey,
          })
        );
        dispatch(openDialog("deleteBeneficiary"));
        return applied;
      }),
    [applyResponse, deleteBeneficiaryMutation, dispatch, run, sender.mobile]
  );

  const verifyBeneficiaryDelete = useCallback(
    async (otp: string) =>
      run(async () => {
        const response = await verifyBeneficiaryDeleteMutation({
          beneficiaryId: beneficiary.pendingBeneficiaryId,
          senderMobile: sender.mobile,
          otp,
          referenceKey: beneficiary.pendingReferenceKey || sender.referenceKey,
        }).unwrap();
        const applied = applyResponse(response);
        dispatch(closeDialog());
        await beneficiariesQuery.refetch();
        return applied;
      }),
    [
      applyResponse,
      beneficiary.pendingBeneficiaryId,
      beneficiary.pendingReferenceKey,
      beneficiariesQuery,
      dispatch,
      run,
      sender.mobile,
      sender.referenceKey,
      verifyBeneficiaryDeleteMutation,
    ]
  );

  const generateTransactionOtp = useCallback(
    async () =>
      run(async () => {
        if (!beneficiary.selected) throw new Error("Select a beneficiary first.");
        const response = await generateTransactionOtpMutation({
          senderMobile: sender.mobile,
          amount: transaction.draft.amount,
          beneficiaryId: beneficiary.selected.id,
          transferMode: transaction.draft.transferMode,
          referenceKey: sender.referenceKey,
        }).unwrap();
        if (response.referenceKey) {
          dispatch(setTransactionDraft({ referenceKey: response.referenceKey }));
        }
        return applyResponse(response);
      }),
    [
      applyResponse,
      beneficiary.selected,
      dispatch,
      generateTransactionOtpMutation,
      run,
      sender.mobile,
      sender.referenceKey,
      transaction.draft.amount,
      transaction.draft.transferMode,
    ]
  );

  const verifyTransactionOtpAndTransfer = useCallback(
    async (otp: string) =>
      run(async () => {
        if (!beneficiary.selected) throw new Error("Select a beneficiary first.");

        const verifyPayload: VerifyTransactionOtpRequest = {
          senderMobile: sender.mobile,
          otp,
          referenceKey: transaction.draft.referenceKey || sender.referenceKey,
          amount: transaction.draft.amount,
          beneficiaryId: beneficiary.selected.id,
          transferMode: transaction.draft.transferMode,
        };

        const verifyResponse = await verifyTransactionOtpMutation(verifyPayload).unwrap();
        const appliedVerify = applyResponse(verifyResponse);
        dispatch(setTransactionDraft({ otp }));

        if (appliedVerify?.nextAction !== "TRANSFER") {
          return appliedVerify;
        }

        const transferPayload: TransferRequest = {
          senderMobile: sender.mobile,
          beneficiaryId: beneficiary.selected.id,
          amount: transaction.draft.amount,
          transferMode: transaction.draft.transferMode,
          otp,
          referenceKey:
            transaction.draft.referenceKey ||
            appliedVerify.referenceKey ||
            sender.referenceKey,
          latitude: "28.6139",
          longitude: "77.2090",
          remarks: transaction.draft.remarks,
        };

        const transferResponse = await transferMutation(transferPayload).unwrap();
        return applyResponse(transferResponse);
      }),
    [
      applyResponse,
      beneficiary.selected,
      dispatch,
      run,
      sender.mobile,
      sender.referenceKey,
      transaction.draft,
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
    searchSender,
    registerSender,
    verifySenderOtp,
    bioAuth,
    addBeneficiary,
    verifyBeneficiaryOtp,
    deleteBeneficiary,
    verifyBeneficiaryDelete,
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
