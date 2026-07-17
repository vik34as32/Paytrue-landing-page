"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { reverseGeocodeAddress } from "@/src/services/profileApi";

const LocationMap = dynamic(() => import("./LocationMap"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 320,
        borderRadius: 2,
        bgcolor: "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={28} />
    </Box>
  ),
});

export interface LocationCoords {
  latitude: string;
  longitude: string;
  currentAddress: string;
  lastLocationUpdatedAt?: string;
}

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  currentAddress: string;
  lastLocationUpdatedAt?: string;
  disabled?: boolean;
  onChange: (coords: LocationCoords) => void;
}

function formatUpdatedAt(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LocationPicker({
  latitude,
  longitude,
  currentAddress,
  lastLocationUpdatedAt,
  disabled = false,
  onChange,
}: LocationPickerProps) {
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  const latNum = useMemo(() => {
    const n = Number(latitude);
    return Number.isFinite(n) ? n : null;
  }, [latitude]);

  const lngNum = useMemo(() => {
    const n = Number(longitude);
    return Number.isFinite(n) ? n : null;
  }, [longitude]);

  const hasValidCoords = latNum != null && lngNum != null;

  const applyCoords = useCallback(
    async (lat: number, lng: number, resolveAddress = true) => {
      setGeoError(null);
      const next: LocationCoords = {
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        currentAddress: currentAddress || "",
        lastLocationUpdatedAt: new Date().toISOString(),
      };

      if (resolveAddress) {
        setAddressLoading(true);
        try {
          next.currentAddress = await reverseGeocodeAddress(lat, lng);
        } catch {
          next.currentAddress =
            currentAddress ||
            `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;
        } finally {
          setAddressLoading(false);
        }
      }

      onChange(next);
    },
    [currentAddress, onChange]
  );

  const getCurrentPosition = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await applyCoords(
            position.coords.latitude,
            position.coords.longitude,
            true
          );
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        const messages: Record<number, string> = {
          1: "Location permission denied. Please allow location access.",
          2: "Unable to determine your location. Try again.",
          3: "Location request timed out. Try again.",
        };
        setGeoError(messages[error.code] || "Failed to get current location.");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [applyCoords]);

  const handleMarkerDrag = useCallback(
    (lat: number, lng: number) => {
      void applyCoords(lat, lng, true);
    },
    [applyCoords]
  );

  useEffect(() => {
    if (!hasValidCoords || currentAddress) return;
    void applyCoords(latNum!, lngNum!, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidCoords]);

  const updatedLabel = formatUpdatedAt(lastLocationUpdatedAt);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, rgba(21,101,216,0.04) 0%, #fff 48%)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <PlaceIcon color="primary" />
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#0b1f3a" }}
              >
                Retailer Live Location
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Capture GPS coordinates and pin your shop on the map
            </Typography>
          </Box>

          {updatedLabel ? (
            <Chip
              icon={<AccessTimeIcon />}
              label={`Last Location Updated · ${updatedLabel}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, maxWidth: "100%" }}
            />
          ) : (
            <Chip
              label="Location not updated yet"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            label="Latitude"
            value={latitude || ""}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            helperText="Updated via GPS or map marker"
          />
          <TextField
            label="Longitude"
            value={longitude || ""}
            fullWidth
            slotProps={{ input: { readOnly: true } }}
            helperText={
              hasValidCoords
                ? `Current: ${latNum?.toFixed(4)}, ${lngNum?.toFixed(4)}`
                : "No coordinates yet"
            }
          />
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant="contained"
            startIcon={
              geoLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MyLocationIcon />
              )
            }
            onClick={getCurrentPosition}
            disabled={disabled || geoLoading}
            sx={{ fontWeight: 700, px: 2.5 }}
          >
            {geoLoading ? "Detecting…" : "📍 Get Current Location"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={getCurrentPosition}
            disabled={disabled || geoLoading}
            sx={{ fontWeight: 700 }}
          >
            Refresh Location
          </Button>
        </Stack>

        {geoError ? <Alert severity="error">{geoError}</Alert> : null}

        <Box
          sx={{
            height: { xs: 280, md: 360 },
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {hasValidCoords ? (
            <LocationMap
              latitude={latNum!}
              longitude={lngNum!}
              draggable={!disabled}
              onDragEnd={handleMarkerDrag}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.50",
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                Use Get Current Location or wait for saved coordinates to show
                the map.
              </Typography>
            </Box>
          )}
        </Box>

        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Current Address
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 0.75, fontWeight: 600, color: "#0b1f3a" }}
          >
            {addressLoading
              ? "Resolving address…"
              : currentAddress?.trim() || "—"}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}
