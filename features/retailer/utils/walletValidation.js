import { toast } from "sonner";
import { useWalletStore } from "@/features/retailer/store/walletStore";
import { store } from "@/src/redux/store";
import {
  fetchWalletBalance,
  fetchTransferHistory,
} from "@/src/redux/thunks/walletThunk";

export const INSUFFICIENT_BALANCE_MESSAGE =
  "Insufficient Wallet Balance. Please add balance before proceeding.";

export function getRetailerEffectiveBalance() {
  const state = useWalletStore.getState();
  if (state.apiRetailerBalance !== null) return state.apiRetailerBalance;
  return 0;
}

export function validateRetailerWalletBalance(amount) {
  const balance = getRetailerEffectiveBalance();
  if (amount <= 0 || balance < amount) {
    toast.error(INSUFFICIENT_BALANCE_MESSAGE);
    return false;
  }
  return true;
}

export function refreshRetailerWalletData() {
  store.dispatch(fetchWalletBalance({ role: "rt" }));
  store.dispatch(fetchTransferHistory({ page: 1, limit: 10 }));
}
