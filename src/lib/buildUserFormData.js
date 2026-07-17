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

function pickPresent(target, key, value) {
  if (value !== undefined && value !== null && String(value).trim() !== "") {
    target[key] = typeof value === "string" ? value.trim() : value;
  }
}

function buildSharedUserFields(values, options = {}) {
  const { userType, includePassword = true } = options;
  const body = {};

  if (userType === "RETAILER") {
    const { firstName, lastName } = resolveRetailerNameFields(values);
    pickPresent(body, "firstName", firstName);
    pickPresent(body, "lastName", lastName);
  } else {
    pickPresent(body, "firstName", values.firstName);
    pickPresent(body, "lastName", values.lastName);
  }

  pickPresent(body, "email", values.email);
  pickPresent(body, "mobile", values.mobile);
  pickPresent(body, "alternateMobileNumber", values.alternateMobileNumber);
  pickPresent(body, "userType", userType);
  pickPresent(body, "gender", values.gender);
  pickPresent(body, "dateOfBirth", values.dateOfBirth);
  pickPresent(body, "address", values.address);
  pickPresent(body, "state", values.state);
  pickPresent(body, "city", values.city);
  pickPresent(body, "pincode", values.pincode);

  if (includePassword && values.password) {
    pickPresent(body, "password", values.password);
  }

  const latitude =
    values.latitude !== undefined &&
    values.latitude !== null &&
    String(values.latitude).trim() !== ""
      ? Number(values.latitude)
      : undefined;
  const longitude =
    values.longitude !== undefined &&
    values.longitude !== null &&
    String(values.longitude).trim() !== ""
      ? Number(values.longitude)
      : undefined;

  if (Number.isFinite(latitude)) body.latitude = latitude;
  if (Number.isFinite(longitude)) body.longitude = longitude;

  body.outlet = {
    outletName: values.outletName || "",
    businessType: values.businessType || "",
    gstNumber: values.gstNumber || "",
    address: values.address || "",
    state: values.state || "",
    district: values.district || "",
    city: values.city || "",
    village: values.village || "",
    pincode: values.pincode || "",
    ...(Number.isFinite(latitude) ? { latitude } : {}),
    ...(Number.isFinite(longitude) ? { longitude } : {}),
  };

  body.kyc = {
    panNumber: values.panNumber ? String(values.panNumber).toUpperCase() : "",
  };
  if (userType === "RETAILER") {
    body.kyc.aadhaarNumber = values.aadhaarNumber || "";
  }

  body.bankAccount = {
    accountHolderName: values.accountHolderName || "",
    bankName: values.bankName || "",
    accountNumber: values.accountNumber || "",
    ifscCode: values.ifscCode ? String(values.ifscCode).toUpperCase() : "",
  };

  return body;
}

/**
 * Build multipart/form-data for POST /users (create with file uploads)
 */
export function buildUserFormData(values, files = {}, options = {}) {
  const formData = new FormData();
  const body = buildSharedUserFields(values, options);

  Object.entries(body).forEach(([key, value]) => {
    if (value && typeof value === "object" && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });

  Object.entries(USER_FILE_FIELDS).forEach(([formKey, apiKey]) => {
    appendFileIfPresent(formData, apiKey, files[formKey]);
  });

  return formData;
}

/**
 * Build plain JSON object for PUT /users/:id
 * Backend validates body as object — multipart FormData fails with "must be object".
 */
export function buildUserJsonBody(values, options = {}) {
  return buildSharedUserFields(values, options);
}

/** Normalize API gender (Male/Female/M/F) to form select values M | F | T */
export function normalizeGender(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const upper = raw.toUpperCase();
  if (upper === "M" || upper === "MALE") return "M";
  if (upper === "F" || upper === "FEMALE") return "F";
  if (
    upper === "T" ||
    upper === "TRANSGENDER" ||
    upper === "OTHER" ||
    upper === "O"
  ) {
    return "T";
  }
  return "";
}

/** Normalize DOB to yyyy-MM-dd for DatePicker */
export function normalizeDateOfBirth(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return "";
}

export function mapApiUserToFormValues(user = {}) {
  const profile = user.profile || {};
  const outlet = user.outlet || {};
  const kyc = user.kycDocument || user.kyc || {};
  const bank = user.bankAccount || user.bankDetails || {};

  const fullName =
    user.firstName ||
    user.name ||
    user.fullName ||
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    "";

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    fullName,
    email: user.email || "",
    emailVerified: Boolean(user.emailVerified ?? user.isEmailVerified),
    mobile: user.mobile || "",
    mobileVerified: Boolean(user.mobileVerified ?? user.isMobileVerified),
    password: "",
    alternateMobileNumber:
      profile.alternateMobileNumber || user.alternateMobileNumber || "",
    gender: normalizeGender(user.gender || profile.gender || ""),
    dateOfBirth: normalizeDateOfBirth(
      user.dateOfBirth || user.dob || profile.dateOfBirth || ""
    ),
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
  const profile = user.profile || {};
  const kyc = user.kycDocument || user.kyc || {};
  const bank = user.bankAccount || user.bankDetails || {};

  return {
    profileImage: profile.profileImage || user.profileImage || null,
    aadhaarFront: kyc.aadhaarFrontUrl || kyc.aadhaarFrontImage || kyc.aadhaarFront || null,
    aadhaarBack: kyc.aadhaarBackUrl || kyc.aadhaarBackImage || kyc.aadhaarBack || null,
    panCard: kyc.panCardUrl || kyc.panCardImage || kyc.panCard || null,
    ownerPhoto: kyc.ownerPhotoUrl || kyc.ownerPhoto || null,
    videoVerification: kyc.videoVerificationUrl || kyc.videoVerification || null,
    passbookImage: bank.passbookImage || bank.passbookImageUrl || null,
    cancelledChequeImage: bank.cancelledChequeImage || bank.cancelledChequeImageUrl || null,
  };
}
