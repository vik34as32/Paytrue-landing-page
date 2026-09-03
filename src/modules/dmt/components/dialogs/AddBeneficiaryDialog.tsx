"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useFetchBanksQuery } from "../../redux/dmtApi";
import DmtBankSelect from "../DmtBankSelect";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import { useBankAccountVerification } from "@/src/hooks/useBankAccountVerification";
import { resolveBeneficiaryBankFields } from "@/src/lib/dmtUtils";
import { verifyBankAccount } from "@/src/services/dmtService";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const schema = z
  .object({
    name: z.string().min(3, "Enter beneficiary name"),
    bankId: z.string().min(1, "Select bank"),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Enter valid account number"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(IFSC_REGEX, "Enter valid IFSC"),
    beneficiaryMobileNumber: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

type FormValues = z.infer<typeof schema>;

export type AddBeneficiaryFormSubmit = {
  name: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  beneficiaryMobileNumber?: string;
  bankId?: string;
  instantPayBankId?: string | number;
};

interface AddBeneficiaryDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: AddBeneficiaryFormSubmit) => void;
}

export default function AddBeneficiaryDialog({
  open,
  loading = false,
  onClose,
  onSubmit,
}: AddBeneficiaryDialogProps) {
  const { data: banks = [], isLoading: banksLoading } = useFetchBanksQuery(undefined, {
    skip: !open,
  });

  const selectableBanks = banks.filter((bank) => String(bank.id || "").trim());

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      bankId: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      beneficiaryMobileNumber: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const accountNumber = form.watch("accountNumber");
  const ifscCode = form.watch("ifscCode");
  const beneficiaryName = form.watch("name");

  const { verify, verifying, verified, holderName } = useBankAccountVerification({
    accountNumber,
    ifscCode,
    name: beneficiaryName,
    verifyFn: (input) => verifyBankAccount(input),
    onVerified: (result) => {
      const payeeName = result.payee?.name?.trim();
      if (payeeName) {
        form.setValue("name", payeeName, { shouldValidate: true, shouldDirty: true });
      }
      form.setValue("confirmAccountNumber", form.getValues("accountNumber"), {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
  });

  const handleFormSubmit = form.handleSubmit((values) => {
    const bank = selectableBanks.find((item) => item.id === values.bankId);
    const bankFields = resolveBeneficiaryBankFields({
      bankId: values.bankId,
      instantPayBankId: bank?.instantPayBankId,
    });

    if (!bankFields.bankId && !bankFields.instantPayBankId) {
      form.setError("bankId", {
        type: "manual",
        message: "Select a valid bank from the list",
      });
      return;
    }

    onSubmit({
      name: values.name.trim(),
      accountNumber: values.accountNumber.trim(),
      confirmAccountNumber: values.confirmAccountNumber.trim(),
      ifscCode: values.ifscCode.trim().toUpperCase(),
      beneficiaryMobileNumber: values.beneficiaryMobileNumber || undefined,
      ...bankFields,
    });
  });

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Add Beneficiary</DialogTitle>
      <Box component="form" onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2 }}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Beneficiary Name"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="beneficiaryMobileNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Beneficiary Mobile (optional)"
                  fullWidth
                  inputMode="numeric"
                  placeholder="10-digit mobile — uses remitter mobile if blank"
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="bankId"
              control={form.control}
              render={({ field, fieldState }) => (
                <DmtBankSelect
                  banks={selectableBanks}
                  value={field.value}
                  onChange={(bankId) => {
                    field.onChange(bankId);
                    const bank = selectableBanks.find((item) => item.id === bankId);
                    if (!bank) return;

                    const currentIfsc = form.getValues("ifscCode").trim().toUpperCase();
                    const fullIfsc = String(bank.ifsc || "").trim().toUpperCase();
                    const prefix = String(bank.ifscPrefix || "").trim().toUpperCase();

                    if (fullIfsc && IFSC_REGEX.test(fullIfsc)) {
                      form.setValue("ifscCode", fullIfsc, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    } else if (prefix && (!currentIfsc || currentIfsc.length <= 4)) {
                      form.setValue("ifscCode", prefix, {
                        shouldValidate: false,
                        shouldDirty: true,
                      });
                    }
                  }}
                  loading={banksLoading}
                  disabled={loading}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    (selectableBanks.length === 0 && !banksLoading
                      ? "No banks loaded. Close and try again."
                      : undefined)
                  }
                />
              )}
            />

            <Controller
              name="ifscCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="IFSC"
                  fullWidth
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    "Enter full 11-character IFSC (e.g. HDFC0001234)"
                  }
                />
              )}
            />

            <Controller
              name="accountNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Account Number"
                  fullWidth
                  inputMode="numeric"
                  disabled={loading || verifying}
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/\D/g, "").slice(0, 18))
                  }
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error?.message ||
                    (verified && holderName ? `Verified: ${holderName}` : undefined)
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          {verified ? (
                            <CheckCircleIcon sx={{ color: "success.main", fontSize: 22 }} />
                          ) : (
                            <Button
                              type="button"
                              size="small"
                              disabled={
                                loading ||
                                verifying ||
                                !accountNumber.trim() ||
                                !ifscCode.trim()
                              }
                              onClick={() => void verify()}
                              sx={{
                                textTransform: "none",
                                minWidth: 0,
                                px: 1.5,
                                py: 0.4,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#64748b",
                                bgcolor: "#f1f5f9",
                                border: "1px solid #e2e8f0",
                                borderRadius: 1,
                                boxShadow: "none",
                                "&:hover": {
                                  bgcolor: "#e2e8f0",
                                  borderColor: "#cbd5e1",
                                  boxShadow: "none",
                                },
                              }}
                            >
                              {verifying ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                "Verify"
                              )}
                            </Button>
                          )}
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Controller
              name="confirmAccountNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Confirm Account"
                  fullWidth
                  inputMode="numeric"
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/\D/g, "").slice(0, 18))
                  }
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || verifying || banksLoading || selectableBanks.length === 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Submit
          </Button>
        </DialogActions>
      </Box>
      <ProcessLoadingOverlay
        open={verifying}
        message="Please wait..."
        detail="Connecting to bank server — verifying account"
      />
    </Dialog>
  );
}
