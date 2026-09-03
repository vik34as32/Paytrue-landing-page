"use client";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import type { Dmt3Step } from "../types/dmt3.types";

export const DMT3_STEPS = [
  "Retailer",
  "Beneficiary",
  "Transfer",
  "Commission",
  "Review",
  "MPIN",
] as const;

export function dmt3StepIndex(step: Dmt3Step | string): number {
  switch (step) {
    case "start":
      return 0;
    case "beneficiary":
      return 1;
    case "transfer":
      return 2;
    case "commission":
      return 3;
    case "review":
      return 4;
    case "mpin":
      return 5;
    case "success":
      return 5;
    default:
      return 0;
  }
}

interface Dmt3StepperProps {
  activeStep: number;
}

export default function Dmt3Stepper({ activeStep }: Dmt3StepperProps) {
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
        {DMT3_STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
