"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CheckCircle2 } from "lucide-react";
import { keyframes } from "@mui/system";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function VerificationSuccess() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        py: 4,
        animation: `${fadeUp} 0.45s ease-out`,
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          bgcolor: "success.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 14px 36px rgba(22, 163, 74, 0.35)",
        }}
      >
        <CheckCircle2 size={56} strokeWidth={2} />
      </Box>

      <Typography
        variant="h5"
        color="success.main"
        sx={{ fontWeight: 800, textAlign: "center" }}
      >
        Biometric Verification Successful
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 360, textAlign: "center" }}>
        Your merchant account is verified. Opening your dashboard...
      </Typography>
    </Box>
  );
}
