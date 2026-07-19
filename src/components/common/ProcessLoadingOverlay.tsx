"use client";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HourglassIcon from "./HourglassIcon";

interface ProcessLoadingOverlayProps {
  open: boolean;
  /** Primary line — e.g. "Please wait..." */
  message?: string;
  /** Secondary line — e.g. "Connecting to bank server..." */
  detail?: string;
  /** Use absolute fill inside a relative parent instead of full-screen */
  local?: boolean;
  zIndex?: number;
}

/**
 * Server-process style loader: hourglass + dimmed overlay so retailer
 * clearly feels work is in progress (login / bank verify / OTP).
 */
export default function ProcessLoadingOverlay({
  open,
  message = "Please wait...",
  detail,
  local = false,
  zIndex,
}: ProcessLoadingOverlayProps) {
  if (!open) return null;

  const content = (
    <Box
      sx={{
        textAlign: "center",
        px: 3,
        py: 2.5,
        borderRadius: 3,
        bgcolor: "rgba(15, 23, 42, 0.55)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(6px)",
        minWidth: 200,
      }}
    >
      <HourglassIcon size={68} />
      <Typography
        sx={{
          mt: 1.5,
          fontWeight: 700,
          fontSize: "1rem",
          color: "#fff",
          letterSpacing: 0.2,
        }}
      >
        {message}
      </Typography>
      {detail ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: "0.8rem",
            color: "rgba(226,232,240,0.9)",
            maxWidth: 260,
            mx: "auto",
            lineHeight: 1.4,
          }}
        >
          {detail}
        </Typography>
      ) : null}
    </Box>
  );

  if (local) {
    return (
      <Box
        role="status"
        aria-live="polite"
        aria-busy="true"
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: zIndex ?? 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(15, 23, 42, 0.72)",
          borderRadius: "inherit",
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => zIndex ?? theme.zIndex.modal + 4,
        color: "#fff",
        bgcolor: "rgba(2, 6, 23, 0.72)",
      }}
    >
      {content}
    </Backdrop>
  );
}
