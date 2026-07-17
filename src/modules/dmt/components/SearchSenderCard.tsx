"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const schema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
});

type FormValues = z.infer<typeof schema>;

interface SearchSenderCardProps {
  defaultMobile?: string;
  loading?: boolean;
  onSearch: (mobile: string) => void;
}

export default function SearchSenderCard({
  defaultMobile = "",
  loading = false,
  onSearch,
}: SearchSenderCardProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { mobile: defaultMobile },
  });

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "#fff",
        p: { xs: 2, md: 2.5 },
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0b1f3a", mb: 0.5 }}>
        Search Remitter
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter the customer&apos;s 10-digit mobile number to load beneficiaries.
      </Typography>
      <Box
        component="form"
        onSubmit={form.handleSubmit((values) => onSearch(values.mobile))}
        sx={{
          display: "flex",
          gap: 1.25,
          alignItems: "flex-start",
          flexWrap: { xs: "wrap", sm: "nowrap" },
        }}
      >
        <Controller
          name="mobile"
          control={form.control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              placeholder="Mobile number"
              fullWidth
              size="medium"
              error={!!fieldState.error}
              helperText={fieldState.error?.message || " "}
              disabled={loading}
              slotProps={{
                htmlInput: {
                  maxLength: 10,
                  inputMode: "numeric",
                  "aria-label": "Remitter mobile number",
                },
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#f8fafc",
                  borderRadius: 1.5,
                },
              }}
            />
          )}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SearchIcon />
            )
          }
          sx={{
            height: 56,
            minWidth: 120,
            px: 3,
            borderRadius: 1.5,
            boxShadow: "none",
            whiteSpace: "nowrap",
          }}
        >
          Search
        </Button>
      </Box>
    </Box>
  );
}
