export const CYAN_DATA_TABLE_HEADER_BG = "#00AEEF";

/** Minimum table width — enables horizontal scroll without clipping columns */
export const CYAN_DATA_TABLE_MIN_WIDTH = "1520px";

export const FUND_REQUEST_TABLE_MIN_WIDTH = "1520px";

export const cyanDataTableStyles = {
  table: {
    style: {
      backgroundColor: "transparent",
      minWidth: CYAN_DATA_TABLE_MIN_WIDTH,
    },
  },
  tableWrapper: {
    style: {
      display: "block",
      overflow: "visible",
    },
  },
  headRow: {
    style: {
      backgroundColor: CYAN_DATA_TABLE_HEADER_BG,
      borderBottom: "none",
      minHeight: "56px",
    },
  },
  headCells: {
    style: {
      fontSize: "13px",
      fontWeight: 700,
      color: "#ffffff",
      textTransform: "none",
      letterSpacing: "0",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center" as const,
      whiteSpace: "normal" as const,
      wordBreak: "normal" as const,
      overflow: "visible" as const,
      lineHeight: "1.25",
      paddingTop: "10px",
      paddingBottom: "10px",
      paddingLeft: "10px",
      paddingRight: "10px",
      borderRight: "1px solid rgba(255, 255, 255, 0.28)",
    },
    draggingStyle: {
      cursor: "move",
    },
  },
  rows: {
    style: {
      minHeight: "52px",
      fontSize: "14px",
      color: "#334155",
      borderBottom: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      "&:hover": { backgroundColor: "#f8fbff" },
    },
    stripedStyle: {
      backgroundColor: "#f8fafc",
    },
    highlightOnHoverStyle: {
      backgroundColor: "#f0f7ff",
      borderBottomColor: "#dbeafe",
    },
  },
  cells: {
    style: {
      paddingTop: "12px",
      paddingBottom: "12px",
      paddingLeft: "10px",
      paddingRight: "10px",
      fontSize: "14px",
      overflow: "visible" as const,
    },
  },
  pagination: {
    style: {
      borderTop: "1px solid #e2e8f0",
      minHeight: "56px",
      fontSize: "13px",
      color: "#64748b",
    },
  },
};

export function CyanDataTableSortIcon() {
  return (
    <span
      aria-hidden
      className="ml-1 inline-flex shrink-0 flex-col text-[9px] leading-none text-white/90"
    >
      <span>▲</span>
      <span className="-mt-px">▼</span>
    </span>
  );
}
