"use client";

import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
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
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Search Sender
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter mobile number. Workflow is controlled by backend nextAction.
        </Typography>
        <Box
          component="form"
          onSubmit={form.handleSubmit((values) => onSearch(values.mobile))}
          sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}
        >
          <Controller
            name="mobile"
            control={form.control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Mobile Number"
                sx={{ flex: 1, minWidth: 220 }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                disabled={loading}
                slotProps={{ htmlInput: { maxLength: 10, inputMode: "numeric" } }}
              />
            )}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}
            sx={{ height: 56 }}
          >
            Search
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
