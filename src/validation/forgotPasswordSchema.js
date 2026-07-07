import * as yup from "yup";

const mobileRegex = /^[6-9]\d{9}$/;

const passwordRules = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Must contain an uppercase letter")
  .matches(/[a-z]/, "Must contain a lowercase letter")
  .matches(/\d/, "Must contain a number")
  .matches(/[^A-Za-z0-9]/, "Must contain a special character");

export const forgotPasswordSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .transform((v) => v || "")
      .test("email", "Enter a valid email", (v) => !v || yup.string().email().isValidSync(v)),
    mobile: yup
      .string()
      .transform((v) => v || "")
      .test("mobile", "Enter valid 10-digit mobile number", (v) => !v || mobileRegex.test(v)),
  })
  .test("email-or-mobile", "Email or mobile is required", (value) => {
    const email = String(value?.email || "").trim();
    const mobile = String(value?.mobile || "").trim();
    return Boolean(email || mobile);
  });

export const resetPasswordSchema = yup
  .object({
    email: yup
      .string()
      .trim()
      .transform((v) => v || "")
      .test("email", "Enter a valid email", (v) => !v || yup.string().email().isValidSync(v)),
    mobile: yup
      .string()
      .transform((v) => v || "")
      .test("mobile", "Enter valid 10-digit mobile number", (v) => !v || mobileRegex.test(v)),
    otp: yup
      .string()
      .trim()
      .length(6, "OTP must be 6 digits")
      .matches(/^\d{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
    password: passwordRules.required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Please confirm your password"),
  })
  .test("email-or-mobile", "Email or mobile is required", (value) => {
    const email = String(value?.email || "").trim();
    const mobile = String(value?.mobile || "").trim();
    return Boolean(email || mobile);
  });
