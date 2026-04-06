"use client";

import { useTenantApplications } from "@/hooks/useTenantApplications";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatDate } from "@/lib/utils";

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  SCORED: "bg-purple-100 text-purple-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  WITHDRAWN: "bg-gray-100 text-gray-800",
};

export default function TenantApplicationsPage() {
  const { data, isLoading } = useTenantApplications();

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  const applications = data?.items ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed bg-white p-12 text-center">
          <p className="text-gray-500">No applications yet.</p>
          <a
            href="/search"
            className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Search for properties
          </a>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="rounded-lg border bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Applied {formatDate(app.submitted_at)}
                  </p>
                  <p className="text-xs text-gray-400">Property: {app.property_id}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    statusColors[app.status] ?? "bg-gray-100 text-gray-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>

              {app.qualification_score !== null && (
                <div className="mt-3">
                  <span className="text-sm text-gray-500">Score: </span>
                  <span className="text-sm font-semibold">{app.qualification_score}/100</span>
                </div>
              )}

              {app.status === "APPROVED" && (
                <p className="mt-3 text-sm font-medium text-green-700">
                  Congratulations! Your application has been approved.
                </p>
              )}
              {app.status === "REJECTED" && (
                <p className="mt-3 text-sm text-red-600">
                  Your application was not approved for this property.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
