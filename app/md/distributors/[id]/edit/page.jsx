"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import DistributorMultiStepForm from "@/src/components/distributors/DistributorMultiStepForm";
import { fetchDistributors } from "@/src/redux/thunks/distributorThunk";
import { selectDistributors, selectDistributorLoading } from "@/src/redux/slices/distributorSlice";

export default function MdEditDistributorPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const distributors = useSelector(selectDistributors);
  const loading = useSelector(selectDistributorLoading);
  const distributor = distributors.find((item) => item.id === params.id);

  useEffect(() => {
    dispatch(fetchDistributors({ page: 1, limit: 100 }));
  }, [dispatch]);

  if (loading && !distributor) {
    return <p className="py-12 text-center text-sm text-slate-500">Loading...</p>;
  }

  if (!distributor) {
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
