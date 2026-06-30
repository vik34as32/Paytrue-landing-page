import { USER_FILE_FIELDS } from "@/src/constants/uploadConfig";

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, String(value));
  }
}

function appendNested(formData, prefix, obj) {
  if (!obj) return;
  Object.entries(obj).forEach(([key, value]) => {
    appendIfPresent(formData, `${prefix}[${key}]`, value);
  });
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

  appendIfPresent(formData, "firstName", values.firstName);
  appendIfPresent(formData, "lastName", values.lastName);
  appendIfPresent(formData, "email", values.email);
  appendIfPresent(formData, "mobile", values.mobile);
  appendIfPresent(formData, "alternateMobileNumber", values.alternateMobileNumber);
  appendIfPresent(formData, "userType", userType);

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

 formData.append("kyc", JSON.stringify({
  aadhaarNumber: values.aadhaarNumber,
  panNumber: values.panNumber
}));


  formData.append("bankAccount", JSON.stringify({
  accountHolderName: values.accountHolderName,
  bankName: values.bankName,
  accountNumber: values.accountNumber,
  ifscCode: values.ifscCode
}));



  Object.entries(USER_FILE_FIELDS).forEach(([formKey, apiKey]) => {
    appendFileIfPresent(formData, apiKey, files[formKey]);
  });

  return formData;
}

export function mapApiUserToFormValues(user = {}) {
  const outlet = user.outlet || {};
  const kyc = user.kyc || {};
  const bank = user.bankAccount || {};

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    mobile: user.mobile || "",
    password: "",
    alternateMobileNumber: user.alternateMobileNumber || "",
    outletName: outlet.outletName || "",
    businessType: outlet.businessType || "",
    gstNumber: outlet.gstNumber || "",
    address: outlet.address || "",
    state: outlet.state || outlet.state || user.state || "",
    district: outlet.district || "",
    city: outlet.city || user.city || "",
    village: outlet.village || "",
    pincode: outlet.pincode || "",
    latitude: outlet.latitude || "",
    longitude: outlet.longitude || "",
    aadhaarNumber: kyc.aadhaarNumber || "",
    panNumber: kyc.panNumber || "",
    accountHolderName: bank.accountHolderName || "",
    bankName: bank.bankName || "",
    accountNumber: bank.accountNumber || "",
    ifscCode: bank.ifscCode || "",
  };
}

export function mapApiUserToExistingUrls(user = {}) {
  const kyc = user.kyc || {};
  const bank = user.bankAccount || {};

  return {
    profileImage: user.profileImage || null,
    aadhaarFront: kyc.aadhaarFrontImage || kyc.aadhaarFront || null,
    aadhaarBack: kyc.aadhaarBackImage || kyc.aadhaarBack || null,
    panCard: kyc.panCardImage || kyc.panCard || null,
    ownerPhoto: kyc.ownerPhoto || null,
    videoVerification: kyc.videoVerification || null,
    passbookImage: bank.passbookImage || null,
    cancelledChequeImage: bank.cancelledChequeImage || null,
  };
}
