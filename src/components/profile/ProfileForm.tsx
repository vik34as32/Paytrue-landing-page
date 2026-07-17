"use client";

import { useEffect } from "react";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HomeIcon from "@mui/icons-material/Home";
import SaveIcon from "@mui/icons-material/Save";
import LocationPicker, {
  type LocationCoords,
} from "@/src/components/profile/LocationPicker";
import type { RetailerProfileFormValues } from "@/src/services/profileApi";

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^\d{6}$/;

export const retailerProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  mobile: z
    .string()
    .trim()
    .regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  alternateMobile: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || phoneRegex.test(value),
      "Enter a valid 10-digit alternate mobile"
    ),
  gender: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  shopName: z.string().trim().min(2, "Shop name is required"),
  businessName: z.string().trim().optional().default(""),
  gstNumber: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) =>
        !value ||
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i.test(
          value
        ),
      "Enter a valid GST number"
    ),
  panNumber: z
    .string()
    .trim()
    .optional()
    .default("")
    .refine(
      (value) => !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value),
      "Enter a valid PAN number"
    ),
  addressLine1: z.string().trim().min(3, "Address line 1 is required"),
  addressLine2: z.string().trim().optional().default(""),
  state: z.string().trim().min(2, "State is required"),
  district: z.string().trim().min(2, "District is required"),
  city: z.string().trim().min(2, "City is required"),
  pincode: z
    .string()
    .trim()
    .regex(pincodeRegex, "Enter a valid 6-digit pincode"),
  latitude: z
    .string()
    .trim()
    .min(1, "Latitude is required")
    .refine((v) => Number.isFinite(Number(v)), "Invalid latitude"),
  longitude: z
    .string()
    .trim()
    .min(1, "Longitude is required")
    .refine((v) => Number.isFinite(Number(v)), "Invalid longitude"),
  currentAddress: z.string().optional().default(""),
  lastLocationUpdatedAt: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof retailerProfileSchema>;

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

interface ProfileFormProps {
  initialValues: RetailerProfileFormValues | null;
  loading?: boolean;
  submitting?: boolean;
  onSubmit: (values: ProfileFormValues) => void;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ mb: 2, alignItems: "center" }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#0b1f3a" }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function FormSkeleton() {
  return (
    <Stack spacing={3}>
      {[1, 2, 3].map((section) => (
        <Paper key={section} sx={{ p: 3, borderRadius: 3 }} elevation={0}>
          <Skeleton width="40%" height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid key={index} size={{ xs: 12, md: 6 }}>
                <Skeleton variant="rounded" height={56} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
      <Skeleton variant="rounded" height={420} />
    </Stack>
  );
}

export default function ProfileForm({
  initialValues,
  loading = false,
  submitting = false,
  onSubmit,
}: ProfileFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(retailerProfileSchema) as Resolver<ProfileFormValues>,
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      alternateMobile: "",
      gender: "",
      dateOfBirth: "",
      shopName: "",
      businessName: "",
      gstNumber: "",
      panNumber: "",
      addressLine1: "",
      addressLine2: "",
      state: "",
      district: "",
      city: "",
      pincode: "",
      latitude: "",
      longitude: "",
      currentAddress: "",
      lastLocationUpdatedAt: "",
    },
  });

  useEffect(() => {
    if (!initialValues) return;
    reset({
      ...initialValues,
      alternateMobile: initialValues.alternateMobile || "",
      gender: initialValues.gender || "",
      dateOfBirth: initialValues.dateOfBirth || "",
      businessName: initialValues.businessName || "",
      gstNumber: initialValues.gstNumber || "",
      panNumber: initialValues.panNumber || "",
      addressLine2: initialValues.addressLine2 || "",
      currentAddress: initialValues.currentAddress || "",
      lastLocationUpdatedAt: initialValues.lastLocationUpdatedAt || "",
    });
  }, [initialValues, reset]);

  const latitude = watch("latitude");
  const longitude = watch("longitude");
  const currentAddress = watch("currentAddress");
  const lastLocationUpdatedAt = watch("lastLocationUpdatedAt");

  const handleLocationChange = (coords: LocationCoords) => {
    setValue("latitude", coords.latitude, { shouldValidate: true, shouldDirty: true });
    setValue("longitude", coords.longitude, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("currentAddress", coords.currentAddress, { shouldDirty: true });
    if (coords.lastLocationUpdatedAt) {
      setValue("lastLocationUpdatedAt", coords.lastLocationUpdatedAt, {
        shouldDirty: true,
      });
    }
  };

  if (loading && !initialValues) {
    return <FormSkeleton />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <SectionHeader
            icon={<PersonIcon fontSize="small" />}
            title="Personal Information"
            subtitle="Basic identity details of the retailer"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    required
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mobile"
                    fullWidth
                    required
                    slotProps={{ htmlInput: { maxLength: 10 } }}
                    error={Boolean(errors.mobile)}
                    helperText={errors.mobile?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="alternateMobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Alternate Mobile"
                    fullWidth
                    slotProps={{ htmlInput: { maxLength: 10 } }}
                    error={Boolean(errors.alternateMobile)}
                    helperText={errors.alternateMobile?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Gender" fullWidth>
                    <MenuItem value="">Select gender</MenuItem>
                    {GENDER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <SectionHeader
            icon={<StorefrontIcon fontSize="small" />}
            title="Business Information"
            subtitle="Shop and tax registration details"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="shopName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Shop Name"
                    fullWidth
                    required
                    error={Boolean(errors.shopName)}
                    helperText={errors.shopName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="businessName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Business Name" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="gstNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="GST Number"
                    fullWidth
                    slotProps={{
                      htmlInput: { style: { textTransform: "uppercase" } },
                    }}
                    error={Boolean(errors.gstNumber)}
                    helperText={errors.gstNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="panNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="PAN Number"
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        maxLength: 10,
                        style: { textTransform: "uppercase" },
                      },
                    }}
                    error={Boolean(errors.panNumber)}
                    helperText={errors.panNumber?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <SectionHeader
            icon={<HomeIcon fontSize="small" />}
            title="Address"
            subtitle="Registered outlet address"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="addressLine1"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address Line 1"
                    fullWidth
                    required
                    error={Boolean(errors.addressLine1)}
                    helperText={errors.addressLine1?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="addressLine2"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Address Line 2" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    required
                    error={Boolean(errors.state)}
                    helperText={errors.state?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="district"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="District"
                    fullWidth
                    required
                    error={Boolean(errors.district)}
                    helperText={errors.district?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    required
                    error={Boolean(errors.city)}
                    helperText={errors.city?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="pincode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Pincode"
                    fullWidth
                    required
                    slotProps={{ htmlInput: { maxLength: 6 } }}
                    error={Boolean(errors.pincode)}
                    helperText={errors.pincode?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="subtitle1"
            sx={{ mb: 1.5, fontWeight: 800 }}
          >
            Location
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="latitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Latitude"
                    fullWidth
                    required
                    slotProps={{ input: { readOnly: true } }}
                    error={Boolean(errors.latitude)}
                    helperText={errors.latitude?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="longitude"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Longitude"
                    fullWidth
                    required
                    slotProps={{ input: { readOnly: true } }}
                    error={Boolean(errors.longitude)}
                    helperText={errors.longitude?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        <LocationPicker
          latitude={latitude || ""}
          longitude={longitude || ""}
          currentAddress={currentAddress || ""}
          lastLocationUpdatedAt={lastLocationUpdatedAt}
          disabled={submitting}
          onChange={handleLocationChange}
        />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            startIcon={
              submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              px: 4,
              py: 1.25,
              fontWeight: 800,
              borderRadius: 2,
              boxShadow: "0 10px 24px rgba(21,101,216,0.28)",
            }}
          >
            {submitting ? "Saving Changes…" : "Save Changes"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
