"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import PeopleIcon from "@mui/icons-material/People";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useRemitterByMobile } from "@/src/hooks/useDmt";
import { formatCurrency } from "@/lib/utils";
import { useDmtWorkflow, STEP } from "../DmtWorkflowContext";

export default function SenderDetailsStep() {
  const { mobile, sender, setSender, goToStep } = useDmtWorkflow();
  const { data, isLoading, isError, error, refetch, isFetching } = useRemitterByMobile(
    mobile,
    Boolean(mobile)
  );

  useEffect(() => {
    if (data) setSender(data);
  }, [data, setSender]);

  const profile = data ?? sender;

  if (!mobile) {
    return <Alert severity="warning">No sender selected. Go back and search a sender.</Alert>;
  }

  if (isLoading && !profile) {
    return <Skeleton variant="rounded" height={260} />;
  }

  if (isError && !profile) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        {(error as Error)?.message || "Unable to load sender profile"}
      </Alert>
    );
  }

  const dailyRemaining = Math.max(0, (profile?.dailyLimit ?? 0) - (profile?.dailyUsed ?? 0));
  const monthlyRemaining = Math.max(0, (profile?.monthlyLimit ?? 0) - (profile?.monthlyUsed ?? 0));

  return (
    <Box>
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {profile?.name || "Sender"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.mobile || mobile}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                label={(profile?.verificationStatus ?? "pending").toUpperCase()}
                color={profile?.isVerified ? "success" : "warning"}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            }}
          >
            <Info label="Beneficiaries" value={String(profile?.beneficiaryCount ?? 0)} />
            <Info label="Daily Limit" value={formatCurrency(profile?.dailyLimit ?? 0)} />
            <Info label="Daily Remaining" value={formatCurrency(dailyRemaining)} />
            <Info label="Monthly Limit" value={formatCurrency(profile?.monthlyLimit ?? 0)} />
            <Info label="Monthly Remaining" value={formatCurrency(monthlyRemaining)} />
            <Info label="KYC Status" value={profile?.verificationStatus ?? "pending"} />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PeopleIcon />}
          onClick={() => goToStep(STEP.BENEFICIARIES)}
        >
          Manage Beneficiaries
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<SendIcon />}
          onClick={() => goToStep(STEP.BENEFICIARIES)}
        >
          Transfer Money
        </Button>
      </Box>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, textTransform: "capitalize", fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
  );
}
