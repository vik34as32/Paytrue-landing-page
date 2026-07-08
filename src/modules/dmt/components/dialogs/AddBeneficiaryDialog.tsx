"use client";

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
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { useFetchBanksQuery } from "../../redux/dmtApi";

const schema = z
  .object({
    name: z.string().min(3, "Enter beneficiary name"),
    bankId: z.string().min(1, "Select bank"),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Enter valid account number"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC"),
    beneficiaryMobileNumber: z.string().optional().or(z.literal("")),
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
  const { data: banks = [], isLoading: banksLoading } = useFetchBanksQuery();

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
                <TextField {...field} label="Beneficiary Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="bankId"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField {...field} select label="Bank" fullWidth disabled={banksLoading} error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {banks.map((bank) => (
                    <MenuItem key={bank.id} value={bank.id}>{bank.name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="accountNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Account Number" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )}
            />
            <Controller
              name="confirmAccountNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField {...field} label="Confirm Account" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}>
            Submit
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
