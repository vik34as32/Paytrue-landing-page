import { z } from "zod";

/** Retailer MPIN is always exactly 4 digits. */
export const MPIN_LENGTH = 4 as const;

const mpinField = z
  .string()
  .min(1, "MPIN is required")
  .regex(/^\d+$/, "MPIN must contain digits only")
  .length(MPIN_LENGTH, "MPIN must be 4 digits");

export const createMpinSchema = z
  .object({
    mpin: mpinField,
    confirmMpin: mpinField,
  })
  .refine((data) => data.mpin === data.confirmMpin, {
    message: "MPIN and Confirm MPIN must match",
    path: ["confirmMpin"],
  });

export const changeMpinSchema = z
  .object({
    oldMpin: mpinField,
    newMpin: mpinField,
    confirmMpin: mpinField,
  })
  .refine((data) => data.newMpin === data.confirmMpin, {
    message: "New MPIN and Confirm MPIN must match",
    path: ["confirmMpin"],
  })
  .refine((data) => data.oldMpin !== data.newMpin, {
    message: "New MPIN must be different from current MPIN",
    path: ["newMpin"],
  });

export const verifyMpinSchema = z.object({
  mpin: mpinField,
});

export type CreateMpinFormValues = z.infer<typeof createMpinSchema>;
export type ChangeMpinFormValues = z.infer<typeof changeMpinSchema>;
export type VerifyMpinFormValues = z.infer<typeof verifyMpinSchema>;

export function isValidMpin(value: string): boolean {
  return /^\d{4}$/.test(value);
}

export function getMpinStrength(mpin: string): {
  label: "Weak" | "Fair" | "Strong";
  score: number;
  color: string;
} {
  const len = mpin.length;
  if (len < MPIN_LENGTH) return { label: "Weak", score: 20, color: "bg-rose-500" };
  const sequential =
    /0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210/.test(
      mpin
    );
  const repeated = /^(\d)\1+$/.test(mpin);
  if (repeated || sequential) {
    return { label: "Weak", score: 35, color: "bg-amber-500" };
  }
  return { label: "Strong", score: 100, color: "bg-emerald-500" };
}
