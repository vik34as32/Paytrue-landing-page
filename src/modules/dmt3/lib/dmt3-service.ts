import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import dmt3Api from "../services/dmt3.api";
import { normalizeRemitter, pickApiMessage } from "../services/dmt3.mapper";
import { buildDmt3TransferRemarks, resolveDmt3Location } from "../utils/dmt3.utils";
import { resolveDmt3Service } from "@/features/retailer/store/retailerServicesStore";
import type {
  Dmt3AddBeneficiaryInput,
  Dmt3Beneficiary,
  Dmt3CommissionPreview,
  Dmt3Remitter,
  Dmt3RetailerContext,
  Dmt3Transaction,
  Dmt3TransferDraft,
  Dmt3TransferMode,
} from "../types/dmt3.types";

export async function searchRemitter(mobile: string): Promise<{
  found: boolean;
  remitter: Dmt3Remitter | null;
}> {
  const remitter = await dmt3Api.getRemitter(mobile);
  if (!remitter) return { found: false, remitter: null };
  return { found: true, remitter };
}

export async function registerRemitterOtp(input: {
  mobile: string;
  name?: string;
  email?: string;
}): Promise<{ success: boolean; message: string; payload?: unknown }> {
  try {
    const payload = await dmt3Api.registerRemitter({
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
    const payload = await dmt3Api.resendRemitterOtp(mobile);
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
}): Promise<{ success: boolean; message: string; remitter?: Dmt3Remitter }> {
  try {
    const payload = await dmt3Api.verifyRemitterOtp(input);
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
}): Promise<Dmt3Beneficiary[]> {
  return dmt3Api.getBeneficiaries(input);
}

export async function addBeneficiaryApi(
  input: Dmt3AddBeneficiaryInput
): Promise<Dmt3Beneficiary> {
  const location = await resolveDmt3Location();
  const created = await dmt3Api.addBeneficiary({
    ...input,
    latitude: location.latitude,
    longitude: location.longitude,
  });
  if (created.id && created.verificationStatus !== "VERIFIED") {
    try {
      return await dmt3Api.verifyBeneficiary(created.id, location);
    } catch {
      return created;
    }
  }
  return created;
}

export async function verifyBeneficiaryApi(id: string): Promise<Dmt3Beneficiary> {
  const location = await resolveDmt3Location();
  return dmt3Api.verifyBeneficiary(id, location);
}

export async function deleteBeneficiaryApi(id: string): Promise<void> {
  return dmt3Api.deleteBeneficiary(id);
}

export async function previewCommissionApi(input: {
  amount: number;
  transferMode: Dmt3TransferMode;
}): Promise<Dmt3CommissionPreview> {
  const service = await resolveDmt3Service();
  return dmt3Api.previewCommission({
    ...input,
    serviceId: service.serviceId,
    serviceCode: service.serviceCode,
  });
}

export async function submitTransfer(input: {
  beneficiaryId: string;
  transfer: Dmt3TransferDraft;
  mpin: string;
  clientTxnId: string;
  remitter?: Dmt3Remitter | null;
  retailer: Dmt3RetailerContext;
}): Promise<Dmt3Transaction> {
  const location = await resolveDmt3Location();
  const service = await resolveDmt3Service();
  const txn = await dmt3Api.payout({
    beneficiaryId: input.beneficiaryId,
    amount: input.transfer.amount,
    transferMode: "IMPS",
    remarks: buildDmt3TransferRemarks(input.transfer.amount),
    mpin: input.mpin,
    latitude: location.latitude,
    longitude: location.longitude,
    clientTxnId: input.clientTxnId,
    payerName: input.remitter?.fullName || input.retailer.senderName,
    remitterMobile: input.remitter?.mobile || input.retailer.senderMobile,
    email: input.remitter?.email || input.retailer.email,
    serviceId: service.serviceId,
    serviceCode: service.serviceCode,
  });
  refreshRetailerWalletData();
  return txn;
}

export async function fetchTransaction(id: string): Promise<Dmt3Transaction> {
  try {
    return await dmt3Api.getReceipt(id);
  } catch {
    try {
      return await dmt3Api.getTransaction(id);
    } catch {
      return dmt3Api.getStatus(id);
    }
  }
}

export async function fetchTransactionStatus(
  reference: string
): Promise<Dmt3Transaction> {
  return dmt3Api.getStatus(reference);
}

export async function enquireTransaction(id: string): Promise<Dmt3Transaction> {
  return dmt3Api.enquireTransaction(id);
}
