const emptyRoleWallet = (fallbackBalance = 0) => ({
  balance: fallbackBalance,
  currentBalance: fallbackBalance,
  holdBalance: 0,
  availableBalance: fallbackBalance,
  lastUpdated: null,
  loading: false,
  error: null,
});

export function normalizeWalletPayload(raw) {
  const data = raw?.wallet || raw || {};
  const currentBalance = Number(
    data.currentBalance ?? data.balance ?? data.totalBalance ?? 0
  );
  const holdBalance = Number(
    data.holdBalance ?? data.holdAmount ?? data.onHoldBalance ?? data.hold ?? 0
  );
  const availableBalance = Number(
    data.availableBalance ??
      data.available ??
      (currentBalance - holdBalance >= 0 ? currentBalance - holdBalance : currentBalance)
  );

  return {
    balance: availableBalance,
    currentBalance,
    holdBalance,
    availableBalance,
    lastUpdated: data.lastUpdated ?? data.updatedAt ?? data.lastUpdatedAt ?? null,
    cardNumber: data.cardNumber ?? null,
    cardHolderName: data.cardHolderName ?? null,
    retailerCode: data.retailerCode ?? null,
    expiryDate: data.expiryDate ?? null,
    currency: data.currency ?? "INR",
    status: data.status ?? null,
  };
}

export function normalizeLedgerEntry(row) {
  const amount = Number(row.amount ?? 0);
  const balanceBefore = Number(row.balanceBefore ?? row.openingBalance ?? row.openBalance ?? 0);
  const balanceAfter = Number(row.balanceAfter ?? row.closingBalance ?? row.closeBalance ?? 0);
  const rawType = row.type ?? row.transactionType ?? "—";
  const typeUpper = String(rawType).toUpperCase();
  const isCredit =
    typeUpper.includes("CREDIT") ||
    typeUpper === "TRANSFER_IN" ||
    balanceAfter > balanceBefore;

  return {
    id: String(row.id ?? row.transactionId ?? `txn_${Date.now()}`),
    transactionId: String(row.transactionId ?? row.reference ?? row.id ?? "—"),
    date: row.date ?? row.createdAt ?? row.transactionDate ?? "",
    sender: formatPartyName(row.sender ?? row.senderName),
    receiver: formatPartyName(row.receiver ?? row.receiverName),
    userType: formatTextValue(row.userType ?? rawType),
    transactionType: formatTextValue(rawType),
    amount,
    credit: Number(row.credit ?? (isCredit ? amount : 0)),
    debit: Number(row.debit ?? (!isCredit ? amount : 0)),
    openingBalance: balanceBefore,
    closingBalance: balanceAfter,
    status: String(row.status ?? "success").toLowerCase(),
    remark: formatTextValue(row.remark ?? row.description),
    description: formatTextValue(row.description ?? row.remark),
  };
}

export function extractLedgerEntries(raw) {
  const data = raw?.wallet || raw || {};
  const entries = data.ledgerEntries ?? raw?.ledgerEntries ?? [];
  return Array.isArray(entries) ? entries.map(normalizeLedgerEntry) : [];
}

function formatPartyName(party) {
  if (party == null || party === "") return "—";
  if (typeof party === "string") return party;
  if (typeof party === "number") return String(party);
  if (typeof party === "object") {
    if (typeof party.name === "string" && party.name.trim()) return party.name.trim();
    const fullName = `${party.firstName || ""} ${party.lastName || ""}`.trim();
    if (fullName) return fullName;
    if (party.email) return String(party.email);
    if (party.userId) return String(party.userId);
    if (party.id) return String(party.id);
    return "—";
  }
  return String(party);
}

function formatTextValue(value) {
  if (value == null || value === "") return "—";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (value.name) return String(value.name);
    if (value.label) return String(value.label);
    if (value.userType) return String(value.userType);
    return formatPartyName(value);
  }
  return String(value);
}

export function normalizeTransferRecord(row) {
  const amount = Number(row.amount ?? 0);
  const rawType = row.transactionType ?? row.type ?? row.userType ?? row.txnType ?? "";
  const direction = String(row.direction ?? row.txnDirection ?? "").toUpperCase();
  const credit = Number(
    row.credit ??
      (direction === "CREDIT" || rawType.toLowerCase().includes("credit")
        ? amount
        : 0)
  );
  const debit = Number(
    row.debit ??
      (direction === "DEBIT" || rawType.toLowerCase().includes("debit")
        ? amount
        : 0)
  );

  return {
    id: String(row.id ?? row._id ?? row.transactionId ?? `txn_${Date.now()}`),
    transactionId: String(row.transactionId ?? row.id ?? row._id ?? "—"),
    date: row.date ?? row.createdAt ?? row.transactionDate ?? "",
    sender: formatPartyName(row.sender ?? row.senderName),
    receiver: formatPartyName(row.receiver ?? row.receiverName),
    userType: formatTextValue(row.userType ?? row.receiverType ?? rawType),
    transactionType: formatTextValue(rawType || row.userType || row.receiverType),
    amount,
    credit: credit || (debit ? 0 : amount > 0 && direction !== "DEBIT" ? amount : 0),
    debit: debit || (credit ? 0 : amount > 0 && direction === "DEBIT" ? amount : 0),
    openingBalance: Number(row.openingBalance ?? row.openBalance ?? row.balanceBefore ?? 0),
    closingBalance: Number(row.closingBalance ?? row.closeBalance ?? row.balanceAfter ?? 0),
    status: String(row.status ?? "—").toLowerCase(),
    remark: formatTextValue(row.remark ?? row.description),
    description: formatTextValue(row.description ?? row.remark),
  };
}

export function createInitialWalletState() {
  return {
    md: emptyRoleWallet(0),
    dd: emptyRoleWallet(0),
    rt: emptyRoleWallet(0),
    transfer: {
      loading: false,
      error: null,
    },
    history: {
      list: [],
      total: 0,
      page: 1,
      limit: 10,
      search: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      dateFrom: "",
      dateTo: "",
      loading: false,
      error: null,
    },
  };
}

export function getWalletRoleKey(role) {
  if (role === "md" || role === "dd" || role === "rt") return role;
  return "md";
}

export const RECEIVER_TYPES_BY_ROLE = {
  md: [{ value: "DISTRIBUTOR", label: "Distributor" }],
  dd: [{ value: "RETAILER", label: "Retailer" }],
  rt: [
    { value: "DISTRIBUTOR", label: "Distributor" },
    { value: "RETAILER", label: "Retailer" },
  ],
};

export const WALLET_PAGE_TITLES = {
  md: "Master Distributor Wallet",
  dd: "Distributor Wallet",
  rt: "RT Wallet",
};
