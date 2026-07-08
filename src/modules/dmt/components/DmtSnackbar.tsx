"use client";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useAppDispatch, useAppSelector } from "@/src/redux/types";
import { hideSnackbar } from "../redux/workflowSlice";

export default function DmtSnackbar() {
  const dispatch = useAppDispatch();
  const snackbar = useAppSelector((state) => state.dmtWorkflow.snackbar);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={5000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
}
