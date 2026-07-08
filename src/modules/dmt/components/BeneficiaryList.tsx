"use client";

import { Box, Typography, Button, Skeleton, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BeneficiaryCard from "./BeneficiaryCard";
import type { DmtBeneficiary } from "../types";

interface BeneficiaryListProps {
  beneficiaries: DmtBeneficiary[];
  loading?: boolean;
  error?: string | null;
  onAdd: () => void;
  onTransfer: (beneficiary: DmtBeneficiary) => void;
  onDelete: (beneficiary: DmtBeneficiary) => void;
}

export default function BeneficiaryList({
  beneficiaries,
  loading = false,
  error,
  onAdd,
  onTransfer,
  onDelete,
}: BeneficiaryListProps) {
  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Beneficiaries
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          Add Beneficiary
        </Button>
      </Box>

      {loading ? <Skeleton variant="rounded" height={180} /> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {!loading && beneficiaries.length === 0 ? (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            No Beneficiary
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a beneficiary to continue transfer.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            Add Beneficiary
          </Button>
        </Box>
      ) : null}

      {!loading && beneficiaries.length > 0 ? (
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          {beneficiaries.map((item) => (
            <BeneficiaryCard
              key={item.id}
              beneficiary={item}
              onTransfer={onTransfer}
              onDelete={onDelete}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
