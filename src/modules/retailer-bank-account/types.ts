export type RetailerBankLinkStatus = "NOT_LINKED" | "LINKED" | "PENDING" | "FAILED";

export interface RetailerBankAccount {
  status: RetailerBankLinkStatus | string;
  accountNumberMasked: string | null;
  ifscCode: string | null;
  bankName: string | null;
  accountHolderName: string | null;
  linkedAt: string | null;
  ipayUuid: string | null;
  message: string | null;
}

export interface AddRetailerBankAccountInput {
  bankAccountNo: string;
  confirmBankAccountNo: string;
  bankIfsc: string;
  latitude: string;
  longitude: string;
}

export interface AddRetailerBankAccountResult {
  account: RetailerBankAccount;
  message: string;
  linked: boolean;
  pending: boolean;
}
