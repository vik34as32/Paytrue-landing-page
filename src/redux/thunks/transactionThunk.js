import { createAsyncThunk } from "@reduxjs/toolkit";
import { mdTransactions, ddTransactions } from "@/src/mock/transactionData";
import {
  delay,
  generateId,
  generateTransactionId,
} from "@/src/redux/utils";
import { debitMdWallet, debitDdWallet } from "@/src/redux/slices/walletSlice";
import { setDistributorList } from "@/src/redux/slices/distributorSlice";
import { setRetailerList } from "@/src/redux/slices/retailerSlice";
import { updateMdWalletBalance, updateDdWalletBalance } from "@/src/redux/slices/dashboardSlice";

export const fetchMdTransactions = createAsyncThunk(
  "transaction/fetchMd",
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      // Future API: return (await api.get("/md/transactions")).data;
      return [...mdTransactions];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch transactions");
    }
  }
);

export const fetchDdTransactions = createAsyncThunk(
  "transaction/fetchDd",
  async (_, { rejectWithValue }) => {
    try {
      await delay();
      // Future API: return (await api.get("/dd/transactions")).data;
      return [...ddTransactions];
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch transactions");
    }
  }
);

export const transferBalanceToDistributor = createAsyncThunk(
  "transaction/transferToDistributor",
  async ({ distributorId, amount, remark }, { getState, dispatch, rejectWithValue }) => {
    try {
      await delay(700);

      const distributor = getState().distributor.list.find(
        (d) => d.id === distributorId
      );
      if (!distributor) return rejectWithValue("Distributor not found");
      if (distributor.status !== "active") {
        return rejectWithValue("Cannot transfer to inactive distributor");
      }
      if (!amount || amount <= 0) {
        return rejectWithValue("Enter a valid amount");
      }

      const openingBalance = getState().wallet.md.balance;
      if (openingBalance < amount) {
        return rejectWithValue("Insufficient wallet balance");
      }

      // Future API:
      // const response = await api.post("/md/balance-transfer", { distributorId, amount, remark });
      // return response.data;

      const closingBalance = openingBalance - amount;
      dispatch(debitMdWallet(amount));
      dispatch(updateMdWalletBalance(closingBalance));

      const updatedDistributors = getState().distributor.list.map((d) =>
        d.id === distributorId
          ? { ...d, walletBalance: d.walletBalance + amount }
          : d
      );
      dispatch(setDistributorList(updatedDistributors));

      return {
        id: generateId("txn_md"),
        transactionId: generateTransactionId("TXNMD"),
        transactionType: "Balance Transfer",
        distributorId,
        distributorName: distributor.name,
        amount,
        openingBalance,
        closingBalance,
        status: "success",
        dateTime: new Date().toISOString(),
        remark: remark || "Balance transfer to distributor",
      };
    } catch (error) {
      return rejectWithValue(error.message || "Transfer failed");
    }
  }
);

export const transferBalanceToRetailer = createAsyncThunk(
  "transaction/transferToRetailer",
  async (
    { retailerId, amount, remark, type = "Balance Transfer" },
    { getState, dispatch, rejectWithValue }
  ) => {
    try {
      await delay(700);

      const retailer = getState().retailer.list.find((r) => r.id === retailerId);
      if (!retailer) return rejectWithValue("Retailer not found");
      if (retailer.status !== "active" && type === "Balance Transfer") {
        return rejectWithValue("Cannot transfer to inactive retailer");
      }
      if (!amount || amount <= 0) {
        return rejectWithValue("Enter a valid amount");
      }

      const openingBalance = getState().wallet.dd.balance;
      if (openingBalance < amount) {
        return rejectWithValue("Insufficient wallet balance");
      }

      // Future API:
      // const response = await api.post("/dd/balance-transfer", { retailerId, amount, remark });
      // return response.data;

      const closingBalance = openingBalance - amount;
      dispatch(debitDdWallet(amount));
      dispatch(updateDdWalletBalance(closingBalance));

      const updatedRetailers = getState().retailer.list.map((r) =>
        r.id === retailerId
          ? { ...r, walletBalance: r.walletBalance + amount }
          : r
      );
      dispatch(setRetailerList(updatedRetailers));

      return {
        id: generateId("txn_dd"),
        transactionId: generateTransactionId("TXNDD"),
        transactionType: type,
        retailerId,
        retailerName: retailer.name,
        amount,
        openingBalance,
        closingBalance,
        status: "success",
        dateTime: new Date().toISOString(),
        remark: remark || "Balance transfer to retailer",
      };
    } catch (error) {
      return rejectWithValue(error.message || "Transfer failed");
    }
  }
);
