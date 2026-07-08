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

const schema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid mobile"),
  aadhaar: z.string().regex(/^\d{12}$/, "Enter valid 12-digit Aadhaar"),
});

type FormValues = z.infer<typeof schema>;

interface RegisterSenderDialogProps {
  open: boolean;
  mobile: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => void;
}

export default function RegisterSenderDialog({
  open,
  mobile,
  loading = false,
  onClose,
  onSubmit,
}: RegisterSenderDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      mobile,
      aadhaar: "",
    },
  });

  useEffect(() => {
    if (open) form.reset({ ...form.getValues(), mobile });
  }, [open, mobile, form]);

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Register Sender</DialogTitle>
      <Box component="form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2.5, gridTemplateColumns: "1fr" }}>
            <Controller
              name="mobile"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Mobile Number"
                  type="tel"
                  fullWidth
                  disabled
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
                />
              )}
            />

            <Controller
              name="aadhaar"
              control={form.control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Aadhaar Number"
                  type="text"
                  fullWidth
                  autoComplete="off"
                  disabled={loading}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(event) => {
                    // Allow digits only (block letters/symbols) and cap at 12.
                    const digits = event.target.value.replace(/\D/g, "").slice(0, 12);
                    field.onChange(digits);
                  }}
                  slotProps={{ htmlInput: { maxLength: 12, inputMode: "numeric" } }}
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Register Sender
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
