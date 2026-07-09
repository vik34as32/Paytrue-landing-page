import api from "@/src/lib/axios";
import { UPI_ATM_ENDPOINTS } from "@/src/constants/upiAtmApi";
import { getCurrentLocation } from "@/src/lib/rdService";
import { normalizeUpiAtmTransaction } from "@/src/lib/upiAtmUtils";
import type {
  UpiAtmGenerateQrPayload,
  UpiAtmGenerateQrResponse,
  UpiAtmStatusResponse,
  UpiAtmTransaction,
} from "@/src/types/upiAtm";

const FALLBACK_COORDS = {
  latitude: "28.50937",
  longitude: "77.29727",
};

function createExternalRef(): string {
  return String(Date.now());
}

export async function buildUpiAtmGeneratePayload(input: {
  mobile: string;
  amount: number | string;
}): Promise<UpiAtmGenerateQrPayload> {
  let latitude = FALLBACK_COORDS.latitude;
  let longitude = FALLBACK_COORDS.longitude;

  try {
    const coords = await getCurrentLocation();
    latitude = coords.latitude;
    longitude = coords.longitude;
  } catch {
    // Fallback coordinates when browser location is unavailable.
  }

  return {
    latitude,
    longitude,
    customerMobile: String(input.mobile).trim(),
    amount: String(input.amount).trim(),
    externalRef: createExternalRef(),
  };
}

export async function generateUpiAtmQr(input: {
  mobile: string;
  amount: number | string;
}): Promise<UpiAtmGenerateQrResponse & { transaction: UpiAtmTransaction }> {
  const payload = await buildUpiAtmGeneratePayload(input);
  const response = await api.post(UPI_ATM_ENDPOINTS.generateQr, payload);
  const transaction = normalizeUpiAtmTransaction(response.data);

  return {
    success: Boolean(asRecord(response.data).success ?? true),
    message: String(asRecord(response.data).message || "QR generated successfully"),
    transaction,
    referenceId: transaction.referenceId,
    qrString: transaction.qrString,
    qrImage: transaction.qrImage,
  };
}

export async function fetchUpiAtmStatus(
  referenceId: string
): Promise<UpiAtmStatusResponse & { transaction: UpiAtmTransaction }> {
  const response = await api.get(UPI_ATM_ENDPOINTS.status(referenceId));
  const transaction = normalizeUpiAtmTransaction(response.data);

  return {
    success: Boolean(asRecord(response.data).success ?? true),
    message: String(asRecord(response.data).message || ""),
    status: transaction.status,
    transaction,
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
