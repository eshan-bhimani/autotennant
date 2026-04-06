"use client";

import Link from "next/link";
import type { ApplicationResponse } from "@/types/api";
import ScoreBar from "@/components/landlord/ScoreBar";
import { formatDate } from "@/lib/utils";

interface ApplicationCardProps {
  application: ApplicationResponse;
}

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  SCORED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

export default function ApplicationCard({ application }: ApplicationCardProps) {
  return (
    <Link
      href={`/applications/${application.id}`}
      className="block rounded-lg border bg-white p-4 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
              statusColors[application.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {application.status}
          </span>
          <p className="mt-1 text-sm text-gray-500">
            Applied {formatDate(application.submitted_at)}
          </p>
        </div>
        <ScoreBar score={application.qualification_score} />
      </div>
    </Link>
  );
}
