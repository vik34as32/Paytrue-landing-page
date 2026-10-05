"use client";

import { useMemo } from "react";
import DataTable, { type TableColumn } from "react-data-table-component";
import { Button, Chip, Skeleton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { ArrowRight, IndianRupee } from "lucide-react";
import { BankLogo } from "@/components/retailer/BankLogo";
import { formatAccountNumber, ifscPrefix, resolveDmt2BankName } from "../lib/dmt2-bank";
import {
  cyanDataTableStyles,
  CyanDataTableSortIcon,
} from "@/src/components/common/cyanDataTableStyles";
import type { Dmt2Beneficiary } from "../types";

interface Dmt2BeneficiaryListProps {
  beneficiaries: Dmt2Beneficiary[];
  loading?: boolean;
  onAdd: () => void;
  onPay: (beneficiary: Dmt2Beneficiary) => void;
}

export default function Dmt2BeneficiaryList({
  beneficiaries,
  loading = false,
  onAdd,
  onPay,
}: Dmt2BeneficiaryListProps) {
  const columns = useMemo<TableColumn<Dmt2Beneficiary>[]>(
    () => [
      {
        id: "name",
        name: "Beneficiary",
        selector: (row) => row.name,
        sortable: true,
        grow: 1,
        minWidth: "200px",
        cell: (row) => {
          const bankName = resolveDmt2BankName(row);
          return (
            <div className="flex min-w-0 max-w-[260px] items-center gap-3 py-1.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
                <BankLogo bank={{ name: bankName, ifscPrefix: ifscPrefix(row.ifsc) }} size={30} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold uppercase tracking-wide text-[#0b1f3a]">
                  {row.name || "—"}
                </div>
                <div className="truncate text-[11px] font-medium text-slate-500">{bankName}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "account",
        name: "Account",
        selector: (row) => row.accountNumber,
        sortable: true,
        minWidth: "170px",
        cell: (row) => (
          <span className="font-mono text-[12px] font-semibold tracking-wider text-[#0b1f3a]">
            {formatAccountNumber(row.accountNumber || row.accountNumber || "")}
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
        selector: (row) => (row.verified ? "verified" : "unverified"),
        sortable: true,
        minWidth: "120px",
        cell: (row) =>
          row.verified ? (
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
              label="Unverified"
              size="small"
              sx={{
                fontWeight: 800,
                fontSize: 11,
                height: 28,
                bgcolor: "#f59e0b",
                color: "#fff",
                border: "1px solid #d97706",
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          ),
      },
      {
  id: "actions",
  name: "Actions",
  minWidth: "120px",
  width: "120px",
  right: true,
  ignoreRowClick: true,
  button: true,
  cell: (row) => (
    <button
      type="button"
      onClick={() => onPay(row)}
      className="group flex w-[110px] h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-700 px-2 text-[11px] font-bold text-white shadow-[0_8px_18px_-10px_rgba(79,70,229,0.9)] ring-1 ring-inset ring-white/10 transition hover:-translate-y-px hover:brightness-110 active:translate-y-0"
    >
      <IndianRupee className="h-3.5 w-3.5 shrink-0" />

      <span className="truncate">
        Transfer
      </span>

      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/15 transition group-hover:translate-x-0.5 group-hover:bg-white/25">
        <ArrowRight className="h-3 w-3" />
      </span>
    </button>
  ),
},
    ],
    [onPay]
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
                minWidth: 860,
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
