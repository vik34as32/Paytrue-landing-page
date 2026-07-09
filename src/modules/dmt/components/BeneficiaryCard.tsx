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
            label={verified ? "VERIFIED" : "UNVERIFIED"}
            color={verified ? "success" : "warning"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {!verified ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<VerifiedUserIcon />}
              onClick={() => onVerify(beneficiary)}
            >
              Verify
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
