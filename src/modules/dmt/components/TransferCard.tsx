"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import type { DmtBeneficiary, DmtTransferMode } from "../types";

const schema = z.object({
  amount: z.coerce.number().min(1, "Enter amount").max(200000, "Amount too large"),
  transferMode: z.enum(["IMPS", "NEFT"]),
  remarks: z.string().max(50).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

interface TransferCardProps {
  beneficiary: DmtBeneficiary | null;
  loading?: boolean;
  onContinue: (values: { amount: number; transferMode: DmtTransferMode; remarks?: string }) => void;
}

export default function TransferCard({
  beneficiary,
  loading = false,
  onContinue,
}: TransferCardProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { amount: undefined as unknown as number, transferMode: "IMPS", remarks: "" },
  });

  if (!beneficiary) {
    return (
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="body1">Select a beneficiary to transfer.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Transfer Money
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {beneficiary.name} • {beneficiary.bankName} • {beneficiary.ifscCode}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Box
          component="form"
          onSubmit={form.handleSubmit((values) =>
            onContinue({
              amount: values.amount,
              transferMode: values.transferMode as DmtTransferMode,
              remarks: values.remarks || undefined,
            })
          )}
          sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}
        >
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                label="Amount (₹)"
                type="number"
                fullWidth
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="transferMode"
            control={form.control}
            render={({ field }) => (
              <TextField {...field} select label="Transfer Mode" fullWidth>
                <MenuItem value="IMPS">IMPS</MenuItem>
                <MenuItem value="NEFT">NEFT</MenuItem>
              </TextField>
            )}
          />
          <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
            <Controller
              name="remarks"
              control={form.control}
              render={({ field }) => <TextField {...field} label="Remarks (optional)" fullWidth />}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
