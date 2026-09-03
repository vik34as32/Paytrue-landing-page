import { z } from "zod";
import { IFSC_RE, INDIAN_MOBILE_RE } from "./ccbp-issuers";

export const CCBP_STEPS = ["card", "amount", "confirm"] as const;
export type CcbpStep = (typeof CCBP_STEPS)[number];

export const ccbpFormSchema = z.object({
  issuerId: z.string().min(1, "Select or detect the card issuer"),
  ifscCode: z.string().trim().toUpperCase().regex(IFSC_RE, "Enter a valid 11-character IFSC"),
  creditCardNumber: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .refine((v) => /^\d{12,19}$/.test(v), "Enter a valid 12–19 digit card number"),
  payeeName: z.string().trim().min(2, "Enter the name on the card").max(100),
  payeeMobile: z.string().regex(INDIAN_MOBILE_RE, "Enter a valid 10-digit mobile"),
  payeeEmail: z.string().trim().email("Enter a valid email address"),
  amount: z.coerce.number().positive("Enter the bill amount"),
  paymentType: z.enum(["IMPS", "NEFT", "RTGS"]),
  remarks: z.string().trim().max(10).optional().or(z.literal("")),
});

export type CcbpFormValues = z.infer<typeof ccbpFormSchema>;

export const CCBP_STEP_FIELDS: Record<Exclude<CcbpStep, "confirm">, (keyof CcbpFormValues)[]> = {
  card: ["creditCardNumber", "issuerId", "payeeName", "payeeMobile", "payeeEmail", "ifscCode"],
  amount: ["amount", "paymentType", "remarks"],
};
