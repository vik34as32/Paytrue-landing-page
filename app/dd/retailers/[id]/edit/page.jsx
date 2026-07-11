"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import RetailerMultiStepForm from "@/src/components/retailers/RetailerMultiStepForm";
import { fetchRetailerById } from "@/src/redux/thunks/retailerThunk";
import {
  selectSelectedRetailer,
  selectRetailerDetailLoading,
} from "@/src/redux/slices/retailerSlice";

export default function DdEditRetailerPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const retailer = useSelector(selectSelectedRetailer);
  const loading = useSelector(selectRetailerDetailLoading);
  const retailerId = String(params.id || "");

  useEffect(() => {
    if (retailerId) {
      dispatch(fetchRetailerById(retailerId));
    }
  }, [dispatch, retailerId]);

  if (loading && !retailer) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading retailer...</p>;
  }

  if (!retailer || String(retailer.id) !== retailerId) {
    return <p className="py-12 text-center text-sm text-slate-500">Retailer not found</p>;
  }

  return (
    <RetailerMultiStepForm
      mode="edit"
      userId={retailer.id}
      initialUser={retailer.raw || retailer}
    />
  );
}
