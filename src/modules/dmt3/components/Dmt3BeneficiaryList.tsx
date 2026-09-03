"use client";

import { useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Button, Chip, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { BankLogo } from "@/components/retailer/BankLogo";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import type { Dmt3Beneficiary } from "../types/dmt3.types";

interface Dmt3BeneficiaryListProps {
  beneficiaries: Dmt3Beneficiary[];
  loading?: boolean;
  actionLoading?: boolean;
  onAdd: () => void;
  onPay: (beneficiary: Dmt3Beneficiary) => void;
  onVerify?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function isVerified(row: Dmt3Beneficiary): boolean {
  return row.isVerified || row.verificationStatus === "VERIFIED";
}

export default function Dmt3BeneficiaryList({
  beneficiaries,
  loading = false,
  actionLoading = false,
  onAdd,
  onPay,
  onVerify,
  onDelete,
}: Dmt3BeneficiaryListProps) {
  const columns = useMemo<TableColumn<Dmt3Beneficiary>[]>(
    () => [
      {
        id: "name",
        name: "Beneficiary",
        selector: (row) => row.name,
        sortable: true,
        grow: 1,
        minWidth: "200px",
        cell: (row) => (
          <div className="flex min-w-0 max-w-[240px] items-center gap-2 py-1">
            <BankLogo
              bank={{
                name: row.bankName || row.ifsc.slice(0, 4),
                ifscPrefix: row.ifsc.slice(0, 4),
              }}
              size={28}
            />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-bold text-[#0b1f3a]">
                {row.name || "—"}
              </div>
              <div className="truncate text-[11px] text-slate-500">
                {row.bankName || row.ifsc.slice(0, 4) || "Bank"}
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
        minWidth: "150px",
        cell: (row) => (
          <span className="font-mono text-[12px] font-semibold tracking-wide text-[#0b1f3a]">
            {row.accountMasked || row.accountNumber || "—"}
          </span>
        ),
      },
      {
        id: "ifsc",
        name: "IFSC",
        selector: (row) => row.ifsc,
        sortable: true,
        minWidth: "118px",
        cell: (row) => (
          <span className="font-mono text-[12px] text-slate-600">{row.ifsc || "—"}</span>
        ),
      },
      {
        id: "mobile",
        name: "Mobile",
        selector: (row) => row.mobile || "",
        sortable: true,
        minWidth: "110px",
        cell: (row) => (
          <span className="tabular-nums text-[13px] text-slate-700">{row.mobile || "—"}</span>
        ),
      },
      {
        id: "status",
        name: "Status",
        selector: (row) => row.verificationStatus,
        sortable: true,
        minWidth: "120px",
        cell: (row) =>
          isVerified(row) ? (
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
                "& .MuiChip-label": { px: 0.75 },
                "& .MuiChip-icon": { ml: 0.75 },
              }}
            />
          ) : (
            <Chip
              label={row.verificationStatus === "FAILED" ? "Failed" : "Unverified"}
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: 11,
                height: 28,
                bgcolor: row.verificationStatus === "FAILED" ? "#ef4444" : "#f59e0b",
                color: "#fff",
                border: `1px solid ${row.verificationStatus === "FAILED" ? "#dc2626" : "#d97706"}`,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          ),
      },
      {
        id: "actions",
        name: "Actions",
        minWidth: "220px",
        right: true,
        ignoreRowClick: true,
        button: true,
        cell: (row) => (
          <div className="flex flex-wrap justify-end gap-1">
            {!isVerified(row) && onVerify ? (
              <Button
                size="small"
                variant="outlined"
                disabled={actionLoading || row.verificationStatus === "FAILED"}
                startIcon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                onClick={() => onVerify(row.id)}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 11 }}
              >
                Verify
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={actionLoading}
                startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                onClick={() => onDelete(row.id)}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 11 }}
              >
                Delete
              </Button>
            ) : null}
            <Button
              size="small"
              variant="contained"
              disabled={row.verificationStatus === "FAILED"}
              startIcon={<SendIcon sx={{ fontSize: 16 }} />}
              onClick={() => onPay(row)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: 1.5,
                boxShadow: "none",
                px: 1.5,
                bgcolor: "#1565d8",
                "&:hover": { bgcolor: "#0d47a1" },
              }}
            >
              Proceed to Pay
            </Button>
          </div>
        ),
      },
    ],
    [actionLoading, onDelete, onPay, onVerify]
  );

  if (loading) {
    return <Skeleton variant="rounded" height={180} />;
  }

  if (!beneficiaries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-[#fafafa] p-10 text-center">
        <p className="font-bold text-[#0b1f3a]">No beneficiary yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add a beneficiary account to start money transfer.
        </p>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{ mt: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
        >
          Add Beneficiary
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="paytrue-cyan-datatable dmt-beneficiary-table overflow-x-auto">
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
                minWidth: 960,
                width: "100%",
              },
            },
            headRow: cyanDataTableStyles.headRow,
            headCells: {
              style: {
                ...cyanDataTableStyles.headCells.style,
                justifyContent: "flex-start",
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
              },
            },
            pagination: cyanDataTableStyles.pagination,
          }}
        />
      </div>
    </div>
  );
}
