"use client";

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PrintIcon from "@mui/icons-material/Print";
import type { DmtTransaction } from "../types";
import { formatCurrency } from "@/lib/utils";

interface TransactionReceiptProps {
  transaction: DmtTransaction | null;
  failed?: boolean;
  onDone: () => void;
  onRetry?: () => void;
}

export default function TransactionReceipt({
  transaction,
  failed = false,
  onDone,
  onRetry,
}: TransactionReceiptProps) {
  const status = (transaction?.status || (failed ? "failed" : "success")).toLowerCase();
  const isFailed = failed || status === "failed";

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", maxWidth: 560, mx: "auto" }}>
      <CardContent sx={{ p: 4, textAlign: "center" }}>
        {isFailed ? (
          <ErrorIcon color="error" sx={{ fontSize: 64 }} />
        ) : (
          <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
        )}
        <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
          {isFailed ? "Transaction Failed" : "Transaction Successful"}
        </Typography>
        <Typography variant="h4" color="primary" sx={{ mt: 1, fontWeight: 800 }}>
          {formatCurrency(transaction?.amount ?? 0)}
        </Typography>
        <Chip
          label={status.toUpperCase()}
          color={isFailed ? "error" : "success"}
          size="small"
          sx={{ mt: 1 }}
        />

        <Divider sx={{ my: 2.5 }} />

        <Box sx={{ textAlign: "left", display: "grid", gap: 1.25 }}>
          <Row label="Beneficiary" value={transaction?.beneficiaryName || "-"} />
          <Row label="UTR" value={transaction?.utr || "-"} />
          <Row label="Reference ID" value={transaction?.referenceNumber || transaction?.reference || "-"} />
          <Row label="Status" value={status} />
          {isFailed ? <Row label="Reason" value={transaction?.reason || transaction?.message || "-"} /> : null}
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 3, flexWrap: "wrap" }}>
          {!isFailed ? (
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Receipt
            </Button>
          ) : null}
          {isFailed && onRetry ? (
            <Button variant="outlined" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
          <Button variant="contained" onClick={onDone}>
            Done
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: "right", wordBreak: "break-all" }}>
        {value}
      </Typography>
    </Box>
  );
}
