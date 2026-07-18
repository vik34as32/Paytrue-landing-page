"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useRemitterEkycSession } from "@/src/modules/dmt/hooks/useRemitterEkycSession";
import { logRdDebug } from "@/src/lib/biometric/pidOptions";

type DeviceType = "MANTRA" | "MORPHO";

const DEVICES: Array<{ id: DeviceType; name: string; hint: string }> = [
  { id: "MANTRA", name: "Mantra", hint: "MFS100 / L1 AVDM" },
  { id: "MORPHO", name: "Morpho", hint: "MSO 1300 / RD L1" },
];

interface BioAuthDialogProps {
  open: boolean;
  mobile: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    pidData: string;
    latitude: string;
    longitude: string;
    captureType: "FINGER" | "FACE";
    consentTaken: "Y" | "N";
    /** Same referenceKey from the single pid-options fetch */
    referenceKey: string;
  }) => void;
}

/**
 * InstantPay DMT eKYC biometric dialog.
 *
 * - GET pid-options once per eKYC session
 * - Reuse referenceKey + pidOptions on capture retry
 * - Clear session only on cancel / parent success clear
 * - Never calls pid-options again after RD capture
 */
export default function BioAuthDialog({
  open,
  mobile,
  loading = false,
  onClose,
  onSubmit,
}: BioAuthDialogProps) {
  const dispatch = useDispatch();
  const selectedDevice =
    (useSelector(selectAepsSelectedDevice) as DeviceType) || "MANTRA";
  const { session, ensureSession, clearSession } = useRemitterEkycSession();

  const [consent, setConsent] = useState(true);
  const [mode] = useState<"FINGER" | "FACE">("FINGER");
  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingPidOptions, setLoadingPidOptions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const sessionBootstrappedRef = useRef(false);

  const {
    isCapturing,
    isFetchingLocation,
    captureWithLocation,
    refreshRdService,
    rdStatus,
  } = useFingerprint({ autoRefresh: false });

  const connected = Boolean(rdStatus?.isRunning || rdStatus?.deviceConnected);
  const busy =
    loading || isCapturing || isFetchingLocation || loadingPidOptions;

  const statusLabel = useMemo(() => {
    if (loadingPidOptions) return "Loading PID options...";
    if (refreshing) return "Checking...";
    if (isCapturing) return "Scanning...";
    if (isFetchingLocation) return "Getting location...";
    return connected ? "Connected" : "Not connected";
  }, [
    connected,
    isCapturing,
    isFetchingLocation,
    loadingPidOptions,
    refreshing,
  ]);

  /** Bootstrap pid-options once when dialog opens (skip if session already active) */
  useEffect(() => {
    if (!open || !mobile.trim()) {
      sessionBootstrappedRef.current = false;
      return;
    }

    if (
      session.isActive &&
      session.mobile === mobile.trim() &&
      session.referenceKey &&
      session.pidOptions
    ) {
      sessionBootstrappedRef.current = true;
      setLoadingPidOptions(false);
      return;
    }

    if (sessionBootstrappedRef.current) return;

    let cancelled = false;
    sessionBootstrappedRef.current = true;

    (async () => {
      setLoadingPidOptions(true);
      setLocalError(null);
      try {
        await ensureSession(mobile.trim());
      } catch (error) {
        sessionBootstrappedRef.current = false;
        if (!cancelled) {
          setLocalError(
            error instanceof Error
              ? error.message
              : "Failed to load remitter pid-options."
          );
        }
      } finally {
        if (!cancelled) setLoadingPidOptions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally depend on primitives — avoid re-fetch loops from object identity
  }, [
    ensureSession,
    mobile,
    open,
    session.isActive,
    session.mobile,
    session.pidOptions,
    session.referenceKey,
  ]);

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

  const handleClose = () => {
    if (busy) return;
    // Cancel → clear eKYC session
    clearSession();
    sessionBootstrappedRef.current = false;
    onClose();
  };

  const handleCapture = async () => {
    if (!consent) return;
    setLocalError(null);

    try {
      // Reuse existing session — do NOT call pid-options again on retry
      const active =
        session.isActive &&
        session.mobile === mobile.trim() &&
        session.referenceKey &&
        session.pidOptions
          ? {
              referenceKey: session.referenceKey,
              pidOptions: session.pidOptions,
              pidOptionWadh: session.pidOptionWadh,
            }
          : await ensureSession(mobile.trim());

      if (!active.referenceKey || !active.pidOptions) {
        throw new Error(
          "Missing referenceKey or pidOptions. Open eKYC again to load pid-options."
        );
      }

      logRdDebug({
        referenceKey: active.referenceKey,
        pidOptionWadh: active.pidOptionWadh || null,
        generatedXml: active.pidOptions,
      });

      // eslint-disable-next-line no-console -- InstantPay eKYC referenceKey debug
      console.log("==================================");
      // eslint-disable-next-line no-console
      console.log("Before RD Capture:");
      // eslint-disable-next-line no-console
      console.log("");
      // eslint-disable-next-line no-console
      console.log("ReferenceKey:", active.referenceKey);
      // eslint-disable-next-line no-console
      console.log("Source:", session.referenceKeySource || "unknown");
      // eslint-disable-next-line no-console
      console.log("==================================");

      // Pass saved pidOptions XML directly to RD Service
      const capture = await captureWithLocation({
        pidOptionsXml: active.pidOptions,
        wadh: active.pidOptionWadh || undefined,
      });

      // Do NOT fetch profile / pid-options after capture
      onSubmit({
        pidData: capture.pidData,
        latitude: capture.latitude,
        longitude: capture.longitude,
        captureType: mode,
        consentTaken: "Y",
        referenceKey: active.referenceKey,
      });
    } catch (error) {
      // Capture failure → keep session for retry (requirement #9)
      setLocalError(
        error instanceof Error ? error.message : "Fingerprint capture failed."
      );
    }
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : handleClose} fullWidth maxWidth="sm">
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
            pid-options once → RD capture → eKYC
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={busy} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
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

        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
          Step 3 · Capture
        </Typography>

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
            {loadingPidOptions
              ? "Loading InstantPay pid-options (once)..."
              : isCapturing
                ? "Place finger on the scanner..."
                : isFetchingLocation
                  ? "Fetching location..."
                  : session.isActive
                    ? "Tap to capture (session ready — retry reuses same key)"
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
        <Button onClick={handleClose} disabled={busy} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCapture}
          disabled={busy || !consent || !mobile.trim()}
          startIcon={
            busy ? <CircularProgress size={16} color="inherit" /> : <FingerprintIcon />
          }
        >
          Capture Fingerprint
        </Button>
      </DialogActions>
    </Dialog>
  );
}
