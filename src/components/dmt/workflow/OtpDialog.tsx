"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

interface OtpDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  submitting?: boolean;
  resendSeconds?: number;
  onClose: () => void;
  onSubmit: (otp: string) => void;
  onResend?: () => void;
}

export default function OtpDialog({
  open,
  title = "Enter OTP",
  description = "Enter the 6-digit OTP sent to the registered mobile number.",
  submitting = false,
  resendSeconds = 30,
  onClose,
  onSubmit,
  onResend,
}: OtpDialogProps) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(resendSeconds);

  useEffect(() => {
    if (open) {
      setOtp("");
      setTimer(resendSeconds);
    }
  }, [open, resendSeconds]);

  useEffect(() => {
    if (!open || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, timer]);

  const handleSubmit = () => {
    if (otp.length < 4) return;
    onSubmit(otp);
  };

  const handleResend = () => {
    if (!onResend) return;

    onResend();
    setOtp("");
    setTimer(resendSeconds);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {description}
        </Typography>

        <TextField
  autoFocus
  fullWidth
  value={otp}
  onChange={(e) =>
    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
  }
  placeholder="Enter OTP"
  disabled={submitting}
  slotProps={{
    htmlInput: {
      inputMode: "numeric",
      maxLength: 6,
      style: {
        letterSpacing: "8px",
        textAlign: "center",
        fontSize: "22px",
      },
    },
  }}
/>

        {onResend && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              size="small"
              disabled={timer > 0}
              onClick={handleResend}
            >
              {timer > 0
                ? `Resend OTP in ${timer}s`
                : "Resend OTP"}
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          color="inherit"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || otp.length < 4}
          startIcon={
            submitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : undefined
          }
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
}