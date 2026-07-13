import { normalizeDmtBankList } from "@/src/modules/dmt/services/normalizers";
import { DMT_ENDPOINTS } from "@/src/constants/dmtApi";
import api from "@/src/lib/axios";
import { logDmtApiCall, apiNameFromEndpoint } from "@/src/lib/dmtApiLogger";
import { buildAepsLoginApiBody } from "@/src/lib/aepsUtils";
import { formatGeoLocation } from "@/src/lib/geoUtils";
import {
  buildVerifyBankAccountPayload,
  normalizeVerifyBankAccountResponse,
  resolveDmtGeoCoordinates,
} from "@/src/lib/dmtBankVerify";
import {
  mapDmtError,
  normalizeBeneficiary,
  normalizeBeneficiaryList,
  normalizeCheckSenderResponse,
  normalizeSender,
  normalizeTransaction,
  normalizeTransactionList,
  resolveBeneficiaryBankFields,
  resolveBeneficiaryMobileNumber,
  unwrapApiData,
} from "@/src/lib/dmtUtils";
import type {
  AddBeneficiaryPayload,
  CheckSenderResponse,
  DeleteBeneficiaryResponse,
  DmtBank,
  DmtBeneficiary,
  DmtPaginatedResponse,
  DmtSender,
  DmtTransaction,
  DmtTransactionFilters,
  GenerateTransactionOtpPayload,
  OtpActionResponse,
  RefundPayload,
  RegisterSenderPayload,
  RemitterEkycPayload,
  TransferInitResponse,
  TransferPayload,
  VerifyBeneficiaryDeletePayload,
  VerifyBeneficiaryPayload,
  VerifyOtpPayload,
  VerifyTransactionOtpPayload,
  VerifyBankAccountPayload,
  VerifyBankAccountResponse,
} from "@/src/types/dmt";

async function request<T>(
  fn: () => Promise<T>,
  meta?: { endpoint: string; method?: string; body?: unknown }
): Promise<T> {
  const started = Date.now();
  const endpoint = meta?.endpoint ?? "/dmt";
  const method = meta?.method ?? "GET";
  try {
    const result = await fn();
    logDmtApiCall({
      apiName: apiNameFromEndpoint(endpoint),
      endpoint,
      method,
      request: meta?.body,
      response: result,
      status: 200,
      latencyMs: Date.now() - started,
      success: true,
    });
    return result;
  } catch (error) {
    const err = error as { status?: number; message?: string; data?: unknown };
    logDmtApiCall({
      apiName: apiNameFromEndpoint(endpoint),
      endpoint,
      method,
      request: meta?.body,
      response: err.data ?? { message: err.message },
      status: err.status ?? 500,
      latencyMs: Date.now() - started,
      success: false,
    });
    throw mapDmtError(error);
  }
}

function extractReferenceKey(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const key = data.referenceKey ?? data.reference_key ?? data.requestId ?? data.request_id;
  return key != null ? String(key) : undefined;
}

function normalizeOtpResponse(payload: unknown): OtpActionResponse {
  const data = unwrapApiData<Record<string, unknown>>(payload) ?? {};
  return {
    message: data.message ? String(data.message) : undefined,
    requestId: data.requestId ? String(data.requestId) : undefined,
    referenceKey: extractReferenceKey(data),
  };
}

function normalizeDeleteBeneficiaryResponse(payload: unknown): DeleteBeneficiaryResponse {
  const data = unwrapApiData<Record<string, unknown>>(payload) ?? {};
  return {
    message: data.message ? String(data.message) : undefined,
    referenceKey: extractReferenceKey(data),
  };
}

function buildTransferBody(payload: TransferPayload): Record<string, unknown> {
  const coords = formatGeoLocation({
    latitude: payload.latitude,
    longitude: payload.longitude,
  });

  const body: Record<string, unknown> = {
    senderMobile: payload.senderMobile.trim(),
    beneficiaryId: payload.beneficiaryId,
    amount: payload.amount,
    transferMode: payload.transferMode,
    otp: payload.otp.trim(),
    referenceKey: payload.referenceKey.trim(),
    latitude: coords.latitude,
    longitude: coords.longitude,
  };

  if (payload.remarks?.trim()) {
    body.remarks = payload.remarks.trim();
  }

  return body;
}

function normalizeTransferResponse(
  payload: unknown,
  input?: TransferPayload
): TransferInitResponse {
  const data = unwrapApiData<Record<string, unknown>>(payload) ?? {};
  const transaction = data?.transaction
    ? normalizeTransaction(data.transaction as Record<string, unknown>)
    : data?.id
      ? normalizeTransaction(data)
      : undefined;

  return {
    requiresOtp: Boolean(data?.requiresOtp ?? data?.otpRequired ?? !input?.otp),
    requestId: data?.requestId ? String(data.requestId) : undefined,
    referenceKey: extractReferenceKey(data),
    reference: data?.reference ? String(data.reference) : undefined,
    transaction,
    charges: data?.charges != null ? Number(data.charges) : undefined,
    gst: data?.gst != null ? Number(data.gst) : undefined,
    netAmount: data?.netAmount != null ? Number(data.netAmount) : undefined,
  };
}

export async function searchSender(mobile: string): Promise<CheckSenderResponse> {
  return request(
    async () => {
      const response = await api.post(DMT_ENDPOINTS.senderSearch, { mobile });
      return normalizeCheckSenderResponse(response.data);
    },
    { endpoint: DMT_ENDPOINTS.senderSearch, method: "POST", body: { mobile } }
  );
}

export async function checkRemitter(mobile: string): Promise<CheckSenderResponse> {
  return request(
    async () => {
      const response = await api.post(DMT_ENDPOINTS.remitterCheck, { mobile });
      return normalizeCheckSenderResponse(response.data);
    },
    { endpoint: DMT_ENDPOINTS.remitterCheck, method: "POST", body: { mobile } }
  );
}

/** @deprecated Use searchSender — kept for backward compatibility */
export async function checkSender(mobile: string): Promise<CheckSenderResponse> {
  return searchSender(mobile);
}

export async function fetchRemitterByMobile(mobile: string): Promise<DmtSender> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.remitterByMobile(mobile));
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.remitter as Record<string, unknown>) ??
        (data?.sender as Record<string, unknown>) ??
        data ??
        {}
    );
  });
}

export async function fetchSenderByMobile(mobile: string): Promise<DmtSender> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.senderByMobile(mobile));
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.sender as Record<string, unknown>) ??
        (data?.remitter as Record<string, unknown>) ??
        data ??
        {}
    );
  });
}

/** Alias for fetchSenderByMobile */
export async function fetchSenderProfile(mobile?: string): Promise<DmtSender> {
  if (!mobile) {
    throw new Error("Sender mobile is required.");
  }
  return fetchSenderByMobile(mobile);
}

export async function registerSender(
  payload: RegisterSenderPayload
): Promise<OtpActionResponse> {
  return request(async () => {
    const body: Record<string, unknown> = {
      mobile: payload.mobile.trim(),
      aadhaar: payload.aadhaar.trim(),
    };
    if (payload.referenceKey) body.referenceKey = payload.referenceKey;
    if (payload.firstName) body.firstName = payload.firstName;
    if (payload.lastName) body.lastName = payload.lastName;
    if (payload.pincode) body.pincode = payload.pincode;
    if (payload.address) body.address = payload.address;
    if (payload.city) body.city = payload.city;
    if (payload.state) body.state = payload.state;

    const response = await api.post(DMT_ENDPOINTS.registerSender, body);
    return normalizeOtpResponse(response.data);
  });
}

export async function registerRemitter(
  payload: RegisterSenderPayload
): Promise<OtpActionResponse> {
  const body: Record<string, unknown> = {
    mobile: payload.mobile.trim(),
    aadhaar: payload.aadhaar.trim(),
  };
  if (payload.referenceKey) body.referenceKey = payload.referenceKey;
  if (payload.firstName) body.firstName = payload.firstName;
  if (payload.lastName) body.lastName = payload.lastName;
  if (payload.pincode) body.pincode = payload.pincode;
  if (payload.address) body.address = payload.address;
  if (payload.city) body.city = payload.city;
  if (payload.state) body.state = payload.state;

  return request(
    async () => {
      const response = await api.post(DMT_ENDPOINTS.remitterRegister, body);
      return normalizeOtpResponse(response.data);
    },
    { endpoint: DMT_ENDPOINTS.remitterRegister, method: "POST", body }
  );
}

export async function sendSenderOtp(mobile: string): Promise<OtpActionResponse> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.sendSenderOtp, { mobile });
    return normalizeOtpResponse(response.data);
  });
}

export async function sendRemitterOtp(mobile: string): Promise<OtpActionResponse> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.remitterSendOtp, { mobile });
    return normalizeOtpResponse(response.data);
  });
}

export async function verifySenderOtp(payload: VerifyOtpPayload): Promise<DmtSender> {
  return request(async () => {
    const body: Record<string, unknown> = {
      mobile: payload.mobile.trim(),
      otp: payload.otp.trim(),
    };
    if (payload.referenceKey) body.referenceKey = payload.referenceKey;

    const response = await api.post(DMT_ENDPOINTS.verifySenderOtp, body);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.sender as Record<string, unknown>) ??
        (data?.remitter as Record<string, unknown>) ??
        data ??
        {}
    );
  });
}

export async function verifyRemitterOtp(payload: VerifyOtpPayload): Promise<DmtSender> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.remitterVerifyOtp, {
      mobile: payload.mobile,
      otp: payload.otp,
      referenceKey: payload.referenceKey,
      requestId: payload.requestId,
    });
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.remitter as Record<string, unknown>) ??
        (data?.sender as Record<string, unknown>) ??
        data ??
        {}
    );
  });
}

export async function resendSenderOtp(mobile: string): Promise<OtpActionResponse> {
  return sendSenderOtp(mobile);
}

export async function remitterEkyc(payload: RemitterEkycPayload): Promise<DmtSender> {
  return request(async () => {
    const biometricBase = buildAepsLoginApiBody({
      pidData: payload.pidData,
      latitude: payload.latitude,
      longitude: payload.longitude,
      captureType: payload.captureType || "FINGER",
    });

    const body: Record<string, unknown> = {
      mobile: payload.mobile,
      latitude: biometricBase.latitude,
      longitude: biometricBase.longitude,
      externalRef: payload.externalRef || biometricBase.externalRef,
      consentTaken: payload.consentTaken,
      captureType: payload.captureType || "FINGER",
      biometricData: biometricBase.biometricData,
    };
    if (payload.referenceKey) body.referenceKey = payload.referenceKey;

    const response = await api.post(DMT_ENDPOINTS.remitterEkyc, body);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeSender(
      (data?.remitter as Record<string, unknown>) ??
        (data?.sender as Record<string, unknown>) ??
        data ??
        {}
    );
  });
}

export async function fetchDmtBanks(): Promise<DmtBank[]> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.banks);
    return normalizeDmtBankList(response.data);
  });
}

export async function verifyBankAccount(input: {
  accountNumber: string;
  ifscCode: string;
  name?: string;
  pennyDrop?: VerifyBankAccountPayload["pennyDrop"];
}): Promise<VerifyBankAccountResponse> {
  return request(
    async () => {
      const coords = await resolveDmtGeoCoordinates();
      const body = buildVerifyBankAccountPayload({
        accountNumber: input.accountNumber,
        ifscCode: input.ifscCode,
        name: input.name,
        pennyDrop: input.pennyDrop ?? "YES",
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const response = await api.post(DMT_ENDPOINTS.verifyBankAccount, body);
      return normalizeVerifyBankAccountResponse(response.data);
    },
    {
      endpoint: DMT_ENDPOINTS.verifyBankAccount,
      method: "POST",
      body: {
        accountNumber: input.accountNumber,
        bankIfsc: input.ifscCode,
        name: input.name,
        pennyDrop: input.pennyDrop ?? "YES",
      },
    }
  );
}

export async function fetchBeneficiaries(params: {
  senderMobile: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<DmtBeneficiary[]> {
  return request(async () => {
    const senderMobile = String(params.senderMobile || "").trim();
    if (!senderMobile) {
      throw new Error("Sender mobile is required to list beneficiaries.");
    }

    const response = await api.get(DMT_ENDPOINTS.beneficiaries, {
      params: {
        senderMobile,
        page: params.page,
        limit: params.limit,
        search: params.search,
      },
    });
    return normalizeBeneficiaryList(response.data);
  });
}

export async function addBeneficiary(
  payload: AddBeneficiaryPayload
): Promise<DmtBeneficiary & { referenceKey?: string }> {
  return request(async () => {
    const senderMobile = String(payload.senderMobile || "").trim();
    if (!senderMobile) {
      throw new Error("Sender mobile is required to add beneficiary.");
    }

    const body: Record<string, unknown> = {
      senderMobile,
      name: payload.name.trim(),
      accountNumber: payload.accountNumber.trim(),
      ifscCode: payload.ifscCode.toUpperCase(),
    };

    const beneficiaryMobile = resolveBeneficiaryMobileNumber(
      senderMobile,
      payload.beneficiaryMobileNumber ?? payload.mobile
    );
    if (beneficiaryMobile) {
      body.beneficiaryMobileNumber = beneficiaryMobile;
    }
    Object.assign(
      body,
      resolveBeneficiaryBankFields({
        bankId: payload.bankId,
        instantPayBankId: payload.instantPayBankId,
      })
    );

    const response = await api.post(DMT_ENDPOINTS.beneficiaries, body);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    const beneficiaryRaw =
      (data?.beneficiary as Record<string, unknown>) ?? data ?? {};
    const beneficiary = normalizeBeneficiary(beneficiaryRaw);
    const referenceKey =
      extractReferenceKey(data) ??
      extractReferenceKey(beneficiaryRaw) ??
      (beneficiaryRaw.referenceKey ? String(beneficiaryRaw.referenceKey) : undefined);

    return {
      ...beneficiary,
      referenceKey,
    };
  });
}

export async function verifyBeneficiary(
  beneficiaryId: string,
  payload: VerifyBeneficiaryPayload
): Promise<DmtBeneficiary> {
  return request(async () => {
    if (!payload.referenceKey?.trim()) {
      throw new Error("Reference key is required to verify beneficiary.");
    }

    const response = await api.post(DMT_ENDPOINTS.beneficiaryVerify(beneficiaryId), {
      otp: payload.otp.trim(),
      referenceKey: payload.referenceKey.trim(),
    });
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeBeneficiary(
      (data?.beneficiary as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function deleteBeneficiary(
  beneficiaryId: string
): Promise<DeleteBeneficiaryResponse> {
  return request(async () => {
    const response = await api.delete(DMT_ENDPOINTS.beneficiaryDelete(beneficiaryId));
    return normalizeDeleteBeneficiaryResponse(response.data);
  });
}

export async function verifyBeneficiaryDelete(
  beneficiaryId: string,
  payload: VerifyBeneficiaryDeletePayload
): Promise<void> {
  return request(async () => {
    const body: Record<string, unknown> = { otp: payload.otp.trim() };
    if (payload.referenceKey?.trim()) {
      body.referenceKey = payload.referenceKey.trim();
    }
    await api.post(DMT_ENDPOINTS.beneficiaryDeleteVerify(beneficiaryId), body);
  });
}

export async function generateTransactionOtp(
  payload: GenerateTransactionOtpPayload
): Promise<OtpActionResponse> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.transactionGenerateOtp, payload);
    return normalizeOtpResponse(response.data);
  });
}

export async function verifyTransactionOtp(
  payload: VerifyTransactionOtpPayload
): Promise<OtpActionResponse> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.transactionVerifyOtp, payload);
    return normalizeOtpResponse(response.data);
  });
}

export async function transferImps(
  payload: TransferPayload
): Promise<TransferInitResponse> {
  return request(async () => {
    const response = await api.post(
      DMT_ENDPOINTS.transferImps,
      buildTransferBody({ ...payload, transferMode: "IMPS" })
    );
    return normalizeTransferResponse(response.data, payload);
  });
}

export async function transferNeft(
  payload: TransferPayload
): Promise<TransferInitResponse> {
  return request(async () => {
    const response = await api.post(
      DMT_ENDPOINTS.transferNeft,
      buildTransferBody({ ...payload, transferMode: "NEFT" })
    );
    return normalizeTransferResponse(response.data, payload);
  });
}

export async function initiateTransfer(
  payload: TransferPayload
): Promise<TransferInitResponse> {
  if (payload.transferMode === "NEFT") {
    return transferNeft(payload);
  }
  return transferImps(payload);
}

export async function fetchTransferStatus(reference: string): Promise<DmtTransaction> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.transferStatus(reference));
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeTransaction(
      (data?.transaction as Record<string, unknown>) ?? data ?? {}
    );
  });
}

export async function fetchTransactions(
  filters: DmtTransactionFilters = {}
): Promise<DmtPaginatedResponse<DmtTransaction>> {
  return request(async () => {
    const params: Record<string, string | number> = {
      page: filters.page ?? 1,
      limit: filters.limit ?? 10,
    };

    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters.dateTo) params.dateTo = filters.dateTo;
    if (filters.minAmount != null) params.minAmount = filters.minAmount;
    if (filters.maxAmount != null) params.maxAmount = filters.maxAmount;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await api.get(DMT_ENDPOINTS.transactions, { params });
    return normalizeTransactionList(response.data);
  });
}

export async function fetchReceipt(reference: string): Promise<DmtTransaction> {
  return request(async () => {
    const response = await api.get(DMT_ENDPOINTS.receipt(reference));
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeTransaction(
      (data?.transaction as Record<string, unknown>) ??
        (data?.receipt as Record<string, unknown>) ??
        data ??
        {}
    );
  });
}

export async function fetchTransactionById(id: string): Promise<DmtTransaction> {
  return request(async () => {
    try {
      return await fetchTransferStatus(id);
    } catch (error) {
      const mapped = mapDmtError(error);
      if (mapped.status === 404) {
        try {
          return await fetchReceipt(id);
        } catch {
          const list = await fetchTransactions({ search: id, limit: 1 });
          const match = list.items.find(
            (item) =>
              item.id === id ||
              item.transactionId === id ||
              item.referenceNumber === id
          );
          if (match) return match;
        }
      }
      throw mapped;
    }
  });
}

export async function refundTransfer(
  reference: string,
  payload: RefundPayload = {}
): Promise<DmtTransaction> {
  return request(async () => {
    const response = await api.post(DMT_ENDPOINTS.refund(reference), payload);
    const data = unwrapApiData<Record<string, unknown>>(response.data);
    return normalizeTransaction(
      (data?.transaction as Record<string, unknown>) ?? data ?? {}
    );
  });
}
