"use client";

import { useEffect } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { BankLogo } from "@/components/retailer/BankLogo";
import { maskAccountNumber } from "@/src/lib/dmtUtils";
import { getCurrentLocation } from "@/src/lib/rdService";
import type { DmtBeneficiary, DmtTransferMode } from "../../types";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const schema = z.object({
  amount: z.coerce.number().min(1, "Enter amount").max(200000, "Amount too large"),
  transferMode: z.enum(["IMPS", "NEFT"]),
});

type FormValues = z.infer<typeof schema>;

export interface TransferFormValues {
  amount: number;
  transferMode: DmtTransferMode;
  remarks?: string;
}

interface TransferModalProps {
  open: boolean;
  beneficiary: DmtBeneficiary | null;
  loading?: boolean;
  onContinue: (values: TransferFormValues) => void;
  onClose: () => void;
}

export default function TransferModal({
  open,
  beneficiary,
  loading = false,
  onContinue,
  onClose,
}: TransferModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { amount: undefined as unknown as number, transferMode: "IMPS" },
  });

  const transferMode = form.watch("transferMode");
  const amount = form.watch("amount");

  useEffect(() => {
    if (!open) {
      form.reset({ amount: undefined as unknown as number, transferMode: "IMPS" });
      return;
    }

    let active = true;
    getCurrentLocation().catch(() => {
      if (active) {
        // Location is fetched silently for compliance; transfer uses fallback if needed.
      }
    });

    return () => {
      active = false;
    };
  }, [beneficiary?.id, form, open]);

  if (!beneficiary) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "2px solid",
          borderColor: "primary.main",
          overflow: "hidden",
          m: { xs: 1.5, sm: 2 },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={form.handleSubmit((values) =>
          onContinue({
            amount: values.amount,
            transferMode: values.transferMode as DmtTransferMode,
          })
        )}
        sx={{ p: { xs: 2, sm: 2.5 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 800, letterSpacing: 1, lineHeight: 1.2 }}
            >
              Money Transfer
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25, lineHeight: 1.2 }}>
              Send to {beneficiary.name}
            </Typography>
          </Box>
          <Button
            size="small"
            color="inherit"
            onClick={onClose}
            disabled={loading}
            startIcon={<CloseIcon fontSize="small" />}
            sx={{ color: "text.secondary", minWidth: "auto", flexShrink: 0 }}
          >
            Cancel
          </Button>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 1.75,
            mb: 2,
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            bgcolor: (theme) => `${theme.palette.primary.main}08`,
            borderColor: (theme) => `${theme.palette.primary.main}26`,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <BankLogo
              bank={{
                name: beneficiary.bankName,
                ifscPrefix: beneficiary.ifscCode?.slice(0, 4) || "",
              }}
              size={36}
            />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
              {beneficiary.bankName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              A/C {maskAccountNumber(beneficiary.accountNumber)} • IFSC {beneficiary.ifscCode}
            </Typography>
            {beneficiary.mobile ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Mobile {beneficiary.mobile}
              </Typography>
            ) : null}
          </Box>
          <Chip label="VERIFIED" color="success" size="small" sx={{ fontWeight: 700, flexShrink: 0 }} />
        </Paper>

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
          Transfer mode
        </Typography>
        <Controller
          name="transferMode"
          control={form.control}
          render={({ field }) => (
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={field.value}
              onChange={(_, value) => value && field.onChange(value)}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="IMPS" sx={{ py: 1, fontWeight: 700, textTransform: "none" }}>
                IMPS — Instant
              </ToggleButton>
              <ToggleButton value="NEFT" sx={{ py: 1, fontWeight: 700, textTransform: "none" }}>
                NEFT
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75 }}>
          Amount
        </Typography>
        <Controller
          name="amount"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              placeholder="Enter amount (₹)"
              type="number"
              fullWidth
              size="small"
              error={!!fieldState.error}
              helperText={fieldState.error?.message || "Min ₹1 • Max ₹2,00,000"}
              sx={{ mb: 1.25 }}
            />
          )}
        />

        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
          {QUICK_AMOUNTS.map((value) => (
            <Chip
              key={value}
              label={`₹${value.toLocaleString("en-IN")}`}
              clickable
              size="small"
              color={Number(amount) === value ? "primary" : "default"}
              variant={Number(amount) === value ? "filled" : "outlined"}
              onClick={() => form.setValue("amount", value, { shouldValidate: true })}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          sx={{ py: 1.25, fontWeight: 800 }}
        >
          Generate OTP & Transfer {transferMode}
        </Button>
      </Box>
    </Dialog>
  );
}
