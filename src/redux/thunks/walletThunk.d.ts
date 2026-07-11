import type { AsyncThunk } from "@reduxjs/toolkit";

export declare const fetchWalletBalance: AsyncThunk<
  unknown,
  { role: string },
  { rejectValue: string }
>;

export declare const fetchTransferHistory: AsyncThunk<
  unknown,
  {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    dateFrom?: string;
    dateTo?: string;
  } | void,
  { rejectValue: string }
>;

export declare const refreshWalletBalance: AsyncThunk<
  unknown,
  string | undefined,
  { rejectValue: string }
>;

export declare const transferWalletBalance: AsyncThunk<
  unknown,
  {
    receiverId: string;
    amount: number;
    description?: string;
    role: string;
  },
  { rejectValue: string }
>;

export declare const deductWalletBalance: AsyncThunk<
  unknown,
  {
    userId: string;
    amount: number;
    description?: string;
    role: string;
  },
  { rejectValue: string }
>;
