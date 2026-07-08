"use client";

import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepButton from "@mui/material/StepButton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  DmtWorkflowProvider,
  useDmtWorkflow,
  DMT_STEPS,
  STEP,
} from "./DmtWorkflowContext";
import SearchSenderStep from "./steps/SearchSenderStep";
import SenderDetailsStep from "./steps/SenderDetailsStep";
import BeneficiariesStep from "./steps/BeneficiariesStep";
import TransferStep from "./steps/TransferStep";
import ReceiptStep from "./steps/ReceiptStep";

const workflowTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1565d8", dark: "#001F5B", light: "#0A84FF" },
    background: { default: "#f1f5f9", paper: "#ffffff" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "inherit",
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

function WorkflowInner() {
  const { step, goToStep } = useDmtWorkflow();
  const isMobile = useMediaQuery("(max-width:600px)");

  const content = useMemo(() => {
    switch (step) {
      case STEP.SEARCH:
        return <SearchSenderStep />;
      case STEP.DETAILS:
        return <SenderDetailsStep />;
      case STEP.BENEFICIARIES:
        return <BeneficiariesStep />;
      case STEP.TRANSFER:
        return <TransferStep />;
      case STEP.RECEIPT:
        return <ReceiptStep />;
      default:
        return <SearchSenderStep />;
    }
  }, [step]);

  return (
    <Box sx={{ bgcolor: "background.default", borderRadius: 3, p: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Money Transfer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search sender, manage beneficiaries and transfer securely in one flow.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, border: "1px solid", borderColor: "divider" }}>
        <Stepper
          activeStep={step}
          alternativeLabel={!isMobile}
          orientation={isMobile ? "vertical" : "horizontal"}
          nonLinear
        >
          {DMT_STEPS.map((label, index) => (
            <Step key={label} completed={index < step}>
              {index < step ? (
                <StepButton color="inherit" onClick={() => goToStep(index)}>
                  {label}
                </StepButton>
              ) : (
                <StepLabel>{label}</StepLabel>
              )}
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Box sx={{ maxWidth: 900, mx: "auto" }}>{content}</Box>
    </Box>
  );
}

export default function DmtWorkflow() {
  return (
    <ThemeProvider theme={workflowTheme}>
      <DmtWorkflowProvider>
        <WorkflowInner />
      </DmtWorkflowProvider>
    </ThemeProvider>
  );
}
