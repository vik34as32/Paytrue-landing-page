"use client";

import {
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useBankAccountVerification } from "@/src/hooks/useBankAccountVerification";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import type { VerifyBankAccountResponse } from "@/src/types/dmt";

interface BankAccountVerifyFieldProps {
  value: string;
  onChange: (value: string) => void;
  ifscCode: string;
  name?: string;
  verifyFn: (input: {
    accountNumber: string;
    ifscCode: string;
    name?: string;
  }) => Promise<VerifyBankAccountResponse>;
  onVerified?: (result: VerifyBankAccountResponse) => void;
  /** Fires when retailer clicks Verify (before API call) — e.g. auto-fill confirm account */
  onVerifyClick?: () => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export default function BankAccountVerifyField({
  value,
  onChange,
  ifscCode,
  name,
  verifyFn,
  onVerified,
  onVerifyClick,
  error,
  helperText,
  disabled = false,
}: BankAccountVerifyFieldProps) {
  const { verify, verifying, verified, holderName, nameMatchPercent } =
    useBankAccountVerification({
      accountNumber: value,
      ifscCode,
      name,
      verifyFn,
      onVerified,
    });

  const handleVerifyClick = () => {
    onVerifyClick?.();
    void verify();
  };

  const successHelper = verified
    ? holderName
      ? `Verified account holder: ${holderName}${
          nameMatchPercent != null ? ` (${nameMatchPercent}% match)` : ""
        }`
      : "Bank account verified"
    : helperText;

  return (
    <Box>
      <TextField
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 18))}
        label="Account Number"
        fullWidth
        inputMode="numeric"
        disabled={disabled || verifying}
        error={error}
        helperText={successHelper}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {verified ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleVerifyClick}
                    disabled={disabled || verifying || !value.trim() || !ifscCode.trim()}
                    sx={{ minWidth: 72, whiteSpace: "nowrap" }}
                  >
                    {verifying ? <CircularProgress size={16} /> : "Verify"}
                  </Button>
                )}
              </InputAdornment>
            ),
          },
        }}
      />
      {!ifscCode.trim() && value.trim() ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
          Enter IFSC code to verify bank account
        </Typography>
      ) : null}

      <ProcessLoadingOverlay
        open={verifying}
        message="Please wait..."
        detail="Connecting to bank server — verifying account"
      />
    </Box>
  );
}
