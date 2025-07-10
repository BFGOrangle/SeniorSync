"use client";

import { useParams } from "next/navigation";
import { RequestDetailsPage } from "@/components/request-details-page";

export default function StaffRequestDetailsPage() {
  const params = useParams();
  const requestId = parseInt(params.id as string);

  return <RequestDetailsPage requestId={requestId} />;
}