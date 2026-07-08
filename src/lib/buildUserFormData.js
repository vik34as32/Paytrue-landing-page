import { resolveRetailerNameFields } from "@/src/lib/userNameUtils";
import { USER_FILE_FIELDS } from "@/src/constants/uploadConfig";

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, String(value));
  }
}

function appendFileIfPresent(formData, key, file) {
  if (file instanceof File) {
    formData.append(key, file);
  }
}

/**
 * Build multipart/form-data for POST/PUT /users
 * @param {object} values - form text values
 * @param {object} files - map of form field → File
 * @param {{ userType: string, includePassword?: boolean }} options
 */
export function buildUserFormData(values, files = {}, options = {}) {
  const { userType, includePassword = true } = options;
  const formData = new FormData();

  if (userType === "RETAILER") {
    const { firstName, lastName } = resolveRetailerNameFields(values);
    appendIfPresent(formData, "firstName", firstName);
    appendIfPresent(formData, "lastName", lastName);
  } else {
    appendIfPresent(formData, "firstName", values.firstName);
    appendIfPresent(formData, "lastName", values.lastName);
  }
  appendIfPresent(formData, "email", values.email);
  appendIfPresent(formData, "mobile", values.mobile);
  appendIfPresent(formData, "alternateMobileNumber", values.alternateMobileNumber);
  appendIfPresent(formData, "userType", userType);
  appendIfPresent(formData, "gender", values.gender);
  appendIfPresent(formData, "dateOfBirth", values.dateOfBirth);
  appendIfPresent(formData, "address", values.address);
  appendIfPresent(formData, "state", values.state);
  appendIfPresent(formData, "city", values.city);
  appendIfPresent(formData, "pincode", values.pincode);

  if (includePassword && values.password) {
    appendIfPresent(formData, "password", values.password);
  }

  formData.append(
    "outlet",
    JSON.stringify({
      outletName: values.outletName,
      businessType: values.businessType,
      gstNumber: values.gstNumber,
      address: values.address,
      state: values.state,
      district: values.district,
      city: values.city,
      village: values.village,
      pincode: values.pincode,
      latitude: values.latitude,
      longitude: values.longitude,
    })
  );

  const kycPayload = {
    panNumber: values.panNumber ? String(values.panNumber).toUpperCase() : "",
  };
  if (userType === "RETAILER") {
    kycPayload.aadhaarNumber = values.aadhaarNumber || "";
  }
  formData.append("kyc", JSON.stringify(kycPayload));

  formData.append(
    "bankAccount",
    JSON.stringify({
      accountHolderName: values.accountHolderName,
      bankName: values.bankName,
      accountNumber: values.accountNumber,
      ifscCode: values.ifscCode ? String(values.ifscCode).toUpperCase() : "",
    })
  );

  Object.entries(USER_FILE_FIELDS).forEach(([formKey, apiKey]) => {
    appendFileIfPresent(formData, apiKey, files[formKey]);
  });

  return formData;
}

export function mapApiUserToFormValues(user = {}) {
  const outlet = user.outlet || {};
  const kyc = user.kyc || {};
  const bank = user.bankDetails || user.bankAccount || {};

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    fullName: user.firstName || "",
    email: user.email || "",
    emailVerified: Boolean(user.emailVerified ?? user.isEmailVerified),
    mobile: user.mobile || "",
    password: "",
    alternateMobileNumber: user.alternateMobileNumber || "",
    gender: user.gender || "",
    dateOfBirth: user.dateOfBirth || user.dob || "",
    outletName: outlet.outletName || "",
    businessType: outlet.businessType || "",
    gstNumber: outlet.gstNumber || "",
    address: outlet.address || user.address || "",
    state: outlet.state || user.state || "",
    district: outlet.district || "",
    city: outlet.city || user.city || "",
    village: outlet.village || "",
    pincode: outlet.pincode || user.pincode || "",
    latitude: outlet.latitude != null ? String(outlet.latitude) : "",
    longitude: outlet.longitude != null ? String(outlet.longitude) : "",
    aadhaarNumber: kyc.aadhaarNumber || "",
    panNumber: kyc.panNumber || "",
    accountHolderName: bank.accountHolderName || "",
    bankName: bank.bankName || "",
    accountNumber: bank.accountNumber || "",
    confirmAccountNumber: bank.accountNumber || "",
    ifscCode: bank.ifscCode || "",
  };
}

export function mapApiUserToExistingUrls(user = {}) {
  const kyc = user.kyc || {};
  const bank = user.bankDetails || user.bankAccount || {};

  return {
    profileImage: user.profileImage || null,
    aadhaarFront: kyc.aadhaarFrontUrl || kyc.aadhaarFrontImage || kyc.aadhaarFront || null,
    aadhaarBack: kyc.aadhaarBackUrl || kyc.aadhaarBackImage || kyc.aadhaarBack || null,
    panCard: kyc.panCardUrl || kyc.panCardImage || kyc.panCard || null,
    ownerPhoto: kyc.ownerPhotoUrl || kyc.ownerPhoto || null,
    videoVerification: kyc.videoVerificationUrl || kyc.videoVerification || null,
    passbookImage: bank.passbookImage || bank.passbookImageUrl || null,
    cancelledChequeImage: bank.cancelledChequeImage || bank.cancelledChequeImageUrl || null,
  };
}
