import type {
  CcbpCommissionPreview,
  CcbpPayInput,
  CcbpPaymentType,
  CcbpTransaction,
} from "../types";
import {
  apiCcbpCommissionPreview,
  apiCcbpList,
  apiCcbpPay,
  apiCcbpReceipt,
  apiCcbpStatus,
} from "./ccbp-api";
import { resolveCcbpLocation } from "./ccbp-geo";
import { ccbpApiMessage, normalizeCcbpPreview, normalizeCcbpTxn } from "./ccbp-normalizers";

/** POST /ccbp/commission/preview */
export async function previewCcbpCharges(input: {
  amount: number;
  paymentType: CcbpPaymentType;
}): Promise<CcbpCommissionPreview> {
  try {
    const payload = await apiCcbpCommissionPreview({
      amount: input.amount,
      paymentType: input.paymentType,
    });
    return normalizeCcbpPreview(payload, input.amount);
  } catch (error) {
    throw new Error(ccbpApiMessage(error, "Unable to preview charges"));
  }
}

/** POST /ccbp/pay */
export async function payCreditCardBill(input: CcbpPayInput): Promise<CcbpTransaction> {
  try {
    const location = await resolveCcbpLocation();
    const payload = await apiCcbpPay({
      ifscCode: input.ifscCode.trim().toUpperCase(),
      amount: input.amount,
      payeeName: input.payeeName.trim(),
      payeeMobile: input.payeeMobile.trim(),
      payeeEmail: input.payeeEmail.trim(),
      payerName: input.payerName?.trim() || undefined,
      remarks: input.remarks?.trim().slice(0, 10) || undefined,
      paymentType: input.paymentType,
      creditCardNumber: input.creditCardNumber.replace(/\s+/g, ""),
      latitude: location.latitude,
      longitude: location.longitude,
      mpin: input.mpin,
      consent: "Y",
    });
    return normalizeCcbpTxn(payload, {
      payeeName: input.payeeName,
      payeeMobile: input.payeeMobile,
      payeeEmail: input.payeeEmail,
      creditCardNumber: input.creditCardNumber,
      ifscCode: input.ifscCode,
      amount: input.amount,
      paymentType: input.paymentType,
      remarks: input.remarks,
    });
  } catch (error) {
    throw new Error(ccbpApiMessage(error, "Credit card payment failed"));
  }
}

/** GET /ccbp/transactions */
export async function fetchCcbpTransactions(): Promise<CcbpTransaction[]> {
  try {
    const rows = await apiCcbpList();
    return rows.map((row) => normalizeCcbpTxn(row));
  } catch (error) {
    throw new Error(ccbpApiMessage(error, "Unable to load CCBP transactions"));
  }
}

/** GET /ccbp/transaction/status/:reference */
export async function fetchCcbpStatus(
  reference: string,
  fallback?: Partial<CcbpTransaction>
): Promise<CcbpTransaction> {
  try {
    const payload = await apiCcbpStatus(reference);
    return normalizeCcbpTxn(payload, { ...fallback, reference, id: reference });
  } catch (error) {
    throw new Error(ccbpApiMessage(error, "Unable to fetch payment status"));
  }
}

/** GET /ccbp/receipt/:reference, falling back to the status API. */
export async function fetchCcbpReceipt(reference: string): Promise<CcbpTransaction> {
  try {
    const payload = await apiCcbpReceipt(reference);
    return normalizeCcbpTxn(payload, { reference, id: reference });
  } catch {
    try {
      const payload = await apiCcbpStatus(reference);
      return normalizeCcbpTxn(payload, { reference, id: reference });
    } catch (error) {
      throw new Error(ccbpApiMessage(error, "Receipt not found"));
    }
  }
}
