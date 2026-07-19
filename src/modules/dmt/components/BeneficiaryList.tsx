"use client";

import { useMemo, useState, type ReactNode } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EastIcon from "@mui/icons-material/East";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import { toast } from "sonner";
import { BankLogo } from "@/components/retailer/BankLogo";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import { validateBankVerifyInputs } from "@/src/lib/dmtBankVerify";
import { verifyBankAccount } from "@/src/services/dmtService";
import type { VerifyBankAccountResponse } from "@/src/types/dmt";
import type { DmtBeneficiary } from "../types";

interface BeneficiaryListProps {
  beneficiaries: DmtBeneficiary[];
  loading?: boolean;
  error?: string | null;
  actionError?: string | null;
  showHeader?: boolean;
  onAdd: () => void;
  onVerify: (beneficiary: DmtBeneficiary) => void;
  onTransfer: (beneficiary: DmtBeneficiary) => void;
  onDelete: (beneficiary: DmtBeneficiary) => void;
}

function ActionIcon({
  title,
  onClick,
  disabled,
  loading,
  color = "default",
  highlight = false,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  color?: "default" | "primary" | "error" | "success";
  /** Draws retailer attention — filled primary + soft pulse */
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title} arrow>
      <span>
        <IconButton
          size="small"
          color={color}
          onClick={onClick}
          disabled={disabled || loading}
          aria-label={title}
          sx={{
            width: highlight ? 36 : 32,
            height: highlight ? 36 : 32,
            border: "1px solid",
            borderColor: highlight
              ? "primary.main"
              : color === "error"
                ? "rgba(211,47,47,0.35)"
                : color === "primary" || color === "success"
                  ? "rgba(21,101,216,0.35)"
                  : "#e2e8f0",
            borderRadius: highlight ? "50%" : 1,
            bgcolor: highlight
              ? "primary.main"
              : color === "primary"
                ? "rgba(21,101,216,0.08)"
                : "#fff",
            color: highlight ? "#fff" : undefined,
            boxShadow: highlight
              ? "0 0 0 0 rgba(21, 101, 216, 0.55)"
              : "none",
            animation: highlight
              ? "dmtVerifyPulse 1.6s ease-out infinite"
              : "none",
            "@keyframes dmtVerifyPulse": {
              "0%": {
                boxShadow: "0 0 0 0 rgba(21, 101, 216, 0.55)",
              },
              "70%": {
                boxShadow: "0 0 0 10px rgba(21, 101, 216, 0)",
              },
              "100%": {
                boxShadow: "0 0 0 0 rgba(21, 101, 216, 0)",
              },
            },
            "&:hover": highlight
              ? {
                  bgcolor: "primary.dark",
                  color: "#fff",
                }
              : undefined,
          }}
        >
          {loading ? <CircularProgress size={14} color="inherit" /> : children}
        </IconButton>
      </span>
    </Tooltip>
  );
}

export default function BeneficiaryList({
  beneficiaries,
  loading = false,
  error,
  actionError,
  showHeader = true,
  onAdd,
  onVerify,
  onTransfer,
  onDelete,
}: BeneficiaryListProps) {
  const [bankVerifyId, setBankVerifyId] = useState<string | null>(null);
  const [bankResult, setBankResult] = useState<{
    beneficiary: DmtBeneficiary;
    result: VerifyBankAccountResponse;
  } | null>(null);

  const bankVerifying = Boolean(bankVerifyId);

  const handleBankVerification = async (beneficiary: DmtBeneficiary) => {
    const validationError = validateBankVerifyInputs({
      accountNumber: beneficiary.accountNumber || "",
      ifscCode: beneficiary.ifscCode || "",
    });
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setBankVerifyId(beneficiary.id);
    try {
      // Same API as Add Beneficiary bank-verify field: POST /dmt/bank-account/verify
      const result = await verifyBankAccount({
        accountNumber: beneficiary.accountNumber,
        ifscCode: beneficiary.ifscCode,
        name: beneficiary.name,
        pennyDrop: "YES",
      });

      if (!result.verified) {
        toast.error(result.status || "Bank account verification failed");
        return;
      }

      setBankResult({ beneficiary, result });
      const payeeName = result.payee?.name?.trim();
      const match =
        result.payee?.nameMatchPercent != null
          ? ` (${result.payee.nameMatchPercent}% name match)`
          : "";
      toast.success(
        payeeName
          ? `Bank verified: ${payeeName}${match}`
          : "Bank account verified successfully"
      );
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message || "Bank verification failed."
      );
    } finally {
      setBankVerifyId(null);
    }
  };

  const columns = useMemo<TableColumn<DmtBeneficiary>[]>(
    () => [
      {
        id: "name",
        name: "Beneficiary",
        selector: (row) => row.name,
        sortable: true,
        grow: 1,
        minWidth: "180px",
        cell: (row) => (
          <div className="flex min-w-0 max-w-[220px] items-center gap-2 py-1">
            <BankLogo
              bank={{
                name: row.bankName,
                ifscPrefix: row.ifscCode?.slice(0, 4) || "",
              }}
              size={28}
            />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-[#0b1f3a]">
                {row.name || "—"}
              </div>
              <div className="truncate text-[11px] text-slate-500">
                {row.bankName || "—"}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "account",
        name: "Account",
        selector: (row) => row.accountNumber,
        sortable: true,
        grow: 0,
        minWidth: "140px",
        cell: (row) => (
          <span className="font-mono text-[12px] font-semibold tracking-wide text-[#0b1f3a]">
            {row.accountNumber || "—"}
          </span>
        ),
      },
      {
        id: "ifsc",
        name: "IFSC",
        selector: (row) => row.ifscCode,
        sortable: true,
        grow: 0,
        minWidth: "118px",
        cell: (row) => (
          <span className="font-mono text-[12px] text-slate-600">
            {row.ifscCode || "—"}
          </span>
        ),
      },
      {
        id: "mobile",
        name: "Mobile",
        selector: (row) => row.mobile || "",
        sortable: true,
        grow: 0,
        minWidth: "110px",
        cell: (row) => (
          <span className="tabular-nums text-[13px] text-slate-700">
            {row.mobile || "—"}
          </span>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => (row.isVerified ? "verified" : "unverified"),
        sortable: true,
        grow: 0,
        minWidth: "168px",
        width: "168px",
        cell: (row) =>
          row.isVerified ? (
            <Chip
              label="Verified"
              size="small"
              icon={
                <CheckCircleIcon
                  sx={{ fontSize: "15px !important", color: "#fff !important" }}
                />
              }
              sx={{
                fontWeight: 800,
                fontSize: 11,
                height: 28,
                bgcolor: "#16a34a",
                color: "#fff",
                border: "1px solid #15803d",
                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.28)",
                cursor: "default",
                pointerEvents: "none",
                "& .MuiChip-label": {
                  px: 0.75,
                  whiteSpace: "nowrap",
                },
                "& .MuiChip-icon": { ml: 0.75 },
              }}
            />
          ) : (
            <Tooltip title="Tap to verify this beneficiary" arrow>
              <Chip
                label="Unverified"
                color="warning"
                size="small"
                onClick={() => onVerify(row)}
                onDelete={() => onVerify(row)}
                deleteIcon={
                  <EastIcon
                    sx={{
                      fontSize: "15px !important",
                      color: "#fff !important",
                    }}
                  />
                }
                icon={
                  <CheckCircleIcon
                    sx={{ fontSize: "15px !important", color: "#fff !important" }}
                  />
                }
                sx={{
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 11,
                  height: 28,
                  bgcolor: "#f59e0b",
                  color: "#fff",
                  border: "1px solid #d97706",
                  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.35)",
                  "& .MuiChip-label": {
                    px: 0.75,
                    whiteSpace: "nowrap",
                  },
                  "& .MuiChip-icon": { ml: 0.75 },
                  "&:hover": {
                    bgcolor: "#d97706",
                  },
                }}
              />
            </Tooltip>
          ),
      },
      {
        id: "actions",
        name: "Actions",
        grow: 0,
        width: "160px",
        right: true,
        ignoreRowClick: true,
        button: true,
        cell: (row) => {
          const verifyingThis = bankVerifying && bankVerifyId === row.id;

          return (
            <div className="flex flex-nowrap items-center justify-end gap-1">
              {row.isVerified ? (
                <>
                  <ActionIcon
                    title="Bank Verification"
                    onClick={() => void handleBankVerification(row)}
                    disabled={bankVerifying}
                    loading={verifyingThis}
                  >
                    <AccountBalanceIcon sx={{ fontSize: 16 }} />
                  </ActionIcon>
                  <ActionIcon
                    title="Transfer"
                    color="primary"
                    onClick={() => onTransfer(row)}
                  >
                    <SendIcon sx={{ fontSize: 16 }} />
                  </ActionIcon>
                  <ActionIcon
                    title="Delete"
                    color="error"
                    onClick={() => onDelete(row)}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </ActionIcon>
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.5,
                      mr: 0.25,
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        display: { xs: "none", md: "inline" },
                        fontSize: 10,
                        fontWeight: 800,
                        color: "primary.main",
                        letterSpacing: 0.2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Verify
                    </Typography>
                    <EastIcon
                      sx={{
                        display: { xs: "none", sm: "inline" },
                        fontSize: 14,
                        color: "primary.main",
                      }}
                    />
                    <ActionIcon
                      title="Click here to verify this beneficiary"
                      color="primary"
                      highlight
                      onClick={() => onVerify(row)}
                    >
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </ActionIcon>
                  </Box>
                  <ActionIcon
                    title="Bank Verification"
                    onClick={() => void handleBankVerification(row)}
                    disabled={bankVerifying}
                    loading={verifyingThis}
                  >
                    <AccountBalanceIcon sx={{ fontSize: 16 }} />
                  </ActionIcon>
                  <ActionIcon
                    title="Delete"
                    color="error"
                    onClick={() => onDelete(row)}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </ActionIcon>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [bankVerifyId, bankVerifying, onDelete, onTransfer, onVerify]
  );

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0 }}>
      {showHeader ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#0b1f3a" }}>
              Beneficiaries
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {beneficiaries.length} account
              {beneficiaries.length === 1 ? "" : "s"} linked to this remitter
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{ boxShadow: "none", borderRadius: 1.5, flexShrink: 0 }}
          >
            Add Beneficiary
          </Button>
        </Box>
      ) : null}

      {loading ? <Skeleton variant="rounded" height={180} /> : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {actionError && !error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}

      {!loading && beneficiaries.length === 0 ? (
        <Box
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "#fafafa",
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No beneficiary yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add a beneficiary account to start money transfer.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            Add Beneficiary
          </Button>
        </Box>
      ) : null}

      {!loading && beneficiaries.length > 0 ? (
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            border: "1px solid #e2e8f0",
            borderRadius: 2,
            bgcolor: "#fff",
            overflow: "hidden",
          }}
        >
          <Box
            className="paytrue-cyan-datatable dmt-beneficiary-table"
            sx={{
              width: "100%",
              maxWidth: "100%",
              overflowX: "auto",
              overflowY: "hidden",
              WebkitOverflowScrolling: "touch",
              "& .rdt_Table": {
                minWidth: "760px !important",
              },
              "& .rdt_TableHeadRow > .rdt_TableCol:last-child, & .rdt_TableRow > .rdt_TableCell:last-child":
                {
                  position: "sticky",
                  right: 0,
                  zIndex: 2,
                  boxShadow: "-6px 0 10px -8px rgba(15, 23, 42, 0.25)",
                },
              "& .rdt_TableHeadRow > .rdt_TableCol:last-child": {
                backgroundColor: "#00AEEF !important",
              },
              "& .rdt_TableRow > .rdt_TableCell:last-child": {
                backgroundColor: "#fff",
              },
              "& .rdt_TableRow:hover > .rdt_TableCell:last-child": {
                backgroundColor: "#f0f7ff",
              },
            }}
          >
            <DataTable
              columns={columns}
              data={beneficiaries}
              sortIcon={<CyanDataTableSortIcon />}
              highlightOnHover
              dense
              pagination={beneficiaries.length > 10}
              paginationPerPage={10}
              customStyles={{
                table: {
                  style: {
                    backgroundColor: "transparent",
                    minWidth: 760,
                    width: "100%",
                  },
                },
                tableWrapper: {
                  style: {
                    display: "block",
                    overflow: "visible",
                    width: "100%",
                  },
                },
                headRow: cyanDataTableStyles.headRow,
                headCells: {
                  style: {
                    ...cyanDataTableStyles.headCells.style,
                    justifyContent: "flex-start",
                    textAlign: "left",
                    textTransform: "uppercase",
                    fontSize: "11px",
                    letterSpacing: "0.04em",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  },
                },
                rows: {
                  style: {
                    ...cyanDataTableStyles.rows.style,
                    minHeight: "56px",
                  },
                },
                cells: {
                  style: {
                    ...cyanDataTableStyles.cells.style,
                    paddingLeft: "8px",
                    paddingRight: "8px",
                    overflow: "hidden",
                  },
                },
                pagination: cyanDataTableStyles.pagination,
              }}
              noDataComponent={
                <div className="py-10 text-center text-sm text-slate-500">
                  No beneficiaries found
                </div>
              }
            />
          </Box>
        </Box>
      ) : null}

      <Dialog
        open={Boolean(bankResult)}
        onClose={() => setBankResult(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Bank Verification</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 1.25 }}>
            <Typography variant="body2" color="text.secondary">
              Account holder name from bank
            </Typography>
            <Typography sx={{ fontWeight: 800, color: "#0b1f3a" }}>
              {bankResult?.result.payee?.name || "—"}
            </Typography>
            <Typography variant="body2">
              Account:{" "}
              <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                {bankResult?.beneficiary.accountNumber ||
                  bankResult?.result.payee?.account ||
                  "—"}
              </Box>
            </Typography>
            <Typography variant="body2">
              IFSC:{" "}
              <Box component="span" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                {bankResult?.beneficiary.ifscCode ||
                  bankResult?.result.payee?.ifsc ||
                  "—"}
              </Box>
            </Typography>
            {bankResult?.result.payee?.nameMatchPercent != null ? (
              <Typography variant="body2">
                Name match:{" "}
                <Box component="span" sx={{ fontWeight: 700 }}>
                  {bankResult.result.payee.nameMatchPercent}%
                </Box>
              </Typography>
            ) : null}
            <Chip
              label="Verified"
              color="success"
              size="small"
              sx={{ width: "fit-content", fontWeight: 700 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setBankResult(null)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <ProcessLoadingOverlay
        open={bankVerifying}
        message="Please wait..."
        detail="Connecting to bank server — verifying account"
      />
    </Box>
  );
}
