"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftRight, Loader2, ShieldCheck, Wallet } from "lucide-react";
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

const ROLE_META = {
  rt: {
    userType: "RETAILER",
    peer: "receiver",
    peers: "receivers",
    title: "Balance Transfer",
    description: "Send money to another retailer in the allowed hierarchy.",
  },
  dd: {
    userType: "DISTRIBUTOR",
    peer: "receiver",
    peers: "receivers",
    title: "Balance Transfer",
    description: "Send money to retailers under you, or to another allowed distributor.",
  },
  md: {
    userType: "MASTER_DISTRIBUTOR",
    peer: "receiver",
    peers: "receivers",
    title: "Balance Transfer",
    description:
      "Send money to any distributor or retailer in your hierarchy, including nested retailers.",
  },
};

const TARGET_GROUPS = [
  { role: "RETAILER", label: "Retailers" },
  { role: "DISTRIBUTOR", label: "Distributors" },
  { role: "MASTER_DISTRIBUTOR", label: "Master Distributors" },
];

export default function BalanceTransferPage({ role }) {
  const dispatch = useDispatch();
  const meta = ROLE_META[role] ?? ROLE_META.rt;
  const currentUser = useSelector(selectUser);
  const wallet = useSelector(selectWalletByRole(role));
  const transferRole = meta.userType;
  const requiresMpin = role === "rt";
  const selfId = String(currentUser?.id || currentUser?._id || "");
  const available = Number(wallet?.availableBalance ?? wallet?.balance ?? 0);

  const [peers, setPeers] = useState([]);
  const [loadingPeers, setLoadingPeers] = useState(true);
  const [peerError, setPeerError] = useState("");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [mpin, setMpin] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadPeers = useCallback(async () => {
    setLoadingPeers(true);
    setPeerError("");
    try {
      const result = await fetchWalletTransferUsers({
        role: transferRole,
        page: 1,
        limit: 100,
      });
      setPeers(
        result.items.filter((item) => item.id !== selfId && item.userId !== selfId)
      );
    } catch (error) {
      setPeers([]);
      setPeerError(error?.message || `Unable to load ${meta.peers}`);
    } finally {
      setLoadingPeers(false);
    }
  }, [meta.peers, selfId, transferRole]);

  const groupedPeers = useMemo(
    () =>
      TARGET_GROUPS.map((group) => ({
        ...group,
        items: peers.filter(
          (peer) => normalizeWalletTransferRole(peer.role) === group.role
        ),
      })).filter((group) => group.items.length > 0),
    [peers]
  );

  useEffect(() => {
    dispatch(fetchWalletBalance({ role }));
    void loadPeers();
  }, [dispatch, loadPeers, role]);

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
        senderRole: transferRole,
        receiverRole: selected.role,
      });
      toast.success(result.message || `Sent to ${selected.name}`);
      setConfirmOpen(false);
      setSelected(null);
      setAmount("");
      setMpin("");
      dispatch(fetchWalletBalance({ role }));
      void loadPeers();
    } catch (error) {
      toast.error(error?.message || "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#021433] via-[#0d47a1] to-[#1565d8] px-6 py-6 text-white shadow-[0_18px_40px_rgba(11,47,115,0.25)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/80">
              Hierarchy transfer
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{meta.title}</h1>
            <p className="mt-1 text-sm text-blue-100/90">{meta.description}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-100/80">
              Available balance
            </p>
            <p className="text-2xl font-black tabular-nums">{formatCurrency(available)}</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-blue-100" />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_rgba(11,31,58,0.06)] sm:p-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#0b1f3a]">
              Select receiver
            </Label>
            <Select
              value={selected?.id || ""}
              onValueChange={(id) => {
                setSelected(peers.find((peer) => peer.id === id) || null);
                setFieldError("");
              }}
              disabled={loadingPeers}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue
                  placeholder={
                    loadingPeers ? `Loading ${meta.peers}…` : "Select receiver"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {groupedPeers.map((group) => (
                  <SelectGroup key={group.role}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.items.map((peer) => (
                      <SelectItem key={peer.id} value={peer.id}>
                        {peer.name}
                        {peer.mobile ? ` · ${peer.mobile}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {peerError ? <p className="text-sm text-rose-600">{peerError}</p> : null}
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
            disabled={submitting || loadingPeers}
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
              <p className="mt-1 text-base font-extrabold text-[#0b1f3a]">{selected?.name}</p>
              <p className="text-sm text-slate-500">{selected?.mobile || "No mobile"}</p>
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
