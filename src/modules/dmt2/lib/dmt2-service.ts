import type {
  Dmt2Beneficiary,
  Dmt2Gender,
  Dmt2Retailer,
  Dmt2Transaction,
  Dmt2TransferDraft,
  MockOtpResult,
  SearchRetailerResult,
} from "../types";
import {
  apiAddBeneficiary,
  apiGetRemitter,
  apiListBeneficiaries,
  apiListTransactions,
  apiPayout,
  apiReceipt,
  apiRegisterRemitter,
  apiTransactionStatus,
  apiVerifyBeneficiary,
  apiVerifyRemitterOtp,
} from "./dmt2-api";
import { resolveDmt2Location } from "./dmt2-geo";
import {
  dmt2ApiMessage,
  normalizeBeneficiary,
  normalizeRemitter,
  normalizeTransaction,
  pickApiMessage,
} from "./dmt2-normalizers";

export async function searchRetailer(mobile: string): Promise<SearchRetailerResult> {
  try {
    const payload = await apiGetRemitter(mobile);
    if (!payload) {
      return { found: false, retailer: null };
    }
    const retailer = normalizeRemitter(payload, mobile);
    return { found: true, retailer };
  } catch (error) {
    throw new Error(dmt2ApiMessage(error, "Unable to search remitter"));
  }
}

export async function sendRetailerOtp(input: {
  mobile: string;
  name?: string;
}): Promise<MockOtpResult> {
  try {
    const location = await resolveDmt2Location();
    const payload = await apiRegisterRemitter({
      mobile: input.mobile,
      name: input.name?.trim() || undefined,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    const message = pickApiMessage(payload, "OTP sent to mobile number");
    return { success: true, message, payload };
  } catch (error) {
    return { success: false, message: dmt2ApiMessage(error, "Unable to send OTP") };
  }
}

export async function verifyRetailerOtp(input: {
  mobile: string;
  otp: string;
}): Promise<MockOtpResult & { retailer?: Dmt2Retailer }> {
  try {
    const location = await resolveDmt2Location();
    const payload = await apiVerifyRemitterOtp({
      mobile: input.mobile,
      otp: input.otp,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    const retailer = normalizeRemitter(payload, input.mobile);
    return {
      success: true,
      message: pickApiMessage(payload, "Mobile number verified"),
      retailer: { ...retailer, otpVerified: true, registered: true },
    };
  } catch (error) {
    return { success: false, message: dmt2ApiMessage(error, "Invalid OTP") };
  }
}

export async function fetchBeneficiaries(input: {
  remitterMobile?: string;
  remitterId?: string;
}): Promise<Dmt2Beneficiary[]> {
  try {
    const mobile = String(input.remitterMobile || "").trim();
    const rows = await apiListBeneficiaries({
      remitterMobile: mobile || undefined,
      remitterId: input.remitterId,
      page: 1,
      limit: 100,
    });
    return rows
      .map((row) => normalizeBeneficiary(row, mobile))
      .filter((row) => row.id || row.accountNumber || row.name);
  } catch (error) {
    throw new Error(dmt2ApiMessage(error, "Unable to load beneficiaries"));
  }
}

export async function addBeneficiaryApi(input: {
  remitterMobile: string;
  remitterId?: string;
  name: string;
  accountNumber: string;
  ifsc: string;
  mobile: string;
}): Promise<Dmt2Beneficiary> {
  try {
    const location = await resolveDmt2Location();
    const payload = await apiAddBeneficiary({
      remitterMobile: input.remitterMobile,
      remitterId: input.remitterId,
      name: input.name,
      accountNumber: input.accountNumber,
      ifscCode: input.ifsc,
      accountType: "SAVING",
      mobile: input.mobile,
      latitude: location.latitude,
      longitude: location.longitude,
      syncProvider: true,
    });
    const beneficiary = normalizeBeneficiary(payload, input.remitterMobile);
    if (beneficiary.id) {
      try {
        const verified = await apiVerifyBeneficiary({
          beneficiaryId: beneficiary.id,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        return { ...normalizeBeneficiary(verified, input.remitterMobile), verified: true };
      } catch {
        return beneficiary;
      }
    }
    return beneficiary;
  } catch (error) {
    throw new Error(dmt2ApiMessage(error, "Unable to add beneficiary"));
  }
}

export async function verifyBeneficiaryApi(beneficiaryId: string): Promise<Dmt2Beneficiary> {
  try {
    const location = await resolveDmt2Location();
    const payload = await apiVerifyBeneficiary({
      beneficiaryId,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    return { ...normalizeBeneficiary(payload), verified: true };
  } catch (error) {
    throw new Error(dmt2ApiMessage(error, "Unable to verify beneficiary"));
  }
}

export async function submitTransfer(input: {
  retailer: Dmt2Retailer;
  beneficiary: Dmt2Beneficiary;
  transfer: Dmt2TransferDraft;
  mpin: string;
}): Promise<Dmt2Transaction> {
  try {
    const location = await resolveDmt2Location();
    const remarks = (input.transfer.purpose || "DMT2").replace(/\s+/g, " ").slice(0, 10);
    const payload = await apiPayout(input.transfer.mode, {
      beneficiaryId: input.beneficiary.id,
      amount: input.transfer.amount,
      transferMode: input.transfer.mode,
      remarks,
      mpin: input.mpin,
      latitude: location.latitude,
      longitude: location.longitude,
      payerName: input.retailer.fullName || undefined,
      remitterMobile: input.retailer.mobile,
    });
    return normalizeTransaction(payload, {
      customerName: input.beneficiary.name,
      accountNumber: input.beneficiary.accountNumber,
      ifsc: input.beneficiary.ifsc,
      customerMobile: input.beneficiary.mobile,
      amount: input.transfer.amount,
      mode: input.transfer.mode,
      purpose: remarks,
    });
  } catch (error) {
    throw new Error(dmt2ApiMessage(error, "Transfer failed"));
  }
}

export async function fetchTransactions(): Promise<Dmt2Transaction[]> {
  try {
    const rows = await apiListTransactions();
    return rows.map((row) => normalizeTransaction(row));
  } catch (error) {
    throw new Error(dmt2ApiMessage(error, "Unable to load transactions"));
  }
}

export async function fetchReceipt(reference: string): Promise<Dmt2Transaction> {
  try {
    const payload = await apiReceipt(reference);
    return normalizeTransaction(payload, { id: reference });
  } catch {
    try {
      const payload = await apiTransactionStatus(reference);
      return normalizeTransaction(payload, { id: reference });
    } catch (error) {
      throw new Error(dmt2ApiMessage(error, "Receipt not found"));
    }
  }
}

export function buildRetailer(input: {
  mobile: string;
  fullName: string;
  gender: Dmt2Gender;
}): Dmt2Retailer {
  return {
    mobile: input.mobile,
    fullName: input.fullName.trim(),
    gender: input.gender,
    otpVerified: false,
    registered: false,
  };
}
