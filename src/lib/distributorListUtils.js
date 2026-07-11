import {
  mapApiUserShape,
  getRetailerInitials,
  maskRetailerAadhaar,
  maskRetailerPan,
  maskRetailerAccount,
} from "@/src/lib/retailerListUtils";
import { mapApiUserToExistingUrls } from "@/src/lib/buildUserFormData";

export function normalizeDistributor(user = {}) {
  const mapped = mapApiUserShape(user);
  const outlet = mapped.outlet || {};
  const kyc = mapped.kyc || {};
  const bank = mapped.bankAccount || {};
  const firstName = mapped.firstName || "";
  const lastName = mapped.lastName || "";
  const name = `${firstName} ${lastName}`.trim() || mapped.email || "Distributor";

  return {
    id: mapped.id || mapped._id,
    userCode: mapped.userCode || "",
    name,
    firstName,
    lastName,
    email: mapped.email || "",
    mobile: mapped.mobile || "",
    alternateMobileNumber: mapped.alternateMobileNumber || "",
    profileImage: mapped.profileImage || null,
    outletName: outlet.outletName || mapped.shopName || "",
    outletId: outlet.instantpayOutletId || outlet.instantPayOutletId || outlet.outletId || "",
    address: outlet.address || mapped.address || "",
    pincode: outlet.pincode || mapped.pincode || "",
    city: outlet.city || mapped.city || "",
    state: outlet.state || mapped.state || "",
    district: outlet.district || "",
    village: outlet.village || "",
    businessType: outlet.businessType || "",
    gstNumber: outlet.gstNumber || "",
    aadhaarNumber: kyc.aadhaarNumber || "",
    panNumber: kyc.panNumber || "",
    bankName: bank.bankName || "",
    accountHolderName: bank.accountHolderName || "",
    accountNumber: bank.accountNumber || "",
    ifscCode: bank.ifscCode || "",
    walletBalance: mapped.walletBalance || mapped.wallet?.balance || 0,
    status: String(
      mapped.status || (mapped.isActive === false ? "inactive" : "active")
    ).toLowerCase(),
    createdAt: mapped.createdAt,
    media: mapApiUserToExistingUrls(mapped),
    raw: mapped,
  };
}

export {
  getRetailerInitials as getDistributorInitials,
  maskRetailerAadhaar as maskDistributorAadhaar,
  maskRetailerPan as maskDistributorPan,
  maskRetailerAccount as maskDistributorAccount,
};
