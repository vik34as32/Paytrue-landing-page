"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import DistributorMultiStepForm from "@/src/components/distributors/DistributorMultiStepForm";
import { fetchDistributorById } from "@/src/redux/thunks/distributorThunk";
import {
  selectSelectedDistributor,
  selectDistributorDetailLoading,
} from "@/src/redux/slices/distributorSlice";

export default function MdEditDistributorPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const distributor = useSelector(selectSelectedDistributor);
  const loading = useSelector(selectDistributorDetailLoading);
  const distributorId = String(params.id || "");

  useEffect(() => {
    if (distributorId) {
      dispatch(fetchDistributorById(distributorId));
    }
  }, [dispatch, distributorId]);

  if (loading && !distributor) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading distributor...</p>;
  }

  if (!distributor || String(distributor.id) !== distributorId) {
    return <p className="py-12 text-center text-sm text-slate-500">Distributor not found</p>;
  }

  return (
    <DistributorMultiStepForm
      mode="edit"
      userId={distributor.id}
      initialUser={distributor.raw || distributor}
    />
  );
}
