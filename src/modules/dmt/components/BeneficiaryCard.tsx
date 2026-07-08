"use client";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import type { DmtBeneficiary } from "../types";

function maskAccount(value: string) {
  if (!value || value.length < 4) return value;
  return value.slice(-4).padStart(value.length, "•");
}

interface BeneficiaryCardProps {
  beneficiary: DmtBeneficiary;
  onTransfer: (beneficiary: DmtBeneficiary) => void;
  onDelete: (beneficiary: DmtBeneficiary) => void;
}

export default function BeneficiaryCard({
  beneficiary,
  onTransfer,
  onDelete,
}: BeneficiaryCardProps) {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {beneficiary.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {beneficiary.bankName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A/C {maskAccount(beneficiary.accountNumber)} • {beneficiary.ifscCode}
            </Typography>
          </Box>
          <Chip
            label={beneficiary.isVerified ? "VERIFIED" : "UNVERIFIED"}
            color={beneficiary.isVerified ? "success" : "warning"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            startIcon={<SendIcon />}
            onClick={() => onTransfer(beneficiary)}
            disabled={!beneficiary.isVerified}
          >
            Transfer
          </Button>
          <IconButton size="small" color="error" onClick={() => onDelete(beneficiary)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
