"use client";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { BankLogo } from "@/components/retailer/BankLogo";
import type { DmtBeneficiary } from "../types";

function maskAccount(value: string) {
  if (!value || value.length < 4) return value;
  return `•••• ${value.slice(-4)}`;
}

interface BeneficiaryCardProps {
  beneficiary: DmtBeneficiary;
  onVerify: (beneficiary: DmtBeneficiary) => void;
  onDelete: (beneficiary: DmtBeneficiary) => void;
  onTransfer?: (beneficiary: DmtBeneficiary) => void;
}

export default function BeneficiaryCard({
  beneficiary,
  onVerify,
  onDelete,
  onTransfer,
}: BeneficiaryCardProps) {
  const verified = Boolean(beneficiary.isVerified);

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
          <Box sx={{ display: "flex", gap: 1.5, minWidth: 0 }}>
            <BankLogo
              bank={{
                name: beneficiary.bankName,
                ifscPrefix: beneficiary.ifscCode?.slice(0, 4) || "",
              }}
              size={40}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {beneficiary.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {beneficiary.bankName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A/C {maskAccount(beneficiary.accountNumber)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                IFSC {beneficiary.ifscCode}
              </Typography>
              {beneficiary.mobile ? (
                <Typography variant="body2" color="text.secondary">
                  Mobile {beneficiary.mobile}
                </Typography>
              ) : null}
            </Box>
          </Box>
          <Chip
            label={verified ? "Verified" : "Unverified →"}
            size="small"
            icon={
              verified ? (
                <VerifiedUserIcon sx={{ fontSize: "15px !important", color: "#fff !important" }} />
              ) : undefined
            }
            onClick={verified ? undefined : () => onVerify(beneficiary)}
            sx={{
              fontWeight: 800,
              height: 28,
              fontSize: 11,
              cursor: verified ? "default" : "pointer",
              pointerEvents: verified ? "none" : "auto",
              ...(verified
                ? {
                    bgcolor: "#16a34a",
                    color: "#fff",
                    border: "1px solid #15803d",
                    boxShadow: "0 2px 8px rgba(22, 163, 74, 0.28)",
                    "& .MuiChip-icon": { ml: 0.75 },
                    "& .MuiChip-label": { px: 0.75 },
                  }
                : {
                    bgcolor: "#f59e0b",
                    color: "#fff",
                    border: "1px solid #d97706",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
                    "&:hover": { bgcolor: "#d97706" },
                    "& .MuiChip-label": { px: 0.75 },
                  }),
            }}
          />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
          {!verified ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<VerifiedUserIcon />}
              onClick={() => onVerify(beneficiary)}
              sx={{
                fontWeight: 800,
                boxShadow: "0 0 0 0 rgba(21, 101, 216, 0.5)",
                animation: "dmtCardVerifyPulse 1.6s ease-out infinite",
                "@keyframes dmtCardVerifyPulse": {
                  "0%": { boxShadow: "0 0 0 0 rgba(21, 101, 216, 0.5)" },
                  "70%": { boxShadow: "0 0 0 10px rgba(21, 101, 216, 0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(21, 101, 216, 0)" },
                },
              }}
            >
              Verify now
            </Button>
          ) : null}
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(beneficiary)}
          >
            Delete
          </Button>
          {verified && onTransfer ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<SendIcon />}
              onClick={() => onTransfer(beneficiary)}
            >
              Transfer
            </Button>
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}
