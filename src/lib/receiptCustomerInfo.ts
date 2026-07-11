import { getUserDisplayName } from "@/src/lib/userUtils";
import { RETAILER_USER } from "@/features/retailer/constants";
import type { ReceiptCustomerInfo } from "@/types/statementReceipt";

type AuthUser = {
  mobile?: string;
  phoneNumber?: string;
  phone?: string;
  userId?: string;
  retailerId?: string;
  retailerCode?: string;
  city?: string;
  state?: string;
  address?: { city?: string; state?: string };
} | null;

export function buildReceiptCustomerInfo(
  user: AuthUser,
  fallbackName = "Retailer"
): ReceiptCustomerInfo {
  const customerName = getUserDisplayName(user, fallbackName);

  return {
    customerName,
    mobile:
      user?.mobile ||
      user?.phoneNumber ||
      user?.phone ||
      RETAILER_USER.mobile,
    retailerId:
      user?.userId ||
      user?.retailerId ||
      user?.retailerCode ||
      RETAILER_USER.retailerId,
    outletName: `${customerName} Digital Services`,
    location:
      user?.city ||
      user?.address?.city ||
      user?.state ||
      user?.address?.state ||
      "India",
  };
}
