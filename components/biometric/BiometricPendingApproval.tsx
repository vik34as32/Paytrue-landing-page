"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CheckCircle2, Clock3 } from "lucide-react";
import { keyframes } from "@mui/system";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function BiometricPendingApproval() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2.5,
        py: 3,
        px: 1,
        animation: `${fadeUp} 0.45s ease-out`,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 96,
          height: 96,
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
        <Box
          sx={{
            position: "absolute",
            right: -4,
            bottom: -4,
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            borderRadius: 999,
            bgcolor: "#f59e0b",
            color: "#78350f",
            px: 1.25,
            py: 0.5,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            boxShadow: "0 8px 20px rgba(245, 158, 11, 0.35)",
          }}
        >
          <Clock3 size={12} />
          Pending
        </Box>
      </Box>

      <Stack spacing={1.25} sx={{ maxWidth: 420, textAlign: "center" }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "#166534" }}>
          Biometric verification completed successfully.
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Your verification request has been submitted to PayTrue for approval.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Approval generally takes between 2 to 24 hours.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          You will be able to use biometric services once your approval is completed.
        </Typography>

        <Typography
          variant="body2"
          sx={{ pt: 0.5, fontWeight: 600, color: "primary.main" }}
        >
          Thank you for your patience.
        </Typography>
      </Stack>
    </Box>
  );
}
