"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { BankLogo } from "@/components/retailer/BankLogo";
import { maskAccountNumber } from "@/src/lib/dmtUtils";
import { getCurrentLocation } from "@/src/lib/rdService";
import type { DmtBeneficiary, DmtTransferMode } from "../types";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

const schema = z.object({
  amount: z.coerce.number().min(1, "Enter amount").max(200000, "Amount too large"),
  transferMode: z.enum(["IMPS", "NEFT"]),
  remarks: z.string().max(255).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export interface TransferFormValues {
  amount: number;
  transferMode: DmtTransferMode;
  remarks?: string;
}

interface TransferCardProps {
  beneficiary: DmtBeneficiary | null;
  loading?: boolean;
  onContinue: (values: TransferFormValues) => void;
  onCancel?: () => void;
}

export default function TransferCard({
  beneficiary,
  loading = false,
  onContinue,
  onCancel,
}: TransferCardProps) {
  const [locationStatus, setLocationStatus] = useState<"pending" | "ready" | "unavailable">(
    "pending"
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { amount: undefined as unknown as number, transferMode: "IMPS", remarks: "" },
  });

  const transferMode = form.watch("transferMode");
  const amount = form.watch("amount");

  useEffect(() => {
    let active = true;
    setLocationStatus("pending");
    getCurrentLocation()
      .then(() => {
        if (active) setLocationStatus("ready");
      })
      .catch(() => {
        if (active) setLocationStatus("unavailable");
      });
    return () => {
      active = false;
    };
  }, [beneficiary?.id]);

  if (!beneficiary) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="body1">Select a verified beneficiary to transfer.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: "2px solid",
        borderColor: "primary.main",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1 }}>
              Money Transfer
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              Send to {beneficiary.name}
            </Typography>
          </Box>
          {onCancel ? (
            <Button size="small" color="inherit" startIcon={<CloseIcon />} onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            display: "flex",
            gap: 2,
            alignItems: "center",
            bgcolor: (theme) => `${theme.palette.primary.main}0d`,
            borderColor: (theme) => `${theme.palette.primary.main}33`,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
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
              size={40}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {beneficiary.bankName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A/C {maskAccountNumber(beneficiary.accountNumber)} • IFSC {beneficiary.ifscCode}
            </Typography>
            {beneficiary.mobile ? (
              <Typography variant="body2" color="text.secondary">
                Mobile {beneficiary.mobile}
              </Typography>
            ) : null}
          </Box>
          <Chip label="VERIFIED" color="success" size="small" sx={{ ml: "auto" }} />
        </Paper>

        <Box
          component="form"
          onSubmit={form.handleSubmit((values) =>
            onContinue({
              amount: values.amount,
              transferMode: values.transferMode as DmtTransferMode,
              remarks: values.remarks || undefined,
            })
          )}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
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
                <ToggleButton value="IMPS" sx={{ py: 1.25, fontWeight: 700 }}>
                  IMPS — Instant
                </ToggleButton>
                <ToggleButton value="NEFT" sx={{ py: 1.25, fontWeight: 700 }}>
                  NEFT
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Amount
          </Typography>
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                label="Enter amount (₹)"
                type="number"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message || "Min ₹1 • Max ₹2,00,000"}
                sx={{ mb: 1.5 }}
              />
            )}
          />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {QUICK_AMOUNTS.map((value) => (
              <Chip
                key={value}
                label={`₹${value.toLocaleString("en-IN")}`}
                clickable
                color={Number(amount) === value ? "primary" : "default"}
                variant={Number(amount) === value ? "filled" : "outlined"}
                onClick={() => form.setValue("amount", value, { shouldValidate: true })}
              />
            ))}
          </Box>

          <Controller
            name="remarks"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Remarks (optional)"
                fullWidth
                multiline
                minRows={2}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || "Max 255 characters"}
                sx={{ mb: 2 }}
              />
            )}
          />

          <Alert
            severity={locationStatus === "ready" ? "success" : locationStatus === "pending" ? "info" : "warning"}
            icon={<MyLocationIcon fontSize="small" />}
            sx={{ mb: 2 }}
          >
            {locationStatus === "pending"
              ? "Fetching your location for compliance (not shown on screen)..."
              : locationStatus === "ready"
                ? "Location ready. Coordinates will be sent securely with the transfer."
                : "Location unavailable. Transfer will use a fallback location if permitted."}
          </Alert>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {onCancel ? (
              <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
                Back
              </Button>
            ) : null}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />
              }
              sx={{ flex: 1, minWidth: 200 }}
            >
              Generate OTP & Transfer {transferMode}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
