import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import dmt3Api from "../services/dmt3.api";
import { resolveDmt3Location } from "../utils/dmt3.utils";
import type {
  Dmt3AddBeneficiaryInput,
  Dmt3Beneficiary,
  Dmt3CommissionPreview,
  Dmt3RetailerContext,
  Dmt3Transaction,
  Dmt3TransferDraft,
  Dmt3TransferMode,
} from "../types/dmt3.types";

export async function fetchBeneficiaries(): Promise<Dmt3Beneficiary[]> {
  return dmt3Api.getBeneficiaries();
}

export async function addBeneficiaryApi(
  input: Dmt3AddBeneficiaryInput
): Promise<Dmt3Beneficiary> {
  const created = await dmt3Api.addBeneficiary(input);
  if (created.id && created.verificationStatus !== "VERIFIED") {
    try {
      return await dmt3Api.verifyBeneficiary(created.id);
    } catch {
      return created;
    }
  }
  return created;
}

export async function verifyBeneficiaryApi(id: string): Promise<Dmt3Beneficiary> {
  return dmt3Api.verifyBeneficiary(id);
}

export async function deleteBeneficiaryApi(id: string): Promise<void> {
  return dmt3Api.deleteBeneficiary(id);
}

export async function previewCommissionApi(input: {
  amount: number;
  transferMode: Dmt3TransferMode;
}): Promise<Dmt3CommissionPreview> {
  return dmt3Api.previewCommission(input);
}

export async function submitTransfer(input: {
  beneficiaryId: string;
  transfer: Dmt3TransferDraft;
  mpin: string;
  clientTxnId: string;
  retailer: Dmt3RetailerContext;
}): Promise<Dmt3Transaction> {
  const location = await resolveDmt3Location();
  const txn = await dmt3Api.initiateTransaction({
    beneficiaryId: input.beneficiaryId,
    amount: input.transfer.amount,
    transferMode: input.transfer.transferMode,
    remarks: input.transfer.remarks,
    mpin: input.mpin,
    latitude: location.latitude,
    longitude: location.longitude,
    clientTxnId: input.clientTxnId,
    senderName: input.retailer.senderName,
    senderMobile: input.retailer.senderMobile,
    email: input.retailer.email,
  });
  refreshRetailerWalletData();
  return txn;
}

export async function fetchTransaction(id: string): Promise<Dmt3Transaction> {
  return dmt3Api.getTransaction(id);
}

export async function enquireTransaction(id: string): Promise<Dmt3Transaction> {
  return dmt3Api.enquireTransaction(id);
}
