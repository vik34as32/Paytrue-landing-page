"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Fingerprint } from "lucide-react";
import { keyframes } from "@mui/system";

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 0.85; }
`;

const ripple = keyframes`
  0% { transform: scale(0.85); opacity: 0.5; }
  100% { transform: scale(1.35); opacity: 0; }
`;

interface FingerprintScannerProps {
  active?: boolean;
  statusText?: string;
  /** Shown while RD capture is in progress (Mantra LED glow phase) */
  scanningText?: string;
}

export default function FingerprintScanner({
  active = false,
  statusText = "Place your finger on the scanner",
  scanningText = "Scanner active — place your finger. Mantra device light will glow.",
}: FingerprintScannerProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        py: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 160,
          height: 160,
          display: "grid",
          placeItems: "center",
        }}
      >
        {active ? (
          <>
            <Box
              sx={{
                position: "absolute",
                inset: 8,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "primary.light",
                animation: `${ripple} 1.8s ease-out infinite`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 20,
                borderRadius: "50%",
                border: "2px solid",
                borderColor: "primary.main",
                animation: `${ripple} 1.8s ease-out infinite`,
                animationDelay: "0.45s",
              }}
            />
          </>
        ) : null}

        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: active ? "primary.main" : "primary.dark",
            color: "#fff",
            boxShadow: active
              ? "0 16px 40px rgba(21, 101, 216, 0.35)"
              : "0 10px 30px rgba(0, 31, 91, 0.25)",
            animation: active ? `${pulse} 1.6s ease-in-out infinite` : "none",
            transition: "all 0.35s ease",
          }}
        >
          <Fingerprint size={64} strokeWidth={1.75} />
        </Box>
      </Box>

      <Typography
        variant="body1"
        color={active ? "primary.main" : "text.secondary"}
        align="center"
        sx={{ maxWidth: 320, fontWeight: active ? 700 : 500 }}
      >
        {active ? scanningText : statusText}
      </Typography>

      {active ? (
        <Typography
          variant="caption"
          align="center"
          sx={{
            maxWidth: 320,
            color: "primary.main",
            fontWeight: 600,
            animation: "pulse 1.2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.7 },
              "50%": { opacity: 1 },
            },
          }}
        >
          ● Scanner LED on — do not remove finger
        </Typography>
      ) : null}
    </Box>
  );
}
