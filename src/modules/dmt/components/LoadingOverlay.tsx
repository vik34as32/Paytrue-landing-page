"use client";

import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export default function LoadingOverlay({
  open,
  message = "Please wait...",
}: LoadingOverlayProps) {
  return (
    <Backdrop open={open} sx={{ zIndex: (theme) => theme.zIndex.modal + 2, color: "#fff" }}>
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress color="inherit" size={48} />
        <Typography sx={{ mt: 2, fontWeight: 600 }}>{message}</Typography>
      </Box>
    </Backdrop>
  );
}
