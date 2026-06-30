"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import RetailerMultiStepForm from "@/src/components/retailers/RetailerMultiStepForm";
import { fetchRetailers } from "@/src/redux/thunks/retailerThunk";
import { selectRetailers, selectRetailerLoading } from "@/src/redux/slices/retailerSlice";

export default function DdEditRetailerPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const retailers = useSelector(selectRetailers);
  const loading = useSelector(selectRetailerLoading);
  const retailer = retailers.find((item) => item.id === params.id);

  useEffect(() => {
    dispatch(fetchRetailers({ page: 1, limit: 100 }));
  }, [dispatch]);

  if (loading && !retailer) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading...</p>;
  }

  if (!retailer) {
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
