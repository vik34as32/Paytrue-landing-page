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

function parseWalletAmount(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function pickAmount(row, keys, nestedKey) {
  for (const key of keys) {
    if (row?.[key] != null && row[key] !== "") {
      const parsed = parseWalletAmount(row[key]);
      if (parsed != null) return parsed;
    }
  }
  const nested = nestedKey ? row?.[nestedKey] : row?.wallet ?? row?.balances;
  if (nested && typeof nested === "object") {
    for (const key of keys) {
      if (nested[key] != null && nested[key] !== "") {
        const parsed = parseWalletAmount(nested[key]);
        if (parsed != null) return parsed;
      }
    }
  }
  return null;
}

function resolveOpeningBalance(row) {
  return (
    pickAmount(row, [
      "openingBalance",
      "opening_balance",
      "openBalance",
      "open_balance",
      "balanceBefore",
      "balance_before",
      "previousBalance",
      "previous_balance",
      "walletOpeningBalance",
      "openingBal",
    ]) ?? 0
  );
}

function resolveClosingBalance(row, openingBalance, credit, debit) {
  const explicit = pickAmount(row, [
    "closingBalance",
    "closing_balance",
    "closeBalance",
    "close_balance",
    "balanceAfter",
    "balance_after",
    "currentBalance",
    "current_balance",
    "newBalance",
    "new_balance",
    "walletClosingBalance",
    "closingBal",
  ]);

  if (explicit != null) return explicit;

  const before = pickAmount(row, [
    "balanceBefore",
    "balance_before",
    "openingBalance",
    "opening_balance",
  ]);
  const after = pickAmount(row, [
    "balanceAfter",
    "balance_after",
    "closingBalance",
    "closing_balance",
  ]);

  if (before != null && after != null) return after;
  if (before != null && (credit > 0 || debit > 0)) {
    return before + credit - debit;
  }
  if (openingBalance > 0 || credit > 0 || debit > 0) {
    return openingBalance + credit - debit;
  }

  return 0;
}

export function normalizeLedgerEntry(row) {
  const amount = parseWalletAmount(row.amount) ?? 0;
  const credit = parseWalletAmount(row.credit) ?? 0;
  const debit = parseWalletAmount(row.debit) ?? 0;
  const rawType = row.type ?? row.transactionType ?? row.txnType ?? "—";
  const typeUpper = String(rawType).toUpperCase();
  const isCredit =
    credit > 0 ||
    typeUpper.includes("CREDIT") ||
    typeUpper === "TRANSFER_IN" ||
    typeUpper === "FUND" ||
    typeUpper === "TOPUP";

  const resolvedCredit = credit || (isCredit && !debit ? amount : 0);
  const resolvedDebit = debit || (!isCredit && amount > 0 ? amount : 0);
  const openingBalance = resolveOpeningBalance(row);
  const closingBalance = resolveClosingBalance(
    row,
    openingBalance,
    resolvedCredit,
    resolvedDebit
  );

  return {
    id: String(row.id ?? row._id ?? row.transactionId ?? `txn_${Date.now()}`),
    transactionId: String(
      row.transactionId ?? row.transaction_id ?? row.reference ?? row.id ?? "—"
    ),
    date:
      row.date ??
      row.createdAt ??
      row.created_at ??
      row.transactionDate ??
      row.transaction_date ??
      "",
    sender: formatPartyName(row.sender ?? row.senderName ?? row.from),
    receiver: formatPartyName(row.receiver ?? row.receiverName ?? row.to),
    userType: formatTextValue(row.userType ?? row.user_type ?? rawType),
    transactionType: formatTextValue(rawType),
    amount,
    credit: resolvedCredit,
    debit: resolvedDebit,
    openingBalance,
    closingBalance,
    status: String(row.status ?? "success").toLowerCase(),
    remark: formatTextValue(row.remark ?? row.remarks ?? row.description),
    description: formatTextValue(row.description ?? row.remark ?? row.remarks),
  };
}

export function extractLedgerEntries(raw) {
  const data = raw?.wallet || raw || {};
  const entries =
    data.ledgerEntries ??
    data.ledger ??
    data.history ??
    raw?.ledgerEntries ??
    raw?.ledger ??
    [];
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
  const amount = parseWalletAmount(row.amount) ?? 0;
  const rawType =
    row.transactionType ??
    row.transaction_type ??
    row.type ??
    row.txnType ??
    row.userType ??
    "";
  const direction = String(row.direction ?? row.txnDirection ?? "").toUpperCase();
  const typeLower = String(rawType).toLowerCase();
  const isCreditType =
    direction === "CREDIT" ||
    typeLower.includes("credit") ||
    typeLower.includes("fund") ||
    typeLower.includes("topup") ||
    typeLower.includes("deposit");

  let credit = parseWalletAmount(row.credit) ?? 0;
  let debit = parseWalletAmount(row.debit) ?? 0;

  if (!credit && !debit && amount > 0) {
    if (isCreditType || direction !== "DEBIT") {
      credit = amount;
    } else {
      debit = amount;
    }
  }

  const openingBalance = resolveOpeningBalance(row);
  const closingBalance = resolveClosingBalance(row, openingBalance, credit, debit);

  return {
    id: String(row.id ?? row._id ?? row.transactionId ?? `txn_${Date.now()}`),
    transactionId: String(
      row.transactionId ?? row.transaction_id ?? row.id ?? row._id ?? "—"
    ),
    date:
      row.date ??
      row.createdAt ??
      row.created_at ??
      row.transactionDate ??
      row.transaction_date ??
      "",
    sender: formatPartyName(row.sender ?? row.senderName ?? row.from),
    receiver: formatPartyName(row.receiver ?? row.receiverName ?? row.to),
    userType: formatTextValue(row.userType ?? row.user_type ?? row.receiverType ?? rawType),
    transactionType: formatTextValue(rawType || row.userType || row.receiverType),
    amount,
    credit,
    debit,
    openingBalance,
    closingBalance,
    status: String(row.status ?? "success").toLowerCase(),
    remark: formatTextValue(row.remark ?? row.remarks ?? row.description),
    description: formatTextValue(row.description ?? row.remark ?? row.remarks),
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
