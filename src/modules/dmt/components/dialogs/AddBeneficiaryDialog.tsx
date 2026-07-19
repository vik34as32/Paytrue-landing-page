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
} from "@mui/material";
import { useFetchBanksQuery } from "../../redux/dmtApi";
import DmtBankSelect from "../DmtBankSelect";
import BankAccountVerifyField from "../BankAccountVerifyField";
import { verifyBankAccount } from "@/src/services/dmtService";
import type { VerifyBankAccountResponse } from "@/src/types/dmt";

const schema = z
  .object({
    name: z.string().min(3, "Enter beneficiary name"),
    bankId: z.string().min(1, "Select bank"),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Enter valid account number"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC"),
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

interface AddBeneficiaryDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
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

  const ifscCode = form.watch("ifscCode");
  const beneficiaryName = form.watch("name");

  /** Copy Account Number → Confirm Account as soon as Verify is clicked */
  const handleVerifyClick = () => {
    const accountNumber = form.getValues("accountNumber").trim();
    if (!accountNumber) return;
    form.setValue("confirmAccountNumber", accountNumber, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  /**
   * On successful bank verify: keep Confirm Account in sync and
   * always replace Beneficiary Name with InstantPay / payee verified name.
   */
  const handleBankVerified = (result: VerifyBankAccountResponse) => {
    const accountNumber = form.getValues("accountNumber").trim();
    if (accountNumber) {
      form.setValue("confirmAccountNumber", accountNumber, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    const verifiedName = result.payee?.name?.trim();
    if (verifiedName) {
      form.setValue("name", verifiedName, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Add Beneficiary</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
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
                  banks={banks}
                  value={field.value}
                  onChange={field.onChange}
                  loading={banksLoading}
                  disabled={loading}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
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
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="accountNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <BankAccountVerifyField
                  value={field.value}
                  onChange={field.onChange}
                  ifscCode={ifscCode}
                  name={beneficiaryName}
                  verifyFn={(input) =>
                    verifyBankAccount({
                      accountNumber: input.accountNumber,
                      ifscCode: input.ifscCode,
                      name: input.name,
                      pennyDrop: "YES",
                    })
                  }
                  onVerified={handleBankVerified}
                  onVerifyClick={handleVerifyClick}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  disabled={loading}
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
            disabled={loading || banksLoading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
