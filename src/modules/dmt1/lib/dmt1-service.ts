import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import dmt1Api from "../services/dmt1.api";
import { normalizeRemitter, pickApiMessage } from "../services/dmt1.mapper";
import { buildDmt1TransferRemarks, resolveDmt1Location } from "../utils/dmt1.utils";
import { DMT1_MAX_TRANSFER_AMOUNT, DMT1_MIN_TRANSFER_AMOUNT } from "./dmt1-constants";
import { resolveDmt1Service } from "@/features/retailer/store/retailerServicesStore";
import type {
  Dmt1AddBeneficiaryInput,
  Dmt1Beneficiary,
  Dmt1CommissionPreview,
  Dmt1Remitter,
  Dmt1RetailerContext,
  Dmt1Transaction,
  Dmt1TransferDraft,
  Dmt1TransferMode,
} from "../types/dmt1.types";

export async function searchRemitter(mobile: string): Promise<{
  found: boolean;
  remitter: Dmt1Remitter | null;
  beneficiaries: Dmt1Beneficiary[];
}> {
  const result = await dmt1Api.getRemitter(mobile);
  if (!result) return { found: false, remitter: null, beneficiaries: [] };
  return {
    found: true,
    remitter: result.remitter,
    beneficiaries: result.beneficiaries,
  };
}

export async function registerRemitterOtp(input: {
  mobile: string;
  name?: string;
  email?: string;
}): Promise<{ success: boolean; message: string; payload?: unknown }> {
  try {
    const payload = await dmt1Api.registerRemitter({
      mobile: input.mobile,
      name: input.name?.trim() || undefined,
      email: input.email?.trim() || undefined,
    });
    return {
      success: true,
      message: pickApiMessage(payload, "OTP sent to mobile number"),
      payload,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to send OTP",
    };
  }
}

export async function resendRemitterOtp(mobile: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const payload = await dmt1Api.resendRemitterOtp(mobile);
    return {
      success: true,
      message: pickApiMessage(payload, "OTP resent successfully"),
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to resend OTP",
    };
  }
}

export async function verifyRemitterOtp(input: {
  mobile: string;
  otp: string;
}): Promise<{ success: boolean; message: string; remitter?: Dmt1Remitter }> {
  try {
    const payload = await dmt1Api.verifyRemitterOtp(input);
    const remitter = normalizeRemitter(payload, input.mobile);
    return {
      success: true,
      message: pickApiMessage(payload, "Mobile number verified"),
      remitter: { ...remitter, otpVerified: true, registered: true },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Invalid OTP",
    };
  }
}

export async function fetchBeneficiaries(input?: {
  remitterMobile?: string;
  remitterId?: string;
}): Promise<Dmt1Beneficiary[]> {
  const mobile = String(input?.remitterMobile || "").trim();
  const remitterId = String(input?.remitterId || "").trim();

  const fromRemitter = mobile
    ? ((await dmt1Api.getRemitter(mobile))?.beneficiaries ?? [])
    : [];

  if (fromRemitter.length) return fromRemitter;

  // Remitter GET may omit nested list — load dedicated beneficiaries API
  try {
    return await dmt1Api.getBeneficiaries({
      remitterMobile: mobile || undefined,
      remitterId: remitterId || undefined,
      page: 1,
      limit: 100,
    });
  } catch {
    return fromRemitter;
  }
}

export async function addBeneficiaryApi(
  input: Dmt1AddBeneficiaryInput
): Promise<Dmt1Beneficiary> {
  const location = await resolveDmt1Location();
  const created = await dmt1Api.addBeneficiary({
    ...input,
    latitude: location.latitude,
    longitude: location.longitude,
  });
  if (created.id && created.verificationStatus !== "VERIFIED") {
    try {
      return await dmt1Api.verifyBeneficiary(created.id, location);
    } catch {
      return created;
    }
  }
  return created;
}

export async function verifyBeneficiaryApi(id: string): Promise<Dmt1Beneficiary> {
  const location = await resolveDmt1Location();
  return dmt1Api.verifyBeneficiary(id, location);
}

export async function deleteBeneficiaryApi(id: string): Promise<void> {
  return dmt1Api.deleteBeneficiary(id);
}

export async function previewCommissionApi(input: {
  amount: number;
  transferMode: Dmt1TransferMode;
}): Promise<Dmt1CommissionPreview> {
  const service = await resolveDmt1Service();
  return dmt1Api.previewCommission({
    ...input,
    serviceId: service.serviceId,
    serviceCode: service.serviceCode,
  });
}

export async function generateTransactionOtpApi(input: {
  remitterMobile: string;
  amount: number;
  referenceKey?: string;
}): Promise<{ message: string; referenceKey?: string }> {
  const result = await dmt1Api.generateTransactionOtp({
    remitterMobileNumber: input.remitterMobile,
    amount: input.amount,
    referenceKey: input.referenceKey,
  });
  return {
    message: result.message,
    referenceKey: result.referenceKey,
  };
}

export async function submitTransfer(input: {
  beneficiaryId: string;
  transfer: Dmt1TransferDraft;
  mpin: string;
  otp: string;
  referenceKey: string;
  clientTxnId: string;
  remitter?: Dmt1Remitter | null;
  retailer: Dmt1RetailerContext;
}): Promise<Dmt1Transaction> {
  if (Number(input.transfer.amount) < DMT1_MIN_TRANSFER_AMOUNT) {
    throw new Error("This transaction is valid for ₹100 and above.");
  }
  if (Number(input.transfer.amount) > DMT1_MAX_TRANSFER_AMOUNT) {
    throw new Error("Maximum ₹50,000 allowed per DMT1 transaction.");
  }
  const otp = String(input.otp || "").trim();
  if (!/^\d{4,8}$/.test(otp)) {
    throw new Error("Enter the InstantPay transaction OTP (4–8 digits).");
  }
  const referenceKey = String(input.referenceKey || "").trim();
  if (!referenceKey) {
    throw new Error(
      "InstantPay reference key missing. Complete biometric eKYC and resend OTP."
    );
  }
  const location = await resolveDmt1Location();
  const service = await resolveDmt1Service();
  const remitterMobile =
    input.remitter?.mobile || input.retailer.senderMobile || "";
  const txn = await dmt1Api.payout({
    beneficiaryId: input.beneficiaryId,
    amount: input.transfer.amount,
    transferMode: "IMPS",
    remarks: buildDmt1TransferRemarks(input.transfer.amount),
    mpin: input.mpin,
    otp,
    referenceKey,
    latitude: location.latitude,
    longitude: location.longitude,
    clientTxnId: input.clientTxnId,
    externalRef: input.clientTxnId,
    payerName: input.remitter?.fullName || input.retailer.senderName,
    remitterMobile,
    remitterMobileNumber: remitterMobile,
    email: input.remitter?.email || input.retailer.email,
    serviceId: service.serviceId,
    serviceCode: service.serviceCode,
  });
  refreshRetailerWalletData();
  return txn;
}

export async function fetchTransaction(id: string): Promise<Dmt1Transaction> {
  try {
    return await dmt1Api.getReceipt(id);
  } catch {
    try {
      return await dmt1Api.getTransaction(id);
    } catch {
      return dmt1Api.getStatus(id);
    }
  }
}

export async function fetchTransactionStatus(
  reference: string
): Promise<Dmt1Transaction> {
  return dmt1Api.getStatus(reference);
}

export async function enquireTransaction(id: string): Promise<Dmt1Transaction> {
  return dmt1Api.enquireTransaction(id);
}
