"use client";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

export const DMT2_STEPS = [
  "Search Retailer",
  "Registration",
  "OTP",
  "Beneficiary",
  "Transfer",
  "MPIN",
] as const;

export function dmt2StepIndex(step: string): number {
  switch (step) {
    case "search":
      return 0;
    case "register":
      return 1;
    case "otp":
      return 2;
    case "beneficiary":
      return 3;
    case "transfer":
      return 4;
    case "txnOtp":
      return 5;
    case "success":
      return 5;
    default:
      return 0;
  }
}

interface Dmt2StepperProps {
  activeStep: number;
}

export default function Dmt2Stepper({ activeStep }: Dmt2StepperProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        mb: 2.5,
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "auto",
        "& .MuiStepper-root": { minWidth: isMobile ? 0 : 640 },
        "& .MuiStepLabel-label": {
          fontSize: { xs: 11, md: 12 },
          fontWeight: 600,
        },
        "& .MuiStepIcon-root.Mui-active": { color: "primary.main" },
        "& .MuiStepIcon-root.Mui-completed": { color: "primary.main" },
      }}
    >
      <Stepper
        activeStep={activeStep}
        alternativeLabel={!isMobile}
        orientation={isMobile ? "vertical" : "horizontal"}
      >
        {DMT2_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
