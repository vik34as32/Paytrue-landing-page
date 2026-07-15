import api from "@/src/lib/axios";
import { UPI_ATM_ENDPOINTS } from "@/src/constants/upiAtmApi";
import { getCurrentLocation } from "@/src/lib/rdService";
import { normalizeUpiAtmTransaction } from "@/src/lib/upiAtmUtils";
import { resolveUpiCashPointServiceId } from "@/features/retailer/store/retailerServicesStore";
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
}): Promise<UpiAtmGenerateQrPayload & { serviceId: string }> {
  let latitude = FALLBACK_COORDS.latitude;
  let longitude = FALLBACK_COORDS.longitude;

  try {
    const coords = await getCurrentLocation();
    latitude = coords.latitude;
    longitude = coords.longitude;
  } catch {
    // Fallback coordinates when browser location is unavailable.
  }

  const serviceId = await resolveUpiCashPointServiceId();

  return {
    latitude,
    longitude,
    customerMobile: String(input.mobile).trim(),
    amount: String(input.amount).trim(),
    externalRef: createExternalRef(),
    serviceId,
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
  const serviceId = await resolveUpiCashPointServiceId();
  const response = await api.get(UPI_ATM_ENDPOINTS.status(referenceId), {
    params: { serviceId },
  });
  const transaction = normalizeUpiAtmTransaction(response.data);

  return {
    success: Boolean(asRecord(response.data).success ?? true),
    message: String(asRecord(response.data).message || ""),
    status: transaction.status,
    transaction,
  };
}

export interface UpiAtmHistoryFilters {
  page?: number;
  limit?: number;
}

export interface UpiAtmHistoryResult {
  items: UpiAtmTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function fetchUpiAtmHistory(
  filters: UpiAtmHistoryFilters = {}
): Promise<UpiAtmHistoryResult> {
  const serviceId = await resolveUpiCashPointServiceId();
  const pageNum = filters.page ?? 1;
  const limitNum = filters.limit ?? 100;
  const params: Record<string, string | number> = {
    page: pageNum,
    limit: limitNum,
    serviceId,
  };

  const response = await api.get(UPI_ATM_ENDPOINTS.history, { params });
  const root = asRecord(response.data);
  const rows = Array.isArray(root.data)
    ? root.data
    : Array.isArray(asRecord(root.data).items)
      ? (asRecord(root.data).items as unknown[])
      : [];

  const paginationRaw =
    asRecord(root.pagination) || asRecord(asRecord(root.data).pagination);

  const total = Number(paginationRaw.total ?? rows.length) || rows.length;
  const page = Number(paginationRaw.page ?? pageNum) || pageNum;
  const limit = Number(paginationRaw.limit ?? limitNum) || limitNum;
  const totalPages =
    Number(paginationRaw.totalPages ?? (Math.ceil(total / limit) || 1)) || 1;

  return {
    items: rows.map((row) => normalizeUpiAtmTransaction(row)),
    pagination: { page, limit, total, totalPages },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
