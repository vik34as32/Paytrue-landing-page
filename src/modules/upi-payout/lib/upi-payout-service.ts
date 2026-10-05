import { resolveUpiPayoutService } from "@/features/retailer/store/retailerServicesStore";
import { UPI_PAYOUT_SERVICE_CODE } from "@/src/constants/retailerServices";
import { getCurrentLocation } from "@/src/lib/rdService";
import type {
  UpiPayoutPayInput,
  UpiPayoutPreview,
  UpiPayoutTransaction,
  UpiVpaVerification,
} from "../types";
import {
  apiUpiPayoutList,
  apiUpiPayoutPay,
  apiUpiPayoutPreview,
  apiUpiPayoutReceipt,
  apiUpiPayoutStatus,
  apiUpiVerifyVpa,
} from "./upi-payout-api";
import {
  normalizeUpiPayoutPreview,
  normalizeUpiPayoutTxn,
  normalizeVpaVerification,
  UPI_PAYOUT_REMARKS,
  upiPayoutApiMessage,
} from "./upi-payout-normalizers";

const FALLBACK_LOCATION = { latitude: "20.5936", longitude: "78.9628" };

async function resolveLocation(): Promise<{ latitude: string; longitude: string }> {
  try {
    return await getCurrentLocation();
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

/** POST /upi-payout/vpa/verify */
export async function verifyUpiVpa(vpa: string): Promise<UpiVpaVerification> {
  try {
    const location = await resolveLocation();
    const payload = await apiUpiVerifyVpa({
      vpa,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    return normalizeVpaVerification(payload, vpa);
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "Unable to verify UPI ID"));
  }
}

/** POST /upi-payout/commission/preview */
export async function previewUpiPayout(amount: number): Promise<UpiPayoutPreview> {
  try {
    const service = await resolveServiceFields();
    const payload = await apiUpiPayoutPreview({ amount, ...service });
    return normalizeUpiPayoutPreview(payload, amount);
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "Unable to preview charges"));
  }
}

/** POST /upi-payout/pay */
export async function payUpiPayout(input: UpiPayoutPayInput): Promise<UpiPayoutTransaction> {
  try {
    const [location, service] = await Promise.all([resolveLocation(), resolveServiceFields()]);
    const payload = await apiUpiPayoutPay({
      vpa: input.vpa,
      payeeName: input.payeeName.trim(),
      payeeMobile: input.payeeMobile?.trim() || undefined,
      amount: input.amount,
      remarks: UPI_PAYOUT_REMARKS,
      mpin: input.mpin,
      latitude: location.latitude,
      longitude: location.longitude,
      ...service,
    });
    return normalizeUpiPayoutTxn(payload, {
      vpa: input.vpa,
      payeeName: input.payeeName,
      payeeMobile: input.payeeMobile,
      amount: input.amount,
    });
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "UPI payout failed"));
  }
}

/** GET /upi-payout/transactions */
export async function fetchUpiPayoutTransactions(): Promise<UpiPayoutTransaction[]> {
  try {
    const rows = await apiUpiPayoutList();
    return rows.map((row) => normalizeUpiPayoutTxn(row));
  } catch (error) {
    throw new Error(upiPayoutApiMessage(error, "Unable to load UPI payouts"));
  }
}

/** GET /upi-payout/transaction/status/:reference */
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

/** GET /upi-payout/receipt/:reference, falling back to the status API. */
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
