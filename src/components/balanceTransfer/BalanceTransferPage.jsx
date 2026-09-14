"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { AnimatedMpinInput } from "@/features/mpin";
import { selectUser } from "@/src/redux/slices/authSlice";
import { selectWalletByRole } from "@/src/redux/slices/walletSlice";
import { fetchWalletBalance } from "@/src/redux/thunks/walletThunk";
import {
  fetchWalletTransferUsers,
  normalizeWalletTransferRole,
  submitWalletTransfer,
} from "@/src/services/walletTransferService";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

/**
 * downline → Balance Transfer:
 *   DD: all hierarchy retailers (with phone)
 *   MD: all hierarchy distributors (with phone)
 * peer     → Wallet to Wallet (DD/MD): number search for peer distributors
 * rt       → Retailer portal: number search for allowed receivers
 */
const DOWNLINE_DD = {
  title: "Balance Transfer",
  eyebrow: "Retailer transfer",
  description: "Transfer balance to retailers under your hierarchy.",
  targetRoles: ["RETAILER"],
  groupLabel: "Retailers",
  useNumberSearch: false,
  showMobile: true,
  emptyHint: "No retailers found",
  searchPlaceholder: "Search name or phone...",
  selectPlaceholder: "Choose retailer",
  helpText: "Select a retailer from the dropdown. Name and phone are shown.",
};

const DOWNLINE_MD = {
  title: "Balance Transfer",
  eyebrow: "Distributor transfer",
  description: "Transfer balance to distributors under your hierarchy.",
  targetRoles: ["DISTRIBUTOR"],
  groupLabel: "Distributors",
  useNumberSearch: false,
  showMobile: true,
  emptyHint: "No distributors found",
  searchPlaceholder: "Search name or phone...",
  selectPlaceholder: "Choose distributor",
  helpText: "Select a distributor from the dropdown. Name and phone are shown.",
};

const PEER_MODE = {
  title: "Wallet to Wallet Transfer",
  eyebrow: "Distributor transfer",
  description: "Search by mobile number to transfer to an allowed distributor.",
  targetRoles: ["DISTRIBUTOR"],
  groupLabel: "Distributors",
  useNumberSearch: true,
  showMobile: false,
  emptyHint: "No distributors found",
  searchPlaceholder: "Search by mobile number...",
  selectPlaceholder: "Search mobile number to find distributor",
  numberSearchHint: "Type at least 3 digits of distributor mobile number",
  helpText:
    "Type at least 3 digits of the distributor mobile number. Only matching distributors appear. Numbers stay hidden.",
};

const RT_MODE = {
  title: "Balance Transfer",
  eyebrow: "Wallet transfer",
  description: "Search by mobile number to transfer to an allowed receiver.",
  targetRoles: ["RETAILER", "DISTRIBUTOR"],
  groupLabel: "Receivers",
  useNumberSearch: true,
  showMobile: false,
  emptyHint: "No receivers found",
  searchPlaceholder: "Search by mobile number...",
  selectPlaceholder: "Search mobile number to find receiver",
  numberSearchHint: "Type at least 3 digits of mobile number",
  helpText:
    "Type at least 3 digits of the mobile number. Only matching receivers appear. Numbers stay hidden.",
};

function getModeMeta(resolvedMode, role) {
  if (resolvedMode === "peer") return PEER_MODE;
  if (resolvedMode === "rt") return RT_MODE;
  return role === "md" ? DOWNLINE_MD : DOWNLINE_DD;
}

function getSearchDigits(query) {
  return String(query || "").replace(/\D/g, "");
}

function isActiveNumberSearch(query) {
  return getSearchDigits(query).length >= 3;
}

function receiverOptionLabel(peer, showMobile) {
  const name = peer?.name || "Member";
  if (!showMobile) return name;
  const mobile = String(peer?.mobile || "").trim();
  return mobile ? `${name} · ${mobile}` : name;
}

export default function BalanceTransferPage({ role, mode }) {
  const dispatch = useDispatch();
  const resolvedMode = mode || (role === "rt" ? "rt" : "downline");
  const modeMeta = getModeMeta(resolvedMode, role);
  const currentUser = useSelector(selectUser);
  const wallet = useSelector(selectWalletByRole(role));
  const senderRole =
    role === "md"
      ? "MASTER_DISTRIBUTOR"
      : role === "dd"
        ? "DISTRIBUTOR"
        : "RETAILER";
  const requiresMpin = role === "rt";
  const selfId = String(currentUser?.id || currentUser?._id || "");
  const available = Number(wallet?.availableBalance ?? wallet?.balance ?? 0);
  const useNumberSearch = modeMeta.useNumberSearch;
  const showMobile = Boolean(modeMeta.showMobile);
  const targetRoles = modeMeta.targetRoles;

  const [peers, setPeers] = useState([]);
  const [loadingPeers, setLoadingPeers] = useState(!useNumberSearch);
  const [peerError, setPeerError] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiverSearch, setReceiverSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searching, setSearching] = useState(false);

  const hasNumberSearch = useNumberSearch && isActiveNumberSearch(debouncedSearch);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(receiverSearch.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [receiverSearch]);

  const loadDownlineReceivers = useCallback(async () => {
    setLoadingPeers(true);
    setPeerError("");
    try {
      const result = await fetchWalletTransferUsers({
        role: senderRole,
        page: 1,
        limit: 100,
        targetRoles,
        fetchAll: true,
      });
      setPeers(
        result.items.filter((item) => item.id !== selfId && item.userId !== selfId)
      );
    } catch (error) {
      setPeers([]);
      setPeerError(error?.message || "Unable to load receivers");
    } finally {
      setLoadingPeers(false);
    }
  }, [senderRole, selfId, targetRoles]);

  const searchReceiversByNumber = useCallback(
    async (search) => {
      const digits = getSearchDigits(search);
      if (!isActiveNumberSearch(search)) {
        setPeers([]);
        setPeerError("");
        setSearching(false);
        return;
      }
      setSearching(true);
      setPeerError("");
      try {
        const result = await fetchWalletTransferUsers({
          role: senderRole,
          page: 1,
          limit: 100,
          search,
          targetRoles,
        });
        setPeers(
          result.items.filter((item) => {
            if (item.id === selfId || item.userId === selfId) return false;
            const mobile = String(item.mobile || "").replace(/\D/g, "");
            return mobile.includes(digits);
          })
        );
      } catch (error) {
        setPeers([]);
        setPeerError(error?.message || "Unable to search receivers");
      } finally {
        setSearching(false);
      }
    },
    [senderRole, selfId, targetRoles]
  );

  const visiblePeers = useMemo(() => {
    if (useNumberSearch) {
      if (!hasNumberSearch) return [];
      const digits = getSearchDigits(debouncedSearch);
      return peers.filter((peer) =>
        String(peer.mobile || "").replace(/\D/g, "").includes(digits)
      );
    }
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return peers;
    const digits = getSearchDigits(debouncedSearch);
    return peers.filter((peer) => {
      const name = String(peer.name || "").toLowerCase();
      const code = String(peer.userCode || "").toLowerCase();
      const mobile = String(peer.mobile || "").replace(/\D/g, "");
      return (
        name.includes(q) ||
        code.includes(q) ||
        (digits && mobile.includes(digits))
      );
    });
  }, [peers, useNumberSearch, hasNumberSearch, debouncedSearch]);

  useEffect(() => {
    dispatch(fetchWalletBalance({ role }));
  }, [dispatch, role]);

  useEffect(() => {
    if (useNumberSearch) return;
    void loadDownlineReceivers();
  }, [useNumberSearch, loadDownlineReceivers]);

  useEffect(() => {
    if (!useNumberSearch) return;
    if (!hasNumberSearch) {
      setPeers([]);
      setPeerError("");
      setSearching(false);
      return;
    }
    void searchReceiversByNumber(debouncedSearch);
  }, [
    useNumberSearch,
    hasNumberSearch,
    debouncedSearch,
    searchReceiversByNumber,
  ]);

  const amountValue = Number(amount);

  const openConfirm = () => {
    if (!selected?.id) {
      setFieldError("Select a receiver first");
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setFieldError("Enter an amount greater than zero");
      return;
    }
    if (amountValue > available) {
      setFieldError("Insufficient wallet balance");
      return;
    }
    setFieldError("");
    if (requiresMpin) setMpin("");
    setConfirmOpen(true);
  };

  const submitTransfer = async () => {
    if (!selected?.id || submitting) return;
    if (requiresMpin && !/^\d{4}$/.test(mpin)) {
      toast.error("Enter your 4-digit MPIN");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitWalletTransfer({
        receiverId: selected.id,
        amount: amountValue,
        remarks: `Balance transfer to ${selected.name}`,
        ...(requiresMpin ? { mpin } : {}),
        senderRole,
        receiverRole: selected.role || modeMeta.targetRoles[0],
      });
      toast.success(result.message || `Sent to ${selected.name}`);
      setConfirmOpen(false);
      setSelected(null);
      setAmount("");
      setMpin("");
      setReceiverSearch("");
      setDebouncedSearch("");
      if (useNumberSearch) {
        setPeers([]);
      } else {
        void loadDownlineReceivers();
      }
      dispatch(fetchWalletBalance({ role }));
    } catch (error) {
      toast.error(error?.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel =
    normalizeWalletTransferRole(selected?.role) === "DISTRIBUTOR"
      ? "Distributor"
      : normalizeWalletTransferRole(selected?.role) === "MASTER_DISTRIBUTOR"
        ? "Master Distributor"
        : "Retailer";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight text-[#0b1f3a] sm:text-2xl">
          {modeMeta.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{modeMeta.description}</p>
      </div>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_rgba(11,31,58,0.06)] sm:p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#0b1f3a]">
              {useNumberSearch
                ? "Select receiver"
                : role === "md"
                  ? "Choose distributor"
                  : "Choose retailer"}
            </Label>
            <Select
              value={selected?.id || ""}
              onValueChange={(id) => {
                const found =
                  visiblePeers.find((peer) => peer.id === id) ||
                  peers.find((peer) => peer.id === id) ||
                  (selected?.id === id ? selected : null);
                setSelected(found);
                setFieldError("");
              }}
              disabled={!useNumberSearch && loadingPeers && !peers.length}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue
                  placeholder={
                    useNumberSearch
                      ? modeMeta.selectPlaceholder
                      : loadingPeers
                        ? "Loading…"
                        : modeMeta.selectPlaceholder
                  }
                >
                  {selected
                    ? receiverOptionLabel(selected, showMobile)
                    : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <div
                  className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2"
                  onPointerDown={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <Input
                    value={receiverSearch}
                    onChange={(event) => {
                      const value = event.target.value;
                      setReceiverSearch(
                        useNumberSearch
                          ? value.replace(/[^\d\s+-]/g, "")
                          : value
                      );
                    }}
                    placeholder={modeMeta.searchPlaceholder}
                    inputMode={useNumberSearch ? "numeric" : "text"}
                    className="h-9"
                    autoComplete="off"
                  />
                  {searching ? (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Searching…
                    </p>
                  ) : null}
                </div>

                {useNumberSearch && !hasNumberSearch ? (
                  <p className="px-3 py-3 text-sm text-slate-500">
                    {modeMeta.numberSearchHint}
                  </p>
                ) : loadingPeers ? (
                  <p className="px-3 py-3 text-sm text-slate-500">Loading…</p>
                ) : visiblePeers.length === 0 ? (
                  <p className="px-3 py-3 text-sm text-slate-500">
                    {modeMeta.emptyHint}
                  </p>
                ) : (
                  <SelectGroup>
                    <SelectLabel>{modeMeta.groupLabel}</SelectLabel>
                    {visiblePeers.map((peer) => (
                      <SelectItem key={peer.id} value={peer.id}>
                        {receiverOptionLabel(peer, showMobile)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
            {peerError ? <p className="text-sm text-rose-600">{peerError}</p> : null}
            <p className="text-xs text-slate-500">{modeMeta.helpText}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#0b1f3a]">Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <Input
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^\d.]/g, ""));
                  setFieldError("");
                }}
                placeholder="0.00"
                className="h-14 rounded-xl border-slate-200 pl-9 text-xl font-extrabold tabular-nums"
              />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_AMOUNTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAmount(String(value));
                    setFieldError("");
                  }}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-[#1565d8] hover:text-[#1565d8]"
                >
                  ₹{value.toLocaleString("en-IN")}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAmount(available > 0 ? String(Math.floor(available)) : "");
                  setFieldError("");
                }}
                className="rounded-full bg-[#0b1f3a] px-3 py-1.5 text-xs font-bold text-white"
              >
                MAX
              </button>
            </div>
          </div>

          {fieldError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {fieldError}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={openConfirm}
            disabled={submitting}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9] text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            <Wallet className="h-4 w-4" />
            Continue
          </Button>
        </div>
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[420px] gap-0 overflow-hidden rounded-3xl p-0">
          <div className="bg-gradient-to-br from-[#021433] to-[#1565d8] px-6 py-5 text-white">
            <DialogTitle className="text-lg font-extrabold">Confirm transfer</DialogTitle>
            <DialogDescription className="text-sm text-blue-100">
              {requiresMpin
                ? "Enter your 4-digit MPIN to send money."
                : "Review the details and confirm to send money."}
            </DialogDescription>
          </div>
          <div className="space-y-5 px-6 py-5">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Sending to
              </p>
              <p className="mt-1 text-base font-extrabold text-[#0b1f3a]">
                {selected?.name}
              </p>
              {showMobile && selected?.mobile ? (
                <p className="text-sm text-slate-500">{selected.mobile}</p>
              ) : (
                <p className="text-sm text-slate-500">{roleLabel}</p>
              )}
              <p className="mt-3 text-2xl font-black tabular-nums text-[#1565d8]">
                {formatCurrency(amountValue || 0)}
              </p>
            </div>

            {requiresMpin ? (
              <AnimatedMpinInput
                label="MPIN"
                value={mpin}
                onChange={setMpin}
                autoFocus
                disabled={submitting}
                hint="Enter 4 digit MPIN"
              />
            ) : null}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 flex-1 rounded-xl"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
                onClick={() => void submitTransfer()}
                disabled={submitting || (requiresMpin && mpin.length !== 4)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Confirm & Send"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
