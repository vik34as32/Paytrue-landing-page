"use client";

import { useEffect } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Cable, RefreshCw, Zap } from "lucide-react";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import useScannerConnection from "@/src/hooks/useScannerConnection";

interface MantraScannerPanelProps {
  disabled?: boolean;
  onConnectionChange?: (connected: boolean) => void;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: ok ? "success.main" : "error.main",
        boxShadow: ok ? "0 0 8px rgba(22,163,74,0.6)" : "none",
      }}
    />
  );
}

export default function MantraScannerPanel({
  disabled = false,
  onConnectionChange,
}: MantraScannerPanelProps) {
  const {
    device,
    rdStatus,
    isConnected,
    isConnecting,
    scannerModel,
    scannerSerial,
    message,
    error,
    connectScanner,
  } = useScannerConnection(true);

  const handleConnect = async () => {
    const result = await connectScanner();
    onConnectionChange?.(result.state === "connected");
  };

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  return (
    <Box sx={{ mb: 3 }}>
      <DeviceSelector disabled={disabled || isConnecting} />

      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: isConnected ? "success.light" : "divider",
          bgcolor: isConnected ? "success.50" : "grey.50",
        }}
      >
        <Stack
          direction="row"
          sx={{ mb: 1.5, alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Scanner Connection
          </Typography>
          <Chip
            size="small"
            icon={<StatusDot ok={isConnected} />}
            label={
              isConnecting
                ? "Connecting..."
                : isConnected
                  ? "Connected"
                  : "Not Connected"
            }
            color={isConnected ? "success" : isConnecting ? "warning" : "default"}
            variant={isConnected ? "filled" : "outlined"}
          />
        </Stack>

        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            RD Service:{" "}
            <strong style={{ color: rdStatus.isRunning ? "#16a34a" : "#dc2626" }}>
              {rdStatus.isRunning ? "Running" : "Not Running"}
            </strong>
          </Typography>
          {scannerModel ? (
            <Typography variant="body2" color="text.secondary">
              Model: <strong>{scannerModel}</strong>
              {scannerSerial ? ` · S/N ${scannerSerial}` : null}
            </Typography>
          ) : null}
          {rdStatus.baseUrl ? (
            <Typography variant="caption" color="text.disabled" sx={{ fontFamily: "monospace" }}>
              {rdStatus.baseUrl}
            </Typography>
          ) : null}
        </Stack>

        {device === "MANTRA" ? (
          <Alert severity="info" icon={<Zap size={18} />} sx={{ mb: 2, py: 0.5 }}>
            Mantra USB connect karo → Mantra L1 AVDM start karo →{" "}
            <strong>Connect Scanner</strong> dabao → phir{" "}
            <strong>Start Finger Scan</strong> par light jalegi.
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {message && isConnected ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        ) : null}

        <Button
          fullWidth
          variant={isConnected ? "outlined" : "contained"}
          disabled={disabled || isConnecting}
          onClick={handleConnect}
          startIcon={
            isConnecting ? (
              <CircularProgress size={18} color="inherit" />
            ) : isConnected ? (
              <RefreshCw size={18} />
            ) : (
              <Cable size={18} />
            )
          }
          sx={{ mb: 0 }}
        >
          {isConnecting
            ? "Connecting to scanner..."
            : isConnected
              ? "Refresh Connection"
              : "Connect Scanner"}
        </Button>
      </Box>
    </Box>
  );
}
