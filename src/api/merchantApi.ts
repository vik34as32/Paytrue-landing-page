import api from "@/src/lib/axios";
import { MERCHANT_ENDPOINTS } from "@/src/constants/merchantApi";
import {
  appendProviderSpKeyFields,
  mapMerchantError,
  normalizeBiometricKycSubmit,
  normalizeMerchantStatus,
} from "@/src/lib/merchantUtils";
import { parsePidXmlToBiometricData } from "@/src/lib/pidParser";
import type {
  MerchantStatusResult,
  SubmitBiometricKycRequest,
  SubmitBiometricKycResult,
} from "@/src/types/merchant";

export interface MerchantBiometricStatusRequest {
  retailerId?: string;
  outletId?: string;
  spKey?: string;
}

async function request<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw mapMerchantError(error);
  }
}

function buildStatusBody(
  requestParams: MerchantBiometricStatusRequest | string = {}
): Record<string, unknown> {
  const params =
    typeof requestParams === "string"
      ? { retailerId: requestParams }
      : requestParams;

  const body: Record<string, unknown> = {};

  if (params.retailerId?.trim()) body.retailerId = params.retailerId.trim();
  if (params.outletId?.trim()) body.outletId = params.outletId.trim();
  appendProviderSpKeyFields(body, params.spKey);

  return body;
}

/** POST /merchant/biometric-status — returns outlet reference fields for KYC submit */
export async function fetchMerchantBiometricStatus(
  requestParams: MerchantBiometricStatusRequest | string = {}
): Promise<MerchantStatusResult> {
  return request(async () => {
    const { data } = await api.post(
      MERCHANT_ENDPOINTS.biometricStatus,
      buildStatusBody(requestParams)
    );
    return normalizeMerchantStatus(data);
  });
}

export async function fetchMerchantStatus(
  requestParams: MerchantBiometricStatusRequest | string = {}
): Promise<MerchantStatusResult> {
  return request(async () => {
    try {
      return await fetchMerchantBiometricStatus(requestParams);
    } catch (primaryError) {
      try {
        const { data } = await api.get(MERCHANT_ENDPOINTS.status);
        return normalizeMerchantStatus(data);
      } catch {
        throw primaryError;
      }
    }
  });
}

export async function submitMerchantBiometricKyc(
  payload: SubmitBiometricKycRequest
): Promise<SubmitBiometricKycResult> {
  return request(async () => {
    const biometricData =
      typeof payload.biometricData === "string"
        ? parsePidXmlToBiometricData(payload.biometricData)
        : payload.biometricData;

    const body: Record<string, unknown> = {
      retailerId: payload.retailerId,
      biometricData,
      referenceKey: payload.referenceKey,
      referenceKeyType: payload.referenceKeyType,
    };

    if (payload.outletId?.trim()) body.outletId = payload.outletId.trim();
    appendProviderSpKeyFields(body, payload.spKey);
    if (payload.pidOptionWadh?.trim()) {
      body.pidOptionWadh = payload.pidOptionWadh.trim();
    }

    const { data } = await api.post(MERCHANT_ENDPOINTS.biometricKyc, body);
    return normalizeBiometricKycSubmit(data);
  });
}
