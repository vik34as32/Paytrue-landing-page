"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import FaceIcon from "@mui/icons-material/Face";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import UsbIcon from "@mui/icons-material/Usb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/Error";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import {
  selectAepsSelectedDevice,
  setSelectedDevice,
} from "@/src/redux/slices/aepsSlice";

type DeviceType = "MANTRA" | "MORPHO";

const DEVICES: Array<{ id: DeviceType; name: string; hint: string }> = [
  { id: "MANTRA", name: "Mantra", hint: "MFS100 / L1 AVDM" },
  { id: "MORPHO", name: "Morpho", hint: "MSO 1300 / RD L1" },
];

interface BioAuthDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    pidData: string;
    latitude: string;
    longitude: string;
    captureType: "FINGER" | "FACE";
    consentTaken: "Y" | "N";
  }) => void;
}

export default function BioAuthDialog({
  open,
  loading = false,
  onClose,
  onSubmit,
}: BioAuthDialogProps) {
  const dispatch = useDispatch();
  const selectedDevice = (useSelector(selectAepsSelectedDevice) as DeviceType) || "MANTRA";

  const [consent, setConsent] = useState(true);
  const [mode, setMode] = useState<"FINGER" | "FACE">("FINGER");
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    isCapturing,
    isFetchingLocation,
    captureWithLocation,
    refreshRdService,
    rdStatus,
  } = useFingerprint();

  const [refreshing, setRefreshing] = useState(false);
  const connected = Boolean(rdStatus?.isRunning || rdStatus?.deviceConnected);
  const busy = loading || isCapturing || isFetchingLocation;

  const statusLabel = useMemo(() => {
    if (refreshing) return "Checking...";
    if (isCapturing) return "Scanning...";
    if (isFetchingLocation) return "Getting location...";
    return connected ? "Connected" : "Not connected";
  }, [connected, isCapturing, isFetchingLocation, refreshing]);

  const handleSelectDevice = (device: DeviceType) => {
    if (device === selectedDevice || busy) return;
    setLocalError(null);
    dispatch(setSelectedDevice(device));
  };

  const handleConnect = async () => {
    setLocalError(null);
    setRefreshing(true);
    try {
      await refreshRdService(true);
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Unable to reach RD service."
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleCapture = async () => {
    if (!consent) return;
    setLocalError(null);
    try {
      const capture = await captureWithLocation();
      onSubmit({
        pidData: capture.pidData,
        latitude: capture.latitude,
        longitude: capture.longitude,
        captureType: mode,
        consentTaken: "Y",
      });
    } catch (error) {
      setLocalError(
        error instanceof Error ? error.message : "Fingerprint capture failed."
      );
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FingerprintIcon />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            Biometric Authentication
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Select scanner, connect and capture fingerprint
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={busy} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Step 1: Device selection */}
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Step 1 · Select Device
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1, mb: 2.5 }}>
          {DEVICES.map((device) => {
            const active = selectedDevice === device.id;
            return (
              <Box
                key={device.id}
                role="button"
                onClick={() => handleSelectDevice(device.id)}
                sx={{
                  cursor: busy ? "not-allowed" : "pointer",
                  border: "2px solid",
                  borderColor: active ? "primary.main" : "divider",
                  bgcolor: active ? "primary.main" : "transparent",
                  color: active ? "#fff" : "text.primary",
                  borderRadius: 2,
                  p: 1.75,
                  transition: "all 0.15s ease",
                  opacity: busy && !active ? 0.6 : 1,
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <UsbIcon fontSize="small" />
                  <Typography sx={{ fontWeight: 700 }}>{device.name}</Typography>
                  {active ? <CheckCircleIcon fontSize="small" sx={{ ml: "auto" }} /> : null}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: active ? "rgba(255,255,255,0.85)" : "text.secondary" }}
                >
                  {device.hint}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Step 2: Connection status */}
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Step 2 · Scanner Status
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mt: 1,
            mb: 2.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <Chip
            icon={connected ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
            label={statusLabel}
            color={connected ? "success" : "default"}
            variant={connected ? "filled" : "outlined"}
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            {connected
              ? `${selectedDevice} RD service ready.`
              : `Start ${selectedDevice} RD service, then connect.`}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleConnect}
            disabled={busy || refreshing}
            startIcon={
              refreshing ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />
            }
          >
            {connected ? "Refresh" : "Connect"}
          </Button>
        </Box>

        {/* Step 3: Capture */}
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Step 3 · Capture
        </Typography>

        {/* <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 2 }}>
          <Button
            fullWidth
            variant={mode === "FINGER" ? "contained" : "outlined"}
            startIcon={<FingerprintIcon />}
            onClick={() => setMode("FINGER")}
            disabled={busy}
          >
            Fingerprint
          </Button>
        </Box> */}

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 1 }}>
          <Box
            role="button"
            onClick={!busy && consent ? handleCapture : undefined}
            sx={{
              width: 108,
              height: 108,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: busy || !consent ? "not-allowed" : "pointer",
              color: "#fff",
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: (theme) => `0 8px 24px ${theme.palette.primary.main}55`,
              opacity: !consent ? 0.5 : 1,
              transition: "transform 0.15s ease",
              "&:hover": { transform: busy || !consent ? "none" : "scale(1.04)" },
              "@keyframes bioPulse": {
                "0%": { boxShadow: "0 0 0 0 rgba(25,118,210,0.5)" },
                "70%": { boxShadow: "0 0 0 18px rgba(25,118,210,0)" },
                "100%": { boxShadow: "0 0 0 0 rgba(25,118,210,0)" },
              },
              animation: isCapturing ? "bioPulse 1.3s infinite" : "none",
            }}
          >
            {busy ? (
              <CircularProgress size={40} color="inherit" />
            ) : mode === "FACE" ? (
              <FaceIcon sx={{ fontSize: 54 }} />
            ) : (
              <FingerprintIcon sx={{ fontSize: 60 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {isCapturing
              ? "Place finger on the scanner..."
              : isFetchingLocation
                ? "Fetching location..."
                : "Tap to capture"}
          </Typography>
        </Box>

        {localError ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            {localError}
          </Alert>
        ) : null}

        <Divider sx={{ my: 1.5 }} />
        <FormControlLabel
          control={
            <Checkbox
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
          }
          label={
            <Typography variant="body2">
              I have taken customer consent for biometric authentication.
            </Typography>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCapture}
          disabled={busy || !consent}
          startIcon={
            busy ? <CircularProgress size={16} color="inherit" /> : <FingerprintIcon />
          }
        >
          {mode === "FACE" ? "Start Face Auth" : "Capture Fingerprint"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
