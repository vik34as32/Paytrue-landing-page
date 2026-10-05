import { resolveUpiPayoutService } from "@/features/retailer/store/retailerServicesStore";
import { UPI_PAYOUT_SERVICE_CODE } from "@/src/constants/retailerServices";
import { getCurrentLocation } from "@/src/lib/rdService";
import type { UpiPayoutPayInput, UpiPayoutPreview, UpiPayoutTransaction } from "../types";
import {
  apiUpiPayoutList,
  apiUpiPayoutPay,
  apiUpiPayoutPreview,
  apiUpiPayoutReceipt,
  apiUpiPayoutStatus,
} from "./upi-payout-api";
import {
  normalizeUpiPayoutPreview,
  normalizeUpiPayoutTxn,
  sanitizeRemarks,
  UPI_PAYOUT_DEFAULT_REMARKS,
  unwrapRecord,
  upiPayoutApiMessage,
} from "./upi-payout-normalizers";

const FALLBACK_LOCATION = { latitude: "20.5936", longitude: "78.9628" };

async function resolveLocation(): Promise<{ latitude: string; longitude: string }> {
  try {
    const location = await getCurrentLocation();
    return { latitude: String(location.latitude), longitude: String(location.longitude) };
  } catch {
    return FALLBACK_LOCATION;
  }
}

async function resolveServiceFields(): Promise<{ serviceCode: string; serviceId?: string }> {
  try {
    const service = await resolveUpiPayoutService();
    return { serviceCode: service.serviceCode || UPI_PAYOUT_SERVICE_CODE, serviceId: service.serviceId };
  } catch {
    return { serviceCode: UPI_PAYOUT_SERVICE_CODE };
  }
}

/** POST /upi/payout/commission/preview */
export async function previewUpiPayout(amount: number): Promise<UpiPayoutPreview> {
  try {
    const service = await resolveServiceFields();
    const payload = await apiUpiPayoutPreview({ amount, ...service });
    return normalizeUpiPayoutPreview(payload, amount);
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "Unable to preview charges"));
  }
}

/**
 * POST /upi/payout
 * Body matches backend `upiPayoutSchema`: upiId, amount, payeeName, payeeMobile, payeeEmail,
 * remarks (≤10), latitude/longitude (strings), 4-digit mpin, serviceCode/serviceId.
 */
export async function payUpiPayout(input: UpiPayoutPayInput): Promise<UpiPayoutTransaction> {
  let payload: unknown;
  try {
    const [location, service] = await Promise.all([resolveLocation(), resolveServiceFields()]);
    payload = await apiUpiPayoutPay({
      upiId: input.vpa.trim().toLowerCase(),
      amount: input.amount,
      payeeName: input.payeeName.trim(),
      payeeMobile: input.payeeMobile.trim(),
      payeeEmail: input.payeeEmail.trim(),
      remarks: sanitizeRemarks(input.remarks).trim() || UPI_PAYOUT_DEFAULT_REMARKS,
      latitude: location.latitude,
      longitude: location.longitude,
      mpin: input.mpin,
      ...service,
    });
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "UPI payout failed"));
  }

  const root = unwrapRecord(payload);
  const txn = normalizeUpiPayoutTxn(payload, {
    vpa: input.vpa,
    payeeName: input.payeeName,
    payeeMobile: input.payeeMobile,
    payeeEmail: input.payeeEmail,
    amount: input.amount,
  });
  if (root.success === false && !txn.reference) {
    throw new Error(upiPayoutApiMessage({ data: root }, "UPI payout failed"));
  }
  return txn;
}

/** GET /upi/payout/transactions */
export async function fetchUpiPayoutTransactions(): Promise<UpiPayoutTransaction[]> {
  try {
    const rows = await apiUpiPayoutList();
    return rows.map((row) => normalizeUpiPayoutTxn(row));
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "Unable to load UPI payouts"));
  }
}

/** GET /upi/payout/status/:reference — backend re-checks NiFi while the txn is open. */
export async function fetchUpiPayoutStatus(
  reference: string,
  fallback?: Partial<UpiPayoutTransaction>
): Promise<UpiPayoutTransaction> {
  try {
    const payload = await apiUpiPayoutStatus(reference);
    return normalizeUpiPayoutTxn(payload, { ...fallback, reference, id: reference });
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "Unable to fetch payout status"));
  }
}

/** GET /upi/payout/receipt/:reference, falling back to the status API. */
export async function fetchUpiPayoutReceipt(reference: string): Promise<UpiPayoutTransaction> {
  try {
    const payload = await apiUpiPayoutReceipt(reference);
    return normalizeUpiPayoutTxn(payload, { reference, id: reference });
  } catch {
    try {
      const payload = await apiUpiPayoutStatus(reference);
      return normalizeUpiPayoutTxn(payload, { reference, id: reference });
    } catch (error) {
      throw new Error(upiPayoutApiMessage(error, "Receipt not found"));
    }
  }
}
