import { mapApiUserToExistingUrls } from "@/src/lib/buildUserFormData";
import { maskAadhaar, maskAccountNumber, maskPan } from "@/src/lib/profileUtils";

export function mapApiUserShape(user = {}) {
  const profile = user.profile || {};
  const outlet = user.outlet || {};
  const kyc = user.kycDocument || user.kyc || {};
  const bank = user.bankAccount || user.bankDetails || {};

  return {
    ...user,
    alternateMobileNumber:
      profile.alternateMobileNumber || user.alternateMobileNumber || "",
    profileImage: profile.profileImage || user.profileImage || null,
    outlet,
    kyc,
    kycDocument: kyc,
    bankAccount: bank,
    bankDetails: bank,
  };
}

export function normalizeRetailer(user = {}) {
  const mapped = mapApiUserShape(user);
  const outlet = mapped.outlet || {};
  const kyc = mapped.kyc || {};
  const bank = mapped.bankAccount || {};
  const firstName = mapped.firstName || "";
  const lastName = mapped.lastName || "";
  const name = `${firstName} ${lastName}`.trim() || mapped.email || "Retailer";

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

export function maskRetailerAadhaar(value) {
  if (!value) return "—";
  try {
    return maskAadhaar(String(value));
  } catch {
    return "—";
  }
}

export function maskRetailerPan(value) {
  return maskPan(value);
}

export function maskRetailerAccount(value) {
  if (!value) return "—";
  return maskAccountNumber(String(value));
}

export function getRetailerInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "R";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}
