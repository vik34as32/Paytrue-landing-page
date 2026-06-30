"use client";

import DataTable from "react-data-table-component";

const customStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  headRow: {
    style: {
      backgroundColor: "transparent",
      borderBottomWidth: "1px",
      borderBottomColor: "#e2e8f0",
      minHeight: "48px",
    },
  },
  headCells: {
    style: {
      fontSize: "11px",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "#64748b",
    },
  },
  rows: {
    style: {
      minHeight: "56px",
      "&:hover": {
        backgroundColor: "#f8fafc",
      },
    },
  },
  cells: {
    style: {
      fontSize: "13px",
      color: "#0b1f3a",
    },
  },
  pagination: {
    style: {
      borderTop: "none",
      fontSize: "13px",
    },
  },
};

function TableSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
      ))}
    </div>
  );
}

export default function ServerDataTable({
  columns,
  data,
  loading,
  totalRows,
  paginationPerPage = 10,
  paginationDefaultPage = 1,
  onChangePage,
  onChangeRowsPerPage,
  onSort,
  sortServer = true,
  noDataComponent,
  selectableRows = false,
}) {
  return (
    <div className="server-data-table">
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        progressComponent={<TableSkeleton />}
        pagination
        paginationServer
        paginationTotalRows={totalRows}
        paginationPerPage={paginationPerPage}
        paginationDefaultPage={paginationDefaultPage}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        onSort={onSort}
        sortServer={sortServer}
        customStyles={customStyles}
        noDataComponent={noDataComponent}
        selectableRows={selectableRows}
        highlightOnHover
        responsive
        persistTableHead
      />
    </div>
  );
}
