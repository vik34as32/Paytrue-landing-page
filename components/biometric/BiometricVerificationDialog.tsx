"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { X } from "lucide-react";
import BankingThemeProvider from "@/components/biometric/BankingThemeProvider";
import FingerprintScanner from "@/components/biometric/FingerprintScanner";
import VerificationSuccess from "@/components/biometric/VerificationSuccess";
import BiometricPendingApproval from "@/components/biometric/BiometricPendingApproval";
import { useBiometricDevice } from "@/src/hooks/useBiometricDevice";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import useScannerConnection from "@/src/hooks/useScannerConnection";
import { clearAllProviderCaches } from "@/src/lib/biometric/BiometricFactory";
import { BIOMETRIC_DEVICE_OPTIONS } from "@/src/types/biometric";
import type { AppDispatch } from "@/src/redux/types";
import {
  clearMerchantError,
  closeBiometricModal,
  resetMerchantVerification,
  selectMerchantError,
  selectMerchantModalOpen,
  selectMerchantPidOptionWadh,
  selectMerchantStatusChecked,
  selectMerchantStatusLoading,
  selectMerchantVerificationPhase,
  setVerificationPhase,
} from "@/src/redux/slices/merchantSlice";
import {
  loadMerchantBiometricStatus,
  submitMerchantBiometricVerification,
} from "@/src/redux/thunks/merchantThunk";
import { fetchProfile } from "@/src/redux/thunks/profileThunk";

interface BiometricVerificationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function BiometricVerificationDialog({
  open,
  onClose,
}: BiometricVerificationDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const phase = useSelector(selectMerchantVerificationPhase);
  const error = useSelector(selectMerchantError);
  const pidOptionWadh = useSelector(selectMerchantPidOptionWadh);
  const statusLoading = useSelector(selectMerchantStatusLoading);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const { selectedDevice, changeDevice } = useBiometricDevice();
  const { capture, refreshRdService } = useFingerprint({ autoRefresh: false });
  const {
    isConnected,
    isConnecting,
    scannerModel,
    message: connectMessage,
    error: connectError,
    connectScanner,
    device,
  } = useScannerConnection(false, { autoRefresh: false });

  const [scannerConnected, setScannerConnected] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const isScanning = phase === "scanning";
  const busy = isScanning || phase === "verifying" || isConnecting;
  const isSuccess = phase === "success";
  const isPendingApproval = phase === "pending_approval";
  const canScan = scannerConnected || isConnected;

  useEffect(() => {
    if (!open) {
      setScannerConnected(false);
      setScanError(null);
      return;
    }
    dispatch(clearMerchantError());
    dispatch(resetMerchantVerification());
    dispatch(loadMerchantBiometricStatus());
    dispatch(fetchProfile());
  }, [dispatch, open]);

  useEffect(() => {
    if (isConnected) setScannerConnected(true);
  }, [isConnected]);

  useEffect(() => {
    if (phase !== "success" && phase !== "pending_approval") return;
    const delay = phase === "pending_approval" ? 5000 : 2000;
    const timer = window.setTimeout(() => {
      dispatch(closeBiometricModal());
      dispatch(resetMerchantVerification());
      onClose();
    }, delay);
    return () => window.clearTimeout(timer);
  }, [dispatch, onClose, phase]);

  const handleConnect = async () => {
    dispatch(clearMerchantError());
    setScanError(null);
    clearAllProviderCaches();
    const result = await connectScanner();
    setScannerConnected(result.state === "connected");
  };

  const handleStartScan = useCallback(async () => {
    dispatch(clearMerchantError());
    setScanError(null);
    dispatch(setVerificationPhase("scanning"));

    try {
      clearAllProviderCaches();
      const rdCheck = await refreshRdService(true);
      if (!rdCheck?.isRunning) {
        throw new Error(
          device === "MORPHO"
            ? "Morpho RD Service not running."
            : "Mantra RD Service not running. Start Mantra L1 AVDM."
        );
      }

      if (!pidOptionWadh?.trim()) {
        throw new Error(
          "Biometric WADH not loaded. Close this dialog, wait a moment, and try again."
        );
      }

      const captureResult = await capture({ wadh: pidOptionWadh.trim() });
      dispatch(setVerificationPhase("verifying"));
      await dispatch(submitMerchantBiometricVerification(captureResult.pidData)).unwrap();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed.";
      setScanError(message);
      dispatch(setVerificationPhase("idle"));
    }
  }, [capture, device, dispatch, pidOptionWadh, refreshRdService]);

  const handleDialogClose = () => {
    if (busy || isScanning) return;
    dispatch(closeBiometricModal());
    dispatch(resetMerchantVerification());
    onClose();
  };

  return (
    <BankingThemeProvider>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #001F5B 0%, #1565d8 100%)",
            color: "#fff",
            pr: 6,
          }}
        >
          Complete Biometric Verification
          {!busy && !isSuccess ? (
            <IconButton
              onClick={handleDialogClose}
              sx={{ position: "absolute", right: 12, top: 12, color: "#fff" }}
              size="small"
            >
              <X size={20} />
            </IconButton>
          ) : null}
          <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,255,255,0.85)" }}>
            Select scanner, connect, and complete one-time merchant KYC
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {isPendingApproval ? (
            <BiometricPendingApproval />
          ) : isSuccess ? (
            <VerificationSuccess />
          ) : (
            <Stack spacing={2.5}>
              <FormControl fullWidth disabled={busy}>
                <InputLabel id="biometric-device-label">Biometric Device</InputLabel>
                <Select
                  labelId="biometric-device-label"
                  label="Biometric Device"
                  value={selectedDevice}
                  onChange={(e) => {
                    changeDevice(e.target.value as "MANTRA" | "MORPHO");
                    setScannerConnected(false);
                    setScanError(null);
                    clearAllProviderCaches();
                  }}
                >
                  {BIOMETRIC_DEVICE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label} — {opt.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: canScan ? "success.light" : "grey.300",
                  bgcolor: canScan ? "rgba(22,163,74,0.06)" : "grey.50",
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Scanner Status
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: canScan ? "success.main" : "text.secondary",
                    }}
                  >
                    {canScan ? "Connected" : "Not Connected"}
                  </Typography>
                </Stack>
                {scannerModel ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {scannerModel}
                  </Typography>
                ) : null}
                {connectMessage && canScan ? (
                  <Typography
                    variant="caption"
                    color="success.main"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {connectMessage}
                  </Typography>
                ) : null}
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 1.5 }}
                  disabled={busy}
                  onClick={handleConnect}
                  startIcon={isConnecting ? <CircularProgress size={16} /> : undefined}
                >
                  {isConnecting ? "Connecting..." : canScan ? "Reconnect Scanner" : "Connect Scanner"}
                </Button>
              </Box>

              {(connectError || scanError || error) && phase !== "verifying" ? (
                <Alert severity="error">
                  {scanError || connectError || error}
                </Alert>
              ) : null}

              {statusChecked && !statusLoading && !pidOptionWadh?.trim() ? (
                <Alert severity="warning">
                  Biometric WADH is not ready yet. Wait a few seconds or close and reopen this
                  dialog after merchant status loads.
                </Alert>
              ) : null}

              <FingerprintScanner
                active={isScanning}
                statusText={
                  canScan
                    ? "Scanner ready. Start scan — device light will glow."
                    : "Select device and click Connect Scanner first."
                }
                scanningText={
                  selectedDevice === "MANTRA"
                    ? "Mantra light ON — finger scanner par rakho."
                    : "Scanning — finger device par rakho."
                }
              />

              {busy ? (
                <Box>
                  <LinearProgress sx={{ mb: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", color: "primary.main", fontWeight: 600 }}
                  >
                    {isScanning
                      ? "Scanning fingerprint..."
                      : isConnecting
                        ? "Connecting scanner..."
                        : "Verifying with InstantPay..."}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ textAlign: "center", display: "block", color: "text.secondary" }}
                  >
                    Please don&apos;t close this window.
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          )}
        </DialogContent>

        {!isSuccess && !isPendingApproval ? (
          <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
            <Button onClick={handleDialogClose} disabled={busy || isScanning}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!canScan || busy || !pidOptionWadh?.trim()}
              onClick={handleStartScan}
              sx={{
                minWidth: 160,
                background: "linear-gradient(135deg, #0A84FF 0%, #1565d8 100%)",
              }}
            >
              {isScanning ? "Scanning..." : "Start Finger Scan"}
            </Button>
          </DialogActions>
        ) : null}
      </Dialog>
    </BankingThemeProvider>
  );
}

/** Controlled by Redux modalOpen OR parent open prop */
export function BiometricVerificationModal() {
  const dispatch = useDispatch<AppDispatch>();
  const open = useSelector(selectMerchantModalOpen);

  return (
    <BiometricVerificationDialog
      open={open}
      onClose={() => dispatch(closeBiometricModal())}
    />
  );
}
