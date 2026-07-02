export const USER_TYPES = {
  MASTER_DISTRIBUTOR: "MASTER_DISTRIBUTOR",
  DISTRIBUTOR: "DISTRIBUTOR",
  RETAILER: "RETAILER",
};

export const USER_TYPE_LABELS = {
  [USER_TYPES.MASTER_DISTRIBUTOR]: "Master Distributor",
  [USER_TYPES.DISTRIBUTOR]: "Distributor",
  [USER_TYPES.RETAILER]: "Retailer",
};

/** Role-based dashboard paths (canonical redirects after login) */
export const ROLE_DASHBOARD_PATHS = {
  [USER_TYPES.MASTER_DISTRIBUTOR]: "/dashboard/master-distributor",
  [USER_TYPES.DISTRIBUTOR]: "/dashboard/distributor",
  [USER_TYPES.RETAILER]: "/dashboard/retailer",
};

/** Existing portal paths used by the app */
export const ROLE_PORTAL_PATHS = {
  [USER_TYPES.MASTER_DISTRIBUTOR]: "/md/dashboard",
  [USER_TYPES.DISTRIBUTOR]: "/dd/dashboard",
  [USER_TYPES.RETAILER]: "/rt/retailer",
};

export const PROTECTED_PREFIXES = ["/md", "/dd", "/dashboard", "/rt/retailer", "/rt/balance-transfer"];

export const PUBLIC_PATHS = [
  "/auth/login",
  "/",
  "/about",
  "/contact",
  "/services",
  "/privacy-policy",
  "/terms-and-conditions",
  "/refund-policy",
  "/signup",
];

export const COOKIE_KEYS = {
  accessToken: "pt_access_token",
  refreshToken: "pt_refresh_token",
  user: "pt_user",
  remember: "pt_remember",
};
