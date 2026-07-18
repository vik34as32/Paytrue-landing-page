"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { useDmtOrchestrator } from "../hooks";
import DmtStepper from "../components/DmtStepper";
import LoadingOverlay from "../components/LoadingOverlay";
import DmtSnackbar from "../components/DmtSnackbar";
import SearchSenderCard from "../components/SearchSenderCard";
import SenderInfoCard from "../components/SenderInfoCard";
import BeneficiaryList from "../components/BeneficiaryList";
import TransferModal from "../components/dialogs/TransferModal";
import CustomerReceiptModal from "@/src/components/receipt/CustomerReceiptModal";
import { mapDmtTransactionToStatement } from "@/src/lib/serviceReceiptMappers";
import OtpDialog from "../components/dialogs/OtpDialog";
import RegisterSenderDialog from "../components/dialogs/RegisterSenderDialog";
import AddBeneficiaryDialog from "../components/dialogs/AddBeneficiaryDialog";
import DeleteBeneficiaryDialog from "../components/dialogs/DeleteBeneficiaryDialog";
import BioAuthDialog from "../components/dialogs/BioAuthDialog";
import type { DmtBeneficiary } from "../types";

const theme = createTheme({
  palette: {
    primary: { main: "#1565d8" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
  },
  shape: { borderRadius: 14 },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

export default function DmtPage() {
  const {
    sender,
    beneficiary,
    transaction,
    workflow,
    beneficiaries,
    beneficiariesLoading,
    beneficiariesError,
    searchSender,
    registerSender,
    verifySenderOtp,
    bioAuth,
    addBeneficiary,
    verifyBeneficiaryOtp,
    openVerifyBeneficiary,
    deleteBeneficiary,
    verifyBeneficiaryDelete,
    startTransfer,
    cancelTransfer,
    initiateTransfer,
    generateTransactionOtp,
    verifyTransactionOtpAndTransfer,
    resetAll,
    openAddBeneficiary,
    closeDialog,
    setTransactionDraft,
  } = useDmtOrchestrator();

  const showBeneficiarySection = useMemo(
    () =>
      [
        "SENDER_PROFILE",
        "ADD_BENEFICIARY",
        "BENEFICIARY_OTP",
        "SELECT_BENEFICIARY",
        "GENERATE_TRANSACTION_OTP",
        "TRANSFER",
        "SUCCESS",
        "FAILED",
      ].includes(workflow.nextAction ?? ""),
    [workflow.nextAction]
  );

  const showBioAuth = workflow.nextAction === "BIO_AUTH";
  const [bioModalOpen, setBioModalOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const receiptTransaction = useMemo(
    () => mapDmtTransactionToStatement(transaction.result, beneficiary.selected),
    [transaction.result, beneficiary.selected]
  );

  useEffect(() => {
    if (!transaction.result) return;

    const failed =
      workflow.nextAction === "FAILED" ||
      transaction.result.status === "failed" ||
      transaction.result.status === "failure";

    if (failed) {
      setReceiptOpen(false);
      return;
    }

    const succeeded =
      workflow.nextAction === "SUCCESS" ||
      transaction.result.status === "success" ||
      transaction.result.status === "successful" ||
      transaction.result.status === "completed" ||
      !transaction.result.status;

    if (succeeded) {
      setReceiptOpen(true);
    }
  }, [workflow.nextAction, transaction.result]);

  const transferModalOpen = Boolean(
    beneficiary.selected?.isVerified &&
      sender.mobile &&
      workflow.activeDialog !== "transactionOtp"
  );
  const showFailed = workflow.nextAction === "FAILED";

  useEffect(() => {
    if (showBioAuth) setBioModalOpen(true);
  }, [showBioAuth]);

  const loading = workflow.loadingCount > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          mx: "auto",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ mb: 2, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0b1f3a", mb: 0.25 }}>
            Domestic Money Transfer
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search remitter, manage beneficiaries, and transfer money securely.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2.5,
            bgcolor: "#fff",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          <DmtStepper activeStep={workflow.activeStep} />

          {showFailed ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {transaction.result?.reason ||
                transaction.result?.message ||
                workflow.error ||
                "Transfer failed. Please try again."}
            </Alert>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
            }}
          >
            <SearchSenderCard
              defaultMobile={sender.mobile}
              loading={loading}
              onSearch={searchSender}
            />

            {showBioAuth ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                  bgcolor: "#f8fafc",
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FingerprintIcon />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    Biometric authentication required
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select scanner and capture the sender&apos;s fingerprint to continue.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<FingerprintIcon />}
                  onClick={() => setBioModalOpen(true)}
                  sx={{ boxShadow: "none" }}
                >
                  Open Biometric
                </Button>
              </Paper>
            ) : null}

            {showBeneficiarySection ? (
              <>
                <SenderInfoCard
                  sender={sender.profile}
                  mobile={sender.mobile}
                  beneficiaryCount={beneficiaries.length}
                />
                <BeneficiaryList
                  beneficiaries={beneficiaries}
                  loading={beneficiariesLoading}
                  error={beneficiariesError}
                  actionError={workflow.error}
                  onAdd={openAddBeneficiary}
                  onVerify={(item) => openVerifyBeneficiary(item)}
                  onTransfer={(item: DmtBeneficiary) => startTransfer(item)}
                  onDelete={(item) => deleteBeneficiary(item)}
                />
              </>
            ) : null}
          </Box>
        </Paper>
      </Box>

      <RegisterSenderDialog
        open={workflow.activeDialog === "register"}
        mobile={sender.mobile}
        loading={loading}
        onClose={closeDialog}
        onSubmit={(values) =>
          registerSender({
            mobile: values.mobile,
            aadhaar: values.aadhaar,
            name: sender.profile?.name,
            referenceKey: sender.referenceKey,
          })
        }
      />

      {showBioAuth ? (
        <BioAuthDialog
          open={bioModalOpen}
          mobile={sender.mobile}
          loading={loading}
          onClose={() => setBioModalOpen(false)}
          onSubmit={(payload) => {
            // Close UI only — eKYC session cleared on success/cancel/expiry, not here
            setBioModalOpen(false);
            void bioAuth(payload);
          }}
        />
      ) : null}

      <OtpDialog
        open={workflow.activeDialog === "otp"}
        title="Verify Sender OTP"
        description={`Enter OTP sent to ${sender.mobile}`}
        submitting={loading}
        onClose={closeDialog}
        onSubmit={(otp) => verifySenderOtp({ otp })}
      />

      <AddBeneficiaryDialog
        open={workflow.activeDialog === "addBeneficiary"}
        loading={loading}
        onClose={closeDialog}
        onSubmit={(values) =>
          addBeneficiary({
            name: values.name,
            instantPayBankId: values.bankId,
            accountNumber: values.accountNumber,
            ifscCode: values.ifscCode,
            beneficiaryMobileNumber: values.beneficiaryMobileNumber,
          })
        }
      />

      <OtpDialog
        open={workflow.activeDialog === "beneficiaryOtp"}
        title="Verify Beneficiary OTP"
        description={`Enter OTP sent for ${beneficiary.selected?.name || "beneficiary"}.`}
        submitting={loading}
        onClose={closeDialog}
        onSubmit={verifyBeneficiaryOtp}
      />

      <DeleteBeneficiaryDialog
        open={workflow.activeDialog === "deleteBeneficiary"}
        loading={loading}
        beneficiaryName={beneficiary.selected?.name}
        onClose={closeDialog}
        onSubmit={verifyBeneficiaryDelete}
      />

      <TransferModal
        open={transferModalOpen}
        beneficiary={beneficiary.selected}
        loading={loading}
        onClose={cancelTransfer}
        onContinue={initiateTransfer}
      />

      <OtpDialog
        open={workflow.activeDialog === "transactionOtp"}
        title="Confirm Transfer"
        description={`Enter OTP to transfer ₹${Number(transaction.draft.amount || 0).toLocaleString("en-IN")} via ${transaction.draft.transferMode} to ${beneficiary.selected?.name || "beneficiary"}.`}
        submitting={loading}
        onClose={closeDialog}
        onSubmit={verifyTransactionOtpAndTransfer}
      />

      <LoadingOverlay open={loading} />
      <DmtSnackbar />

      <CustomerReceiptModal
        open={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          resetAll();
        }}
        transaction={receiptTransaction}
        title="Money Transfer Successful"
      />
    </ThemeProvider>
  );
}
