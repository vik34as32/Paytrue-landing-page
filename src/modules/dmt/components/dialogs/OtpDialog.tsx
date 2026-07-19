"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import {
  Dialog,
  Button,
  Typography,
  Box,
  CircularProgress,
  InputBase,
  Divider,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

const OTP_LENGTH = 6;

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

/** Extract transfer / OTP summary bits from description when present. */
function parseOtpHint(description: string) {
  const amountMatch = description.match(/₹\s*([\d,]+(?:\.\d+)?)/i);
  const modeMatch = description.match(/\b(IMPS|NEFT|RTGS)\b/i);
  const toMatch =
    description.match(/\b(?:IMPS|NEFT|RTGS)\s+to\s+(.+?)(?:\.|$)/i) ||
    description.match(/\bsent for\s+(.+?)(?:\.|$)/i);
  const mobileMatch = description.match(
    /(?:sent to|mobile)\s*([6-9]\d{9}|\*{0,6}\d{4})/i
  );
  return {
    amount: amountMatch?.[1] ? `₹${amountMatch[1]}` : null,
    mode: modeMatch?.[1]?.toUpperCase() ?? null,
    beneficiary: toMatch?.[1]?.trim() || null,
    mobile: mobileMatch?.[1] || null,
  };
}

export default function OtpDialog({
  open,
  title = "Enter OTP",
  description = "Enter the 6-digit OTP.",
  submitting = false,
  resendSeconds = 30,
  onClose,
  onSubmit,
  onResend,
}: OtpDialogProps) {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(resendSeconds);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const otp = useMemo(() => digits.join(""), [digits]);
  const complete = otp.length === OTP_LENGTH;
  const hint = useMemo(() => parseOtpHint(description), [description]);
  const showTxnCard = Boolean(
    hint.amount || hint.beneficiary || hint.mode || hint.mobile
  );

  useEffect(() => {
    if (open) {
      setDigits(Array(OTP_LENGTH).fill(""));
      setTimer(resendSeconds);
      setFocusedIndex(0);
      const id = setTimeout(() => inputsRef.current[0]?.focus(), 80);
      return () => clearTimeout(id);
    }
  }, [open, resendSeconds]);

  useEffect(() => {
    if (!open || !onResend || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [open, onResend, timer]);

  const focusInput = (index: number) => {
    const next = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    setFocusedIndex(next);
    const el = inputsRef.current[next];
    el?.focus();
    el?.select();
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
      let cursor = index;
      for (const ch of clean) {
        if (cursor >= OTP_LENGTH) break;
        next[cursor] = ch;
        cursor += 1;
      }
      focusInput(cursor >= OTP_LENGTH ? OTP_LENGTH - 1 : cursor);
      return next;
    });
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      setDigits((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = "";
        else if (index > 0) {
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
    } else if (event.key === "Enter" && complete && !submitting) {
      event.preventDefault();
      onSubmit(otp);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted) handleChange(index, pasted);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: { bgcolor: "rgba(10, 22, 40, 0.55)" },
        },
        paper: {
          sx: {
            borderRadius: 1.5,
            overflow: "hidden",
            boxShadow: "0 16px 48px rgba(10, 22, 40, 0.28)",
            border: "1px solid #d7dee8",
          },
        },
      }}
    >
      {/* Bank-style navy header */}
      <Box
        sx={{
          bgcolor: "#0b2a4a",
          color: "#fff",
          px: 2.5,
          py: 1.75,
          display: "flex",
          alignItems: "center",
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1,
            bgcolor: "rgba(255,255,255,0.12)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <AccountBalanceOutlinedIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: "0.98rem",
              letterSpacing: 0.2,
              lineHeight: 1.25,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.72)", mt: 0.15 }}>
            Secure authentication · PayTrue Banking
          </Typography>
        </Box>
        <LockOutlinedIcon sx={{ fontSize: 18, opacity: 0.85 }} />
      </Box>

      <Box sx={{ bgcolor: "#fff", px: 2.5, pt: 2.25, pb: 2.5 }}>
        {/* Transaction summary — bank slip style */}
        {showTxnCard ? (
          <Box
            sx={{
              border: "1px solid #d9e2ec",
              borderRadius: 1,
              bgcolor: "#f5f8fb",
              mb: 2.25,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 1.75,
                py: 1,
                bgcolor: "#eaf1f8",
                borderBottom: "1px solid #d9e2ec",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: "#5a6f86",
                }}
              >
                Transaction details
              </Typography>
            </Box>
            <Box sx={{ px: 1.75, py: 1.35, display: "grid", gap: 1 }}>
              {hint.amount ? (
                <Row label="Amount" value={hint.amount} emphasize />
              ) : null}
              {hint.mode ? <Row label="Mode" value={hint.mode} /> : null}
              {hint.beneficiary ? (
                <Row label="Beneficiary" value={hint.beneficiary} />
              ) : null}
              {hint.mobile ? (
                <Row label="OTP sent to" value={hint.mobile} />
              ) : null}
            </Box>
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: 13,
              color: "#4b5c72",
              lineHeight: 1.55,
              mb: 2.25,
              textAlign: "center",
            }}
          >
            {description}
          </Typography>
        )}

        {!showTxnCard ? null : (
          <Typography
            sx={{
              fontSize: 12.5,
              color: "#4b5c72",
              lineHeight: 1.5,
              mb: 1.75,
              textAlign: "center",
            }}
          >
            {hint.amount
              ? "Enter the 6-digit OTP to authorise this transaction"
              : "Enter the 6-digit OTP received on registered mobile"}
          </Typography>
        )}

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
            color: "#6b7c90",
            mb: 1.15,
            textAlign: "center",
          }}
        >
          Enter OTP
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: { xs: 0.75, sm: 1 },
            mb: 2,
          }}
        >
          {digits.map((digit, index) => {
            const isFocused = focusedIndex === index;
            const isFilled = Boolean(digit);
            return (
              <InputBase
                key={index}
                inputRef={(el: HTMLInputElement | HTMLTextAreaElement | null) => {
                  inputsRef.current[index] = el as HTMLInputElement | null;
                }}
                value={digit}
                disabled={submitting}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) =>
                  handleKeyDown(index, e as KeyboardEvent<HTMLInputElement>)
                }
                onPaste={(e) =>
                  handlePaste(index, e as ClipboardEvent<HTMLInputElement>)
                }
                onFocus={(e) => {
                  setFocusedIndex(index);
                  e.target.select();
                }}
                slotProps={{
                  input: {
                    inputMode: "numeric",
                    maxLength: 1,
                    "aria-label": `OTP digit ${index + 1}`,
                    style: { textAlign: "center", padding: 0 },
                  },
                }}
                sx={{
                  width: { xs: 40, sm: 44 },
                  height: { xs: 48, sm: 52 },
                  borderRadius: 0.75,
                  border: "1.5px solid",
                  borderColor: isFocused
                    ? "#0b2a4a"
                    : isFilled
                      ? "#7a93ad"
                      : "#c5d0dc",
                  bgcolor: "#fff",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#0b2a4a",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  boxShadow: isFocused ? "inset 0 -2px 0 #0b2a4a" : "none",
                  transition: "border-color 0.12s ease, box-shadow 0.12s ease",
                  "& input": {
                    height: "100%",
                    width: "100%",
                    textAlign: "center",
                    padding: 0,
                    caretColor: "#0b2a4a",
                    MozAppearance: "textfield",
                  },
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    {
                      WebkitAppearance: "none",
                      margin: 0,
                    },
                }}
              />
            );
          })}
        </Box>

        {onResend ? (
          <Box sx={{ textAlign: "center", mb: 2, minHeight: 24 }}>
            {timer > 0 ? (
              <Typography sx={{ fontSize: 12.5, color: "#6b7c90" }}>
                OTP valid · Resend in{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: "#0b2a4a",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {String(Math.floor(timer / 60)).padStart(2, "0")}:
                  {String(timer % 60).padStart(2, "0")}
                </Box>
              </Typography>
            ) : (
              <Button
                size="small"
                onClick={() => {
                  onResend();
                  setDigits(Array(OTP_LENGTH).fill(""));
                  setTimer(resendSeconds);
                  focusInput(0);
                }}
                disabled={submitting}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#0b2a4a",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  minWidth: 0,
                  p: 0,
                  "&:hover": { bgcolor: "transparent", color: "#164a7a" },
                }}
              >
                Resend OTP
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ mb: 1.5 }} />
        )}

        <Box sx={{ display: "flex", gap: 1.25 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            disabled={submitting}
            sx={{
              py: 1.15,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              color: "#0b2a4a",
              borderColor: "#b8c5d4",
              bgcolor: "#fff",
              "&:hover": {
                borderColor: "#0b2a4a",
                bgcolor: "#f5f8fb",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            disabled={submitting || !complete}
            onClick={() => onSubmit(otp)}
            startIcon={
              submitting ? (
                <CircularProgress size={15} color="inherit" />
              ) : undefined
            }
            sx={{
              py: 1.15,
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 14,
              bgcolor: "#0b2a4a",
              boxShadow: "none",
              "&:hover": { bgcolor: "#08325c", boxShadow: "none" },
              "&.Mui-disabled": {
                bgcolor: "#c5d0dc",
                color: "#fff",
              },
            }}
          >
            {submitting ? "Authenticating…" : "Confirm"}
          </Button>
        </Box>

        <Divider sx={{ my: 2, borderColor: "#e4ebf2" }} />

        <Typography
          sx={{
            textAlign: "center",
            fontSize: 11,
            color: "#8a9aab",
            lineHeight: 1.45,
          }}
        >
          Never share OTP with anyone. PayTrue never asks for OTP over phone or
          email.
        </Typography>
      </Box>
    </Dialog>
  );
}

function Row({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: 12, color: "#6b7c90", fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: emphasize ? 15 : 13,
          fontWeight: emphasize ? 800 : 700,
          color: "#0b2a4a",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
