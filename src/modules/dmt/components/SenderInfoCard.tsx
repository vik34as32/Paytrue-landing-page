"use client";

import { Avatar, Box, Chip, Typography } from "@mui/material";
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
  const profile = sender ?? { mobile, name: "Remitter" };
  const count = beneficiaryCount ?? profile.beneficiaryCount ?? 0;
  const displayName = (profile.name || "Remitter").trim();
  const displayMobile = profile.mobile || mobile || "—";
  const verified = Boolean(profile.isVerified);
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const meta = [
    { label: "City", value: profile.city },
    { label: "State", value: profile.state },
    { label: "Pincode", value: profile.pincode },
  ].filter((item) => Boolean(item.value && String(item.value).trim()));

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "#fff",
        p: { xs: 2, md: 2.5 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: { xs: "stretch", md: "center" },
        gap: 2,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: "#e8f1ff",
            color: "#1565d8",
            fontWeight: 800,
            fontSize: "0.95rem",
          }}
        >
          {initials || "R"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 800,
              color: "#0b1f3a",
              fontSize: "1.05rem",
              lineHeight: 1.25,
            }}
          >
            {displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
            {displayMobile}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          justifyContent: { xs: "flex-start", md: "flex-end" },
        }}
      >
        <Chip
          label={verified ? "Verified" : "Pending"}
          color={verified ? "success" : "warning"}
          size="small"
          sx={{ fontWeight: 700, "& .MuiChip-label": { px: 1.25 } }}
        />
        <MetaPill label="Beneficiaries" value={String(count)} accent />
        {meta.map((item) => (
          <MetaPill key={item.label} label={item.label} value={String(item.value)} />
        ))}
      </Box>
    </Box>
  );
}

function MetaPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Box
      sx={{
        px: 1.25,
        py: 0.75,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: accent ? "#bfdbfe" : "#e2e8f0",
        bgcolor: accent ? "#eff6ff" : "#f8fafc",
        minWidth: 88,
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#64748b",
          lineHeight: 1.2,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0b1f3a", mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}
