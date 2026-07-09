"use client";

import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import type { DmtSender } from "../types";

interface SenderInfoCardProps {
  sender: DmtSender | null;
  mobile: string;
  beneficiaryCount?: number;
}

export default function SenderInfoCard({
  sender,
  mobile,
  beneficiaryCount,
}: SenderInfoCardProps) {
  const profile = sender ?? { mobile, name: "Sender" };
  const count =
    beneficiaryCount ?? profile.beneficiaryCount ?? 0;

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {profile.name || "Sender"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profile.mobile || mobile}
            </Typography>
          </Box>
          <Chip
            label={(profile.verificationStatus || "pending").toUpperCase()}
            color={profile.isVerified ? "success" : "warning"}
            size="small"
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" } }}>
          <Info label="City" value={profile.city || "-"} />
          <Info label="State" value={profile.state || "-"} />
          <Info label="Pincode" value={profile.pincode || "-"} />
          <Info label="Beneficiaries" value={String(count)} />
        </Box>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.25, bgcolor: "grey.50", borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
