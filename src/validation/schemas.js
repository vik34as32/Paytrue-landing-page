import * as yup from "yup";

const mobileRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const aadhaarRegex = /^[2-9]\d{11}$/;

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
  mobile: yup
    .string()
    .matches(mobileRegex, "Enter valid 10-digit mobile number")
    .required("Mobile is required"),
  alternateMobileNumber: yup
    .string()
    .transform((v) => v || "")
    .test(
      "mobile",
      "Enter valid 10-digit mobile number",
      (v) => !v || mobileRegex.test(v)
    ),
  password: yup.string().when("$isEdit", {
    is: true,
    then: (schema) =>
      schema
        .transform((v) => v || "")
        .test(
          "password-length",
          "Password must be at least 8 characters",
          (v) => !v || v.length >= 8
        ),
    otherwise: (schema) =>
      schema.min(8, "Password must be at least 8 characters").required("Password is required"),
  }),
  profileImage: fileOptional,
});

export const outletStepSchema = yup.object({
  outletName: yup.string().trim().required("Outlet name is required"),
  businessType: yup.string().trim().required("Business type is required"),
  gstNumber: yup.string().trim().nullable(),
  address: yup.string().trim().required("Address is required"),
  state: yup.string().trim().required("State is required"),
  district: yup.string().trim().required("District is required"),
  city: yup.string().trim().required("City is required"),
  village: yup.string().trim().nullable(),
  pincode: yup
    .string()
    .matches(pincodeRegex, "Enter valid 6-digit pincode")
    .required("Pincode is required"),
  latitude: yup.string().trim().nullable(),
  longitude: yup.string().trim().nullable(),
});

export const kycStepSchema = yup.object({
  aadhaarNumber: yup
    .string()
    .matches(aadhaarRegex, "Enter valid 12-digit Aadhaar number")
    .required("Aadhaar number is required"),
  aadhaarFront: fileRequired("Aadhaar front image is required"),
  aadhaarBack: fileRequired("Aadhaar back image is required"),
  panNumber: yup
    .string()
    .matches(panRegex, "Enter valid PAN number")
    .required("PAN number is required"),
  panCard: fileRequired("PAN card image is required"),
  ownerPhoto: fileRequired("Owner photo is required"),
  videoVerification: fileRequired("Video verification is required"),
});

export const bankStepSchema = yup.object({
  accountHolderName: yup.string().trim().required("Account holder name is required"),
  bankName: yup.string().trim().required("Bank name is required"),
  accountNumber: yup
    .string()
    .matches(/^\d{9,18}$/, "Enter valid account number")
    .required("Account number is required"),
  ifscCode: yup
    .string()
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
