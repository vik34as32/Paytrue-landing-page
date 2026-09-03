import type { CcbpPayInput, CcbpTransaction } from "../types";
import { apiCcbpList, apiCcbpPay, apiCcbpReceipt, apiCcbpStatus } from "./ccbp-api";
import { resolveCcbpLocation } from "./ccbp-geo";
import { ccbpApiMessage, normalizeCcbpTxn } from "./ccbp-normalizers";

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

export async function fetchCcbpTransactions(): Promise<CcbpTransaction[]> {
  try {
    const rows = await apiCcbpList();
    return rows.map((row) => normalizeCcbpTxn(row));
  } catch (error) {
    throw new Error(ccbpApiMessage(error, "Unable to load CCBP transactions"));
  }
}

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
