"use client";

import { useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { normalizeBankList } from "@/src/lib/bankLogos";
import type { DmtBank } from "../types";

interface DmtBankSelectProps {
  banks: DmtBank[];
  value: string;
  onChange: (bankId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

function BankLogoImage({ src, name, size = 28 }: { src: string; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: "action.hover",
          color: "primary.main",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <AccountBalanceIcon sx={{ fontSize: size * 0.55 }} />
      </Box>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: 6,
        flexShrink: 0,
      }}
    />
  );
}

export default function DmtBankSelect({
  banks,
  value,
  onChange,
  loading = false,
  disabled = false,
  error = false,
  helperText,
}: DmtBankSelectProps) {
  const options = useMemo(
    () =>
      normalizeBankList(
        banks.map((bank) => ({
          id: bank.id,
          name: bank.name,
          shortName: bank.name,
          ifscPrefix: bank.ifscPrefix || bank.ifsc || bank.code || "",
          operatorCode: bank.code,
        }))
      ),
    [banks]
  );

  const selected = useMemo(
    () => options.find((bank) => bank.id === value) ?? null,
    [options, value]
  );

  return (
    <Autocomplete
      value={selected}
      options={options}
      loading={loading}
      disabled={disabled || loading}
      onChange={(_, option) => onChange(option?.id ?? "")}
      getOptionLabel={(option) => option.name}
      filterOptions={(options, { inputValue }) => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return options;
        return options.filter(
          (option) =>
            option.name.toLowerCase().includes(query) ||
            option.ifscPrefix.toLowerCase().includes(query)
        );
      }}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      noOptionsText={loading ? "Loading banks..." : "No banks found"}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            component="li"
            key={key}
            {...optionProps}
            sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1 }}
          >
            <BankLogoImage src={option.logo} name={option.name} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {option.name}
              </Typography>
              {option.ifscPrefix ? (
                <Typography variant="caption" color="text.secondary">
                  IFSC: {option.ifscPrefix}
                </Typography>
              ) : null}
            </Box>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Bank"
          placeholder={loading ? "Loading banks..." : "Search and select bank"}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
}
