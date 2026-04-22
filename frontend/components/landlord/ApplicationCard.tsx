"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ApplicationResponse } from "@/types/api";
import ScoreBar from "@/components/landlord/ScoreBar";
import { formatDate } from "@/lib/utils";
import { durations, easings } from "@/lib/design-tokens";

interface ApplicationCardProps {
  application: ApplicationResponse;
}

const statusStyles: Record<string, string> = {
  SUBMITTED: "bg-primary-soft text-primary",
  SCREENING: "bg-amber-100/70 text-amber-700",
  SCORED: "bg-violet-100/70 text-violet-700",
  APPROVED: "bg-emerald-100/70 text-emerald-700",
  REJECTED: "bg-rose-100/70 text-rose-700",
  WITHDRAWN: "bg-card-light text-text-secondary",
};

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const chip = statusStyles[application.status] ?? statusStyles.WITHDRAWN;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: durations.base, ease: easings.standard }}
    >
      <Link
        href={`/applications/${application.id}`}
        className="group block rounded-panel border border-border-light bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${chip}`}
            >
              {application.status}
            </span>
            <p className="mt-2 text-sm text-text-secondary">
              Applied {formatDate(application.submitted_at)}
            </p>
          </div>
          <ArrowUpRight
            size={16}
            className="shrink-0 text-text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          />
        </div>
        <div className="mt-4">
          <ScoreBar score={application.qualification_score} />
        </div>
      </Link>
    </motion.div>
  );
}
