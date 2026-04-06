"use client";

import { useParams, useRouter } from "next/navigation";
import { useApplication, useUpdateApplicationStatus } from "@/hooks/useApplications";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ScoreBar from "@/components/landlord/ScoreBar";
import { formatDate } from "@/lib/utils";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: application, isLoading } = useApplication(id);
  const updateStatus = useUpdateApplicationStatus(id);

  const handleDecision = async (status: "APPROVED" | "REJECTED") => {
    await updateStatus.mutateAsync({ status });
  };

  if (isLoading || !application) return <LoadingSpinner className="mt-20" />;

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        &larr; Back
      </button>

      <div className="mt-4 rounded-lg border bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Application Detail</h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              application.status === "APPROVED"
                ? "bg-green-100 text-green-800"
                : application.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {application.status}
          </span>
        </div>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Submitted</span>
              <p className="font-medium">{formatDate(application.submitted_at)}</p>
            </div>
            {application.screened_at && (
              <div>
                <span className="text-gray-500">Screened</span>
                <p className="font-medium">{formatDate(application.screened_at)}</p>
              </div>
            )}
            {application.decided_at && (
              <div>
                <span className="text-gray-500">Decision Date</span>
                <p className="font-medium">{formatDate(application.decided_at)}</p>
              </div>
            )}
          </div>

          <div>
            <span className="text-sm text-gray-500">Qualification Score</span>
            <div className="mt-1">
              <ScoreBar score={application.qualification_score} />
            </div>
          </div>

          {application.screening_report_url && (
            <div>
              <a
                href={application.screening_report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View Screening Report
              </a>
            </div>
          )}

          {application.score_explanation && (
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Score Explanation</p>
              <p className="mt-1 text-sm text-gray-600">{application.score_explanation}</p>
            </div>
          )}
        </div>

        {application.status === "SCORED" && (
          <div className="mt-6 flex gap-3 border-t pt-6">
            <button
              onClick={() => handleDecision("APPROVED")}
              disabled={updateStatus.isPending}
              className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Approve
            </button>
            <button
              onClick={() => handleDecision("REJECTED")}
              disabled={updateStatus.isPending}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
