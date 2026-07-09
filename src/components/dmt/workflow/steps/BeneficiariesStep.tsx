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
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
  useBeneficiaries,
  useDmtBanks,
  useAddBeneficiary,
  useVerifyBeneficiary,
  useDeleteBeneficiary,
  useVerifyBeneficiaryDelete,
} from "@/src/hooks/useDmt";
import { maskAccountNumber, normalizeIndianMobile } from "@/src/lib/dmtUtils";
import { useDmtWorkflow, STEP } from "../DmtWorkflowContext";
import OtpDialog from "../OtpDialog";
import type { DmtApiError, DmtBeneficiary } from "@/src/types/dmt";

const addSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid mobile").optional().or(z.literal("")),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Account must be 9-18 digits"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC"),
    bankId: z.string().min(1, "Select bank"),
  })
  .refine((d) => d.accountNumber === d.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });
type AddValues = z.infer<typeof addSchema>;

export default function BeneficiariesStep() {
  const { mobile, setSelectedBeneficiary, goToStep } = useDmtWorkflow();
  const { data: beneficiaries = [], isLoading, isError, error, refetch } =
    useBeneficiaries(mobile);
  const { data: banks = [], isLoading: banksLoading } = useDmtBanks();

  const addMutation = useAddBeneficiary();
  const verifyMutation = useVerifyBeneficiary();
  const deleteMutation = useDeleteBeneficiary();
  const verifyDeleteMutation = useVerifyBeneficiaryDelete();

  const [addOpen, setAddOpen] = useState(false);
  const [verifyState, setVerifyState] = useState<{ id: string; referenceKey: string } | null>(null);
  const [deleteState, setDeleteState] = useState<{ id: string; referenceKey: string } | null>(null);

  const form = useForm<AddValues>({
    resolver: zodResolver(addSchema) as Resolver<AddValues>,
    defaultValues: {
      name: "",
      mobile: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankId: "",
    },
  });

  const onAdd = async (values: AddValues) => {
    try {
      const created = await addMutation.mutateAsync({
        senderMobile: mobile,
        name: values.name,
        beneficiaryMobileNumber:
          normalizeIndianMobile(values.mobile) ||
          normalizeIndianMobile(mobile) ||
          undefined,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode.toUpperCase(),
        instantPayBankId: values.bankId,
      });
      toast.success("Beneficiary added");
      setAddOpen(false);
      form.reset();
      if (!created.isVerified && created.referenceKey) {
        setVerifyState({ id: created.id, referenceKey: created.referenceKey });
      } else {
        refetch();
      }
    } catch (err) {
      toast.error((err as DmtApiError).message);
    }
  };

  const onVerify = async (otp: string) => {
    if (!verifyState) return;
    try {
      await verifyMutation.mutateAsync({
        beneficiaryId: verifyState.id,
        payload: { otp, referenceKey: verifyState.referenceKey },
      });
      toast.success("Beneficiary verified");
      setVerifyState(null);
      refetch();
    } catch (err) {
      toast.error((err as DmtApiError).message);
    }
  };

  const initiateDelete = async (id: string) => {
    try {
      const result = await deleteMutation.mutateAsync({ beneficiaryId: id, senderMobile: mobile });
      toast.success(result.message || "OTP sent to confirm deletion");
      setDeleteState({ id, referenceKey: result.referenceKey || "" });
    } catch (err) {
      toast.error((err as DmtApiError).message);
    }
  };

  const onConfirmDelete = async (otp: string) => {
    if (!deleteState) return;
    try {
      await verifyDeleteMutation.mutateAsync({
        beneficiaryId: deleteState.id,
        payload: { otp, referenceKey: deleteState.referenceKey || undefined },
      });
      toast.success("Beneficiary deleted");
      setDeleteState(null);
      refetch();
    } catch (err) {
      toast.error((err as DmtApiError).message);
    }
  };

  const handleTransfer = (beneficiary: DmtBeneficiary) => {
    setSelectedBeneficiary(beneficiary);
    goToStep(STEP.TRANSFER);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Beneficiaries
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
          Add Beneficiary
        </Button>
      </Box>

      {isLoading ? (
        <Skeleton variant="rounded" height={200} />
      ) : isError ? (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}
        >
          {(error as Error)?.message || "Unable to load beneficiaries"}
        </Alert>
      ) : beneficiaries.length === 0 ? (
        <Card elevation={0} sx={{ border: "1px dashed", borderColor: "divider" }}>
          <CardContent sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              No beneficiaries yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add a beneficiary to start transferring money.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
              Add Beneficiary
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {beneficiaries.map((b) => (
            <Card key={b.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {b.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.bankName} • {b.ifscCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      A/C {maskAccountNumber(b.accountNumber)}
                    </Typography>
                  </Box>
                  <Chip
                    label={b.isVerified ? "VERIFIED" : "UNVERIFIED"}
                    color={b.isVerified ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleTransfer(b)}
                    disabled={!b.isVerified}
                  >
                    Transfer
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => initiateDelete(b.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add Beneficiary Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Add Beneficiary</DialogTitle>
        <Box component="form" onSubmit={form.handleSubmit(onAdd)}>
          <DialogContent dividers>
            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
              <Controller name="name" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} label="Beneficiary Name" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )} />
              <Controller name="mobile" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} label="Mobile (optional)" fullWidth slotProps={{ htmlInput: { maxLength: 10 } }} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )} />
              <Controller name="accountNumber" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} label="Account Number" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )} />
              <Controller name="confirmAccountNumber" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} label="Confirm Account" fullWidth error={!!fieldState.error} helperText={fieldState.error?.message} />
              )} />
              <Controller name="ifscCode" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} label="IFSC Code" fullWidth onChange={(e) => field.onChange(e.target.value.toUpperCase())} error={!!fieldState.error} helperText={fieldState.error?.message} />
              )} />
              <Controller name="bankId" control={form.control} render={({ field, fieldState }) => (
                <TextField {...field} select label="Bank" fullWidth disabled={banksLoading} error={!!fieldState.error} helperText={fieldState.error?.message}>
                  {banks.map((bank) => (
                    <MenuItem key={bank.id} value={bank.id}>{bank.name}</MenuItem>
                  ))}
                </TextField>
              )} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddOpen(false)} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={addMutation.isPending} startIcon={addMutation.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}>
              Add
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Verify Beneficiary OTP */}
      <OtpDialog
        open={Boolean(verifyState)}
        title="Verify Beneficiary"
        description="Enter OTP to verify the newly added beneficiary."
        submitting={verifyMutation.isPending}
        onClose={() => setVerifyState(null)}
        onSubmit={onVerify}
      />

      {/* Delete Beneficiary OTP */}
      <OtpDialog
        open={Boolean(deleteState)}
        title="Confirm Deletion"
        description="Enter OTP to confirm beneficiary deletion."
        submitting={verifyDeleteMutation.isPending}
        onClose={() => setDeleteState(null)}
        onSubmit={onConfirmDelete}
      />
    </Box>
  );
}
