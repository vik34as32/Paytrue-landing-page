"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  InputBase,
} from "@mui/material";

const OTP_LENGTH = 6;

interface OtpDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

export default function OtpDialog({
  open,
  title = "Enter OTP",
  description = "Enter the 6-digit OTP.",
  submitting = false,
  onClose,
  onSubmit,
}: OtpDialogProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const otp = useMemo(() => digits.join(""), [digits]);

  useEffect(() => {
    if (open) {
      setDigits(Array(OTP_LENGTH).fill(""));
      // Focus the first box once the dialog is rendered.
      const timer = setTimeout(() => inputsRef.current[0]?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const focusInput = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))];
    target?.focus();
    target?.select();
  };

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      // Support typing/pasting multiple digits starting at this box.
      const chars = clean.split("");
      let cursor = index;
      for (const ch of chars) {
        if (cursor >= OTP_LENGTH) break;
        next[cursor] = ch;
        cursor += 1;
      }
      focusInput(cursor);
      return next;
    });
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = "";
        } else if (index > 0) {
          next[index - 1] = "";
          focusInput(index - 1);
        }
        return next;
      });
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    } else if (event.key === "Enter" && otp.length === OTP_LENGTH && !submitting) {
      event.preventDefault();
      onSubmit(otp);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted) handleChange(index, pasted);
  };

  const complete = otp.length === OTP_LENGTH;

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          {digits.map((digit, index) => (
            <InputBase
              key={index}
              inputRef={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
                inputsRef.current[index] = el as HTMLInputElement | null;
              }}
              value={digit}
              disabled={submitting}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e as KeyboardEvent<HTMLInputElement>)}
              onPaste={(e) => handlePaste(index, e as ClipboardEvent<HTMLInputElement>)}
              onFocus={(e) => e.target.select()}
              slotProps={{
                input: {
                  inputMode: "numeric",
                  maxLength: 1,
                  "aria-label": `OTP digit ${index + 1}`,
                  style: { textAlign: "center", padding: 0 },
                },
              }}
              sx={{
                width: { xs: 42, sm: 48 },
                height: { xs: 50, sm: 56 },
                borderRadius: 2,
                border: "1.5px solid",
                borderColor: digit ? "primary.main" : "divider",
                fontSize: 24,
                fontWeight: 700,
                color: "text.primary",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
                "&.Mui-focused": {
                  borderColor: "primary.main",
                  boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}22`,
                },
                "& input": {
                  height: "100%",
                  width: "100%",
                  textAlign: "center",
                  padding: 0,
                  MozAppearance: "textfield",
                },
              }}
            />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={submitting || !complete}
          onClick={() => onSubmit(otp)}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
}
