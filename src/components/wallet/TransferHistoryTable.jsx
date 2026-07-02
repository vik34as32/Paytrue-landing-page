"use client";



import { memo, useCallback, useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { Download, Search } from "lucide-react";

import ServerDataTable from "@/src/components/common/ServerDataTable";

import NoDataIllustration from "@/src/components/common/NoDataIllustration";

import StatusBadge from "@/src/components/common/StatusBadge";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from "@/components/ui/card";

import { formatCurrency } from "@/lib/utils";

import { useDebounce } from "@/src/hooks/useDebounce";

import { exportToCsv } from "@/src/lib/exportUtils";

import { fetchTransferHistory } from "@/src/redux/thunks/walletThunk";

import {

  selectTransferHistory,

  setTransferHistoryQuery,

} from "@/src/redux/slices/walletSlice";



const EXPORT_COLUMNS = [

  { key: "transactionId", label: "Transaction ID" },

  {

    key: "date",

    label: "Date",

    selector: (row) =>

      row.date ? new Date(row.date).toLocaleString("en-IN") : "",

  },

  { key: "transactionType", label: "Transaction Type" },

  { key: "sender", label: "Sender" },

  { key: "receiver", label: "Receiver" },

  { key: "description", label: "Description" },

  { key: "credit", label: "Credit" },

  { key: "debit", label: "Debit" },

  { key: "openingBalance", label: "Opening Balance" },

  { key: "closingBalance", label: "Closing Balance" },

  { key: "status", label: "Status" },

];



function TransferHistoryTable({

  variant = "compact",

  title = "Transfer History",

  description,

}) {

  const dispatch = useDispatch();

  const history = useSelector(selectTransferHistory);

  const [search, setSearch] = useState(history.search || "");

  const [dateFrom, setDateFrom] = useState(history.dateFrom || "");

  const [dateTo, setDateTo] = useState(history.dateTo || "");

  const debouncedSearch = useDebounce(search, 400);

  const isFull = variant === "full";



  const loadHistory = useCallback(

    (overrides = {}) => {

      dispatch(

        fetchTransferHistory({

          page: overrides.page ?? history.page,

          limit: overrides.limit ?? history.limit,

          search: overrides.search ?? debouncedSearch,

          sortBy: overrides.sortBy ?? history.sortBy,

          sortOrder: overrides.sortOrder ?? history.sortOrder,

          dateFrom: overrides.dateFrom ?? dateFrom,

          dateTo: overrides.dateTo ?? dateTo,

        })

      );

    },

    [

      dispatch,

      history.page,

      history.limit,

      history.sortBy,

      history.sortOrder,

      debouncedSearch,

      dateFrom,

      dateTo,

    ]

  );



  useEffect(() => {

    loadHistory({ page: 1, search: debouncedSearch });

    dispatch(setTransferHistoryQuery({ page: 1, search: debouncedSearch }));

  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps



  useEffect(() => {

    loadHistory({ page: 1 });

  }, [dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps



  const columns = useMemo(() => {

    if (isFull) {

      return [

        {

          name: "Date & Time",

          selector: (row) => row.date,

          sortable: true,

          sortField: "createdAt",

          minWidth: "170px",

          cell: (row) =>

            row.date ? new Date(row.date).toLocaleString("en-IN") : "—",

        },

        {

          name: "Transaction ID",

          selector: (row) => row.transactionId,

          sortable: true,

          sortField: "transactionId",

          minWidth: "140px",

        },

        {

          name: "Transaction Type",

          selector: (row) => row.transactionType,

          sortable: true,

          sortField: "transactionType",

          minWidth: "140px",

        },

        { name: "Sender", selector: (row) => row.sender, minWidth: "120px" },

        { name: "Receiver", selector: (row) => row.receiver, minWidth: "120px" },

        {

          name: "Description",

          selector: (row) => row.description || row.remark,

          minWidth: "160px",

          wrap: true,

        },

        {

          name: "Credit",

          selector: (row) => row.credit,

          sortable: true,

          sortField: "credit",

          cell: (row) =>

            row.credit > 0 ? (

              <span className="font-semibold text-emerald-600">

                {formatCurrency(row.credit)}

              </span>

            ) : (

              "—"

            ),

        },

        {

          name: "Debit",

          selector: (row) => row.debit,

          sortable: true,

          sortField: "debit",

          cell: (row) =>

            row.debit > 0 ? (

              <span className="font-semibold text-red-600">

                {formatCurrency(row.debit)}

              </span>

            ) : (

              "—"

            ),

        },

        {

          name: "Opening Balance",

          selector: (row) => row.openingBalance,

          cell: (row) => formatCurrency(row.openingBalance),

        },

        {

          name: "Closing Balance",

          selector: (row) => row.closingBalance,

          cell: (row) => formatCurrency(row.closingBalance),

        },

        {

          name: "Status",

          cell: (row) => <StatusBadge status={row.status} />,

        },

      ];

    }



    return [

      {

        name: "Transaction ID",

        selector: (row) => row.transactionId,

        sortable: true,

        sortField: "transactionId",

        minWidth: "140px",

      },

      {

        name: "Date",

        selector: (row) => row.date,

        sortable: true,

        sortField: "createdAt",

        minWidth: "160px",

        cell: (row) =>

          row.date ? new Date(row.date).toLocaleString("en-IN") : "—",

      },

      { name: "Sender", selector: (row) => row.sender, minWidth: "120px" },

      { name: "Receiver", selector: (row) => row.receiver, minWidth: "120px" },

      { name: "User Type", selector: (row) => row.userType, minWidth: "110px" },

      {

        name: "Amount",

        selector: (row) => row.amount,

        sortable: true,

        sortField: "amount",

        cell: (row) => (

          <span className="font-semibold text-[#1565d8]">

            {formatCurrency(row.amount)}

          </span>

        ),

      },

      {

        name: "Opening",

        selector: (row) => row.openingBalance,

        cell: (row) => formatCurrency(row.openingBalance),

      },

      {

        name: "Closing",

        selector: (row) => row.closingBalance,

        cell: (row) => formatCurrency(row.closingBalance),

      },

      {

        name: "Status",

        cell: (row) => <StatusBadge status={row.status} />,

      },

      {

        name: "Remark",

        selector: (row) => row.remark,

        minWidth: "140px",

        wrap: true,

      },

    ];

  }, [isFull]);



  const emptyDescription = isFull

    ? "Your wallet transaction history will appear here."

    : "Your wallet transfer records will appear here.";



  return (

    <Card>

      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <CardTitle>{title}</CardTitle>

          <CardDescription>

            {description ?? `${history.total} transaction records`}

          </CardDescription>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input

              placeholder="Search transactions..."

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              className="w-full pl-9 sm:w-52"

            />

          </div>

          <Input

            type="date"

            value={dateFrom}

            onChange={(e) => setDateFrom(e.target.value)}

            className="w-full sm:w-40"

            aria-label="From date"

          />

          <Input

            type="date"

            value={dateTo}

            onChange={(e) => setDateTo(e.target.value)}

            className="w-full sm:w-40"

            aria-label="To date"

          />

          <Button

            type="button"

            variant="outline"

            size="sm"

            onClick={() =>

              exportToCsv(

                isFull ? "wallet-history.csv" : "wallet-transfers.csv",

                history.list,

                EXPORT_COLUMNS

              )

            }

            disabled={!history.list.length}

          >

            <Download className="h-4 w-4" />

            Export

          </Button>

        </div>

      </CardHeader>

      <CardContent>

        {history.error && (

          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">

            {history.error}

          </p>

        )}

        <div className="overflow-x-auto">

          <ServerDataTable

            columns={columns}

            data={history.list}

            loading={history.loading}

            totalRows={history.total}

            paginationPerPage={history.limit}

            paginationDefaultPage={history.page}

            onChangePage={(page) => {

              dispatch(setTransferHistoryQuery({ page }));

              loadHistory({ page });

            }}

            onChangeRowsPerPage={(limit, page) => {

              dispatch(setTransferHistoryQuery({ page, limit }));

              loadHistory({ page, limit });

            }}

            onSort={(column, direction) => {

              const sortBy = column.sortField || "createdAt";

              dispatch(

                setTransferHistoryQuery({

                  sortBy,

                  sortOrder: direction,

                })

              );

              loadHistory({ sortBy, sortOrder: direction });

            }}

            noDataComponent={

              <NoDataIllustration

                title={isFull ? "No wallet history" : "No transfer history"}

                description={emptyDescription}

              />

            }

          />

        </div>

      </CardContent>

    </Card>

  );

}



export default memo(TransferHistoryTable);

