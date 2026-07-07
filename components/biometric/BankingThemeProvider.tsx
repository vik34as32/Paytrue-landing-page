"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import type { ReactNode } from "react";

const bankingTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565d8",
      dark: "#001F5B",
      light: "#0A84FF",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    success: {
      main: "#16a34a",
    },
    error: {
      main: "#dc2626",
    },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: "inherit",
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
  },
});

export default function BankingThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={bankingTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
