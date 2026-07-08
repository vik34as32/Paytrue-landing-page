"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { useDmtOrchestrator } from "../hooks";
import DmtStepper from "../components/DmtStepper";
import LoadingOverlay from "../components/LoadingOverlay";
import DmtSnackbar from "../components/DmtSnackbar";
import SearchSenderCard from "../components/SearchSenderCard";
import SenderInfoCard from "../components/SenderInfoCard";
import BeneficiaryList from "../components/BeneficiaryList";
import TransferCard from "../components/TransferCard";
import TransactionReceipt from "../components/TransactionReceipt";
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
    searchSender,
    registerSender,
    verifySenderOtp,
    bioAuth,
    addBeneficiary,
    verifyBeneficiaryOtp,
    deleteBeneficiary,
    verifyBeneficiaryDelete,
    generateTransactionOtp,
    verifyTransactionOtpAndTransfer,
    resetAll,
    openAddBeneficiary,
    closeDialog,
    setSelectedBeneficiary,
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

  useEffect(() => {
    // Auto-open the biometric modal whenever backend asks for BIO_AUTH.
    if (showBioAuth) setBioModalOpen(true);
  }, [showBioAuth]);

  const showTransfer =
    Boolean(beneficiary.selected) &&
    ["SELECT_BENEFICIARY", "GENERATE_TRANSACTION_OTP", "TRANSFER"].includes(
      workflow.nextAction ?? ""
    );
  const showReceipt = workflow.nextAction === "SUCCESS" || workflow.nextAction === "FAILED";

  const loading = workflow.loadingCount > 0;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          Domestic Money Transfer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Backend controls workflow via nextAction. Frontend only renders the next step.
        </Typography>

        <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <DmtStepper activeStep={workflow.activeStep} />

          {!showReceipt ? (
            <Box sx={{ display: "grid", gap: 3 }}>
              {/* <SearchSenderCard
                defaultMobile={sender.mobile}
                loading={loading}
                onSearch={searchSender}
              /> */}

              {showBioAuth ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
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
                  >
                    Open Biometric
                  </Button>
                </Paper>
              ) : null}

              {showBeneficiarySection ? (
                <>
                  <SenderInfoCard sender={sender.profile} mobile={sender.mobile} />
                  <BeneficiaryList
                    beneficiaries={beneficiaries}
                    loading={beneficiariesLoading}
                    error={workflow.error}
                    onAdd={openAddBeneficiary}
                    onTransfer={(item: DmtBeneficiary) => {
                      setSelectedBeneficiary(item);
                    }}
                    onDelete={async (item) => {
                      setSelectedBeneficiary(item);
                      await deleteBeneficiary(item.id);
                    }}
                  />
                </>
              ) : null}

              {showTransfer ? (
                <TransferCard
                  beneficiary={beneficiary.selected}
                  loading={loading}
                  onContinue={async (values) => {
                    setTransactionDraft(values);
                    await generateTransactionOtp();
                  }}
                />
              ) : null}
            </Box>
          ) : (
            <TransactionReceipt
              transaction={transaction.result}
              failed={workflow.nextAction === "FAILED"}
              onDone={resetAll}
              onRetry={() => {
                if (beneficiary.selected) {
                  setSelectedBeneficiary(beneficiary.selected);
                }
              }}
            />
          )}
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
          loading={loading}
          onClose={() => setBioModalOpen(false)}
          onSubmit={(payload) => {
            setBioModalOpen(false);
            bioAuth(payload);
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
            bankId: values.bankId,
            accountNumber: values.accountNumber,
            ifscCode: values.ifscCode,
            beneficiaryMobileNumber: values.beneficiaryMobileNumber,
          })
        }
      />

      <OtpDialog
        open={workflow.activeDialog === "beneficiaryOtp"}
        title="Verify Beneficiary OTP"
        description="Enter OTP to verify beneficiary."
        submitting={loading}
        onClose={closeDialog}
        onSubmit={verifyBeneficiaryOtp}
      />

      <DeleteBeneficiaryDialog
        open={workflow.activeDialog === "deleteBeneficiary"}
        loading={loading}
        onClose={closeDialog}
        onSubmit={verifyBeneficiaryDelete}
      />

      <OtpDialog
        open={workflow.activeDialog === "transactionOtp"}
        title="Transaction OTP"
        description="Enter OTP to authorize transfer."
        submitting={loading}
        onClose={closeDialog}
        onSubmit={verifyTransactionOtpAndTransfer}
      />

      <LoadingOverlay open={loading} />
      <DmtSnackbar />
    </ThemeProvider>
  );
}
