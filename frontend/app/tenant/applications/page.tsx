"use client";

import { motion } from "framer-motion";
import { useTenantApplications } from "@/hooks/useTenantApplications";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const ease = [0.22, 1, 0.36, 1] as const;

const stages = ["SUBMITTED", "SCREENING", "SCORED", "APPROVED"] as const;
const stageLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  SCREENING: "Screening",
  SCORED: "Scored",
  APPROVED: "Decision",
};

function ProgressStepper({ status }: { status: string }) {
  const currentIdx = stages.indexOf(status as (typeof stages)[number]);
  const isRejected = status === "REJECTED";

  return (
    <div className="flex items-center gap-1">
      {stages.map((stage, i) => {
        const isCompleted = currentIdx > i;
        const isCurrent = currentIdx === i || (isRejected && i === stages.length - 1);

        return (
          <div key={stage} className="flex items-center gap-1">
            <div className="flex flex-col items-center">
              <div className="relative">
                {isCompleted ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  <div className="relative flex h-7 w-7 items-center justify-center">
                    <motion.div
                      className={`absolute inset-0 rounded-full ${isRejected ? "border-2 border-red-400" : "border-2 border-primary"}`}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                    <div className={`h-3 w-3 rounded-full ${isRejected ? "bg-red-400" : "bg-primary"}`} />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white" />
                )}
              </div>
              <span className="mt-1 text-[10px] text-text-muted">{stageLabels[stage]}</span>
            </div>
            {i < stages.length - 1 && (
              <div className={`mb-4 h-0.5 w-6 ${isCompleted ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TenantApplicationsPage() {
  const { data, isLoading } = useTenantApplications();

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  const applications = data?.items ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <h1 className="text-2xl font-bold text-text-primary">My Applications</h1>

      {applications.length === 0 ? (
        <div className="mt-6 rounded-[20px] border border-dashed border-border-light bg-white p-12 text-center">
          <p className="text-text-secondary">No applications submitted yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {applications.map((app) => (
            <motion.div
              key={app.id}
              className="rounded-[20px] border border-border-light bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    Application #{app.id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Submitted {new Date(app.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-chip px-3 py-1 text-xs font-semibold ${
                    app.status === "APPROVED"
                      ? "bg-green-500/10 text-green-700"
                      : app.status === "REJECTED"
                        ? "bg-red-500/10 text-red-700"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {app.status}
                </span>
              </div>
              <div className="mt-5">
                <ProgressStepper status={app.status} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
