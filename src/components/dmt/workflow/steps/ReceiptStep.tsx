"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import { useTransferStatus } from "@/src/hooks/useDmt";
import { formatCurrency } from "@/lib/utils";
import { useDmtWorkflow, STEP } from "../DmtWorkflowContext";
import type { DmtTransactionStatus } from "@/src/types/dmt";

const STATUS_META: Record<
  DmtTransactionStatus,
  { color: "success" | "error" | "warning" | "info"; label: string }
> = {
  success: { color: "success", label: "Transfer Successful" },
  failed: { color: "error", label: "Transfer Failed" },
  pending: { color: "warning", label: "Transfer Pending" },
  processing: { color: "info", label: "Processing Transfer" },
};

export default function ReceiptStep() {
  const { transferReference, selectedBeneficiary, reset, goToStep } = useDmtWorkflow();
  const { data, isLoading, isError, error, refetch, isFetching } = useTransferStatus(
    transferReference,
    Boolean(transferReference)
  );

  if (!transferReference) {
    return (
      <Alert
        severity="warning"
        action={
          <Button color="inherit" size="small" onClick={() => goToStep(STEP.BENEFICIARIES)}>
            Go Back
          </Button>
        }
      >
        No transfer reference found.
      </Alert>
    );
  }

  if (isLoading) {
    return <Skeleton variant="rounded" height={340} />;
  }

  if (isError) {
    return (
      <Alert
        severity="error"
        action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}
      >
        {(error as Error)?.message || "Unable to load transfer status"}
      </Alert>
    );
  }

  const status = (data?.status ?? "pending") as DmtTransactionStatus;
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const isPending = status === "pending" || status === "processing";

  const StatusIcon =
    status === "success" ? CheckCircleIcon : status === "failed" ? ErrorIcon : HourglassBottomIcon;

  return (
    <Box>
      <Card
        elevation={0}
        id="dmt-receipt"
        sx={{ border: "1px solid", borderColor: "divider", maxWidth: 560, mx: "auto" }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <StatusIcon color={meta.color} sx={{ fontSize: 64 }} />
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 800 }}>
            {meta.label}
          </Typography>
          <Typography variant="h4" color="primary" sx={{ mt: 1, fontWeight: 800 }}>
            {formatCurrency(data?.amount ?? 0)}
          </Typography>
          <Chip
            label={status.toUpperCase()}
            color={meta.color}
            size="small"
            sx={{ mt: 1, fontWeight: 700 }}
          />
          {isPending ? (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 1 }}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">
                Live status updating…
              </Typography>
            </Box>
          ) : null}

          <Divider sx={{ my: 2.5 }} />

          <Box sx={{ textAlign: "left", display: "grid", gap: 1.25 }}>
            <Row label="Reference No" value={data?.referenceNumber || transferReference} />
            {data?.transactionId ? <Row label="Transaction ID" value={data.transactionId} /> : null}
            {data?.utr ? <Row label="UTR" value={data.utr} /> : null}
            {data?.rrn ? <Row label="RRN" value={data.rrn} /> : null}
            <Row
              label="Beneficiary"
              value={data?.beneficiaryName || selectedBeneficiary?.name || "-"}
            />
            <Row label="Bank" value={data?.bankName || selectedBeneficiary?.bankName || "-"} />
            <Row label="Mode" value={data?.transferMode || "-"} />
            {data?.charges != null ? <Row label="Charges" value={formatCurrency(data.charges)} /> : null}
            {data?.gst != null ? <Row label="GST" value={formatCurrency(data.gst)} /> : null}
            {data?.createdAt ? (
              <Row label="Date" value={new Date(data.createdAt).toLocaleString("en-IN")} />
            ) : null}
          </Box>
        </CardContent>
      </Card>

      <Box
        sx={{ display: "flex", gap: 1.5, justifyContent: "center", mt: 3, flexWrap: "wrap" }}
        className="no-print"
      >
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh Status
        </Button>
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print Receipt
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={reset}>
          New Transfer
        </Button>
      </Box>
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ textAlign: "right", wordBreak: "break-all", fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
