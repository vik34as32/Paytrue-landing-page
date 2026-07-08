"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import {
  useGenerateTransactionOtp,
  useVerifyTransactionOtp,
  useTransferImps,
  useTransferNeft,
} from "@/src/hooks/useDmt";
import { getCurrentLocation } from "@/src/lib/rdService";
import { maskAccountNumber } from "@/src/lib/dmtUtils";
import { formatCurrency } from "@/lib/utils";
import { useDmtWorkflow, STEP } from "../DmtWorkflowContext";
import OtpDialog from "../OtpDialog";
import type { DmtApiError, DmtTransferMode } from "@/src/types/dmt";

const schema = z.object({
  amount: z.coerce.number().min(1, "Enter amount").max(200000, "Amount too large"),
  transferMode: z.enum(["IMPS", "NEFT"]),
  remarks: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
});
type TransferValues = z.infer<typeof schema>;

const FALLBACK_COORDS = { latitude: "28.6139", longitude: "77.2090" };

export default function TransferStep() {
  const {
    mobile,
    referenceKey,
    setReferenceKey,
    selectedBeneficiary,
    setTransferReference,
    goToStep,
  } = useDmtWorkflow();

  const generateOtpMutation = useGenerateTransactionOtp();
  const verifyOtpMutation = useVerifyTransactionOtp();
  const transferImpsMutation = useTransferImps();
  const transferNeftMutation = useTransferNeft();

  const [otpOpen, setOtpOpen] = useState(false);
  const [txnReferenceKey, setTxnReferenceKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  const form = useForm<TransferValues>({
    resolver: zodResolver(schema) as Resolver<TransferValues>,
    defaultValues: { amount: undefined as unknown as number, transferMode: "IMPS", remarks: "" },
  });

  if (!selectedBeneficiary) {
    return (
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => goToStep(STEP.BENEFICIARIES)}>
            Select Beneficiary
          </Button>
        }
      >
        No beneficiary selected. Please select a beneficiary to transfer.
      </Alert>
    );
  }

  const onGenerateOtp = async (values: TransferValues) => {
    setError(null);
    try {
      const result = await generateOtpMutation.mutateAsync({
        senderMobile: mobile,
        amount: values.amount,
        referenceKey: referenceKey || undefined,
      });
      const key = result.referenceKey || referenceKey;
      setTxnReferenceKey(key);
      if (result.referenceKey) setReferenceKey(result.referenceKey);
      setOtpOpen(true);
      toast.success(result.message || "Transaction OTP sent");
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped.message);
      toast.error(mapped.message);
    }
  };

  const onVerifyAndTransfer = async (otp: string) => {
    const values = form.getValues();
    const key = txnReferenceKey || referenceKey;
    try {
      await verifyOtpMutation.mutateAsync({
        senderMobile: mobile,
        otp,
        referenceKey: key,
        amount: values.amount,
      });

      let coords = FALLBACK_COORDS;
      try {
        coords = await getCurrentLocation();
      } catch {
        toast.message("Using default location for transfer.");
      }

      const mode = values.transferMode as DmtTransferMode;
      const payload = {
        senderMobile: mobile,
        beneficiaryId: selectedBeneficiary.id,
        amount: values.amount,
        transferMode: mode,
        otp,
        referenceKey: key,
        latitude: coords.latitude,
        longitude: coords.longitude,
        remarks: values.remarks || undefined,
      };

      const result =
        mode === "NEFT"
          ? await transferNeftMutation.mutateAsync(payload)
          : await transferImpsMutation.mutateAsync(payload);

      const reference =
        result.reference ||
        result.transaction?.referenceNumber ||
        result.transaction?.transactionId ||
        "";

      setOtpOpen(false);
      if (!reference) {
        toast.error("Transfer initiated but reference missing.");
        return;
      }
      setTransferReference(reference);
      toast.success("Transfer initiated");
      goToStep(STEP.RECEIPT);
    } catch (err) {
      const mapped = err as DmtApiError;
      toast.error(mapped.message);
    }
  };

  const submitting =
    verifyOtpMutation.isPending ||
    transferImpsMutation.isPending ||
    transferNeftMutation.isPending;

  return (
    <Box>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AccountBalanceIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Beneficiary
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {selectedBeneficiary.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedBeneficiary.bankName} • {selectedBeneficiary.ifscCode}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A/C {maskAccountNumber(selectedBeneficiary.accountNumber)}
          </Typography>
        </CardContent>
      </Card>

      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>
            Transfer Money
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box
            component="form"
            onSubmit={form.handleSubmit(onGenerateOtp)}
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
                  <MenuItem value="IMPS">IMPS (Instant)</MenuItem>
                  <MenuItem value="NEFT">NEFT</MenuItem>
                </TextField>
              )}
            />
            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
              <Controller
                name="remarks"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Remarks (optional)"
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {error ? (
              <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : null}

            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" }, display: "flex", gap: 2 }}>
              <Button variant="outlined" onClick={() => goToStep(STEP.BENEFICIARIES)}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={generateOtpMutation.isPending}
                startIcon={
                  generateOtpMutation.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : undefined
                }
              >
                Generate OTP & Continue
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <OtpDialog
        open={otpOpen}
        title="Confirm Transfer"
        description={`Enter transaction OTP to transfer ${formatCurrency(
          Number(form.getValues("amount") || 0)
        )} to ${selectedBeneficiary.name}.`}
        submitting={submitting}
        onClose={() => (submitting ? undefined : setOtpOpen(false))}
        onSubmit={onVerifyAndTransfer}
        onResend={() =>
          generateOtpMutation.mutate({
            senderMobile: mobile,
            amount: Number(form.getValues("amount") || 0),
            referenceKey: referenceKey || undefined,
          })
        }
      />
    </Box>
  );
}
