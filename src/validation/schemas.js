import * as yup from "yup";

const mobileRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const aadhaarRegex = /^[2-9]\d{11}$/;

const passwordComplexity = yup
  .string()
  .length(8, "Password must be exactly 8 characters")
  .matches(/[A-Z]/, "Must contain an uppercase letter")
  .matches(/[a-z]/, "Must contain a lowercase letter")
  .matches(/\d/, "Must contain a number")
  .matches(/[^A-Za-z0-9]/, "Must contain a special character");

function maxDobFor18Years() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(date.getFullYear() - 18);
  return date;
}

const fileRequired = (message) =>
  yup
    .mixed()
    .nullable()
    .test("file-required", message, function validateFile(value) {
      const { isEdit, existingUrls = {} } = this.options.context || {};
      const fieldKey = this.path;
      if (value instanceof File) return true;
      if (isEdit && existingUrls[fieldKey]) return true;
      return false;
    });

const fileOptional = yup
  .mixed()
  .nullable()
  .test("file-valid", "Invalid file", (value) => !value || value instanceof File);

export const personalStepSchema = yup.object({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  emailVerified: yup.boolean().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema.test("email-verified-edit", "Verify email before continuing", function verified(value) {
        const { originalEmail = "" } = this.options.context || {};
        const currentEmail = String(this.parent.email || "").trim().toLowerCase();
        const initialEmail = String(originalEmail || "").trim().toLowerCase();
        if (!currentEmail || !initialEmail || currentEmail === initialEmail) {
          return true;
        }
        return value === true;
      }),
    otherwise: (schema) =>
      schema
        .oneOf([true], "Please verify your email before continuing")
        .required("Please verify your email before continuing"),
  }),
  mobile: yup
    .string()
    .matches(mobileRegex, "Enter valid 10-digit mobile number")
    .required("Mobile is required"),
  mobileVerified: yup.boolean().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema.test("mobile-verified-edit", "Verify mobile before continuing", function verified(value) {
        const { originalMobile = "" } = this.options.context || {};
        const currentMobile = String(this.parent.mobile || "").trim();
        const initialMobile = String(originalMobile || "").trim();
        if (!currentMobile || !initialMobile || currentMobile === initialMobile) {
          return true;
        }
        return value === true;
      }),
    otherwise: (schema) =>
      schema
        .oneOf([true], "Please verify your mobile number before continuing")
        .required("Please verify your mobile number before continuing"),
  }),
  alternateMobileNumber: yup
    .string()
    .transform((v) => v || "")
    .test(
      "mobile",
      "Enter valid 10-digit mobile number",
      (v) => !v || mobileRegex.test(v)
    ),
  gender: yup.string().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema
        .transform((v) => v || "")
        .test("gender", "Select gender", (v) => !v || ["M", "F", "T"].includes(v)),
    otherwise: (schema) =>
      schema.oneOf(["M", "F", "T"], "Select gender").required("Gender is required"),
  }),
  dateOfBirth: yup.string().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema.test("dob-edit", "Enter a valid date of birth", (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !Number.isNaN(date.getTime()) && date <= maxDobFor18Years();
      }),
    otherwise: (schema) =>
      schema
        .required("Date of birth is required")
        .test("valid-date", "Enter a valid date", (value) => {
          if (!value) return false;
          const date = new Date(value);
          return !Number.isNaN(date.getTime());
        })
        .test("not-future", "Future dates are not allowed", (value) => {
          if (!value) return false;
          return new Date(value) <= new Date();
        })
        .test("min-age", "Must be at least 18 years old", (value) => {
          if (!value) return false;
          return new Date(value) <= maxDobFor18Years();
        }),
        }),
  password: yup.string().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema
        .transform((v) => v || "")
        .test(
          "password-complexity",
          "Password must be exactly 8 characters with upper, lower, number and special character",
          (v) => {
            if (!v) return true;
            return (
              v.length === 8 &&
              /[A-Z]/.test(v) &&
              /[a-z]/.test(v) &&
              /\d/.test(v) &&
              /[^A-Za-z0-9]/.test(v)
            );
          }
        ),
    otherwise: () => passwordComplexity.required("Password is required"),
  }),
  profileImage: fileOptional,
});

export function getPersonalStepSchema(userType) {
  if (userType === "RETAILER") {
    return personalStepSchema.omit(["firstName", "lastName"]).shape({
      fullName: yup
        .string()
        .trim()
        .min(2, "Full name must be at least 2 characters")
        .required("Full name is required"),
    });
  }
  return personalStepSchema;
}

export const outletStepSchema = yup.object({
  outletName: yup.string().trim().required("Outlet name is required"),
  businessType: yup.string().trim().required("Business type is required"),
  gstNumber: yup.string().trim().nullable(),
  address: yup.string().trim().required("Outlet address is required"),
  state: yup.string().trim().required("State is required"),
  district: yup.string().trim().required("District is required"),
  city: yup.string().trim().required("City is required"),
  village: yup.string().trim().nullable(),
  pincode: yup
    .string()
    .matches(pincodeRegex, "Enter valid 6-digit pincode")
    .required("Pincode is required"),
  latitude: yup.string().when("$isEdit", {
    is: true,
    then: (schema) => schema.trim(),
    otherwise: (schema) => schema.trim().required("Latitude is required"),
  }),
  longitude: yup.string().when("$isEdit", {
    is: true,
    then: (schema) => schema.trim(),
    otherwise: (schema) => schema.trim().required("Longitude is required"),
  }),
});

const retailerKycFields = {
  aadhaarNumber: yup
    .string()
    .matches(aadhaarRegex, "Enter valid 12-digit Aadhaar number")
    .required("Aadhaar number is required"),
  aadhaarFront: fileRequired("Aadhaar front image is required"),
  aadhaarBack: fileRequired("Aadhaar back image is required"),
};

const sharedKycFields = {
  panNumber: yup
    .string()
    .transform((v) => (v ? v.toUpperCase() : v))
    .matches(panRegex, "Enter valid PAN number")
    .required("PAN number is required"),
  panCard: fileRequired("PAN card image is required"),
  ownerPhoto: fileRequired("Owner photo is required"),
  videoVerification: fileOptional,
};

export function getKycStepSchema(userType) {
  if (userType === "DISTRIBUTOR") {
    return yup.object({ ...sharedKycFields });
  }
  return yup.object({ ...retailerKycFields, ...sharedKycFields });
}

/** @deprecated use getKycStepSchema(userType) */
export const kycStepSchema = getKycStepSchema("RETAILER");

export const bankStepSchema = yup.object({
  accountHolderName: yup.string().trim().required("Account holder name is required"),
  bankName: yup.string().trim().required("Bank name is required"),
  accountNumber: yup
    .string()
    .matches(/^\d{9,18}$/, "Enter valid account number")
    .required("Account number is required"),
  confirmAccountNumber: yup.string().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema.test("match-account", "Account numbers must match", function match(value) {
        const account = this.parent.accountNumber;
        if (!value) return true;
        return value === account;
      }),
    otherwise: (schema) =>
      schema
        .required("Confirm account number is required")
        .oneOf([yup.ref("accountNumber")], "Account numbers must match"),
  }),
  ifscCode: yup
    .string()
    .transform((v) => (v ? v.toUpperCase() : v))
    .matches(ifscRegex, "Enter valid IFSC code")
    .required("IFSC code is required"),
  passbookImage: fileRequired("Passbook image is required"),
  cancelledChequeImage: fileOptional,
});

export const loginSchema = yup.object({
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
  remember: yup.boolean(),
});

export { mobileRegex, pincodeRegex, ifscRegex, panRegex, aadhaarRegex };

export function formatDateDisplay(isoDate) {
  if (!isoDate) return "—";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}
