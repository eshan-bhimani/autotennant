"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const ease = [0.22, 1, 0.36, 1] as const;

const stats = [
  { label: "Applications Submitted", value: 0 },
  { label: "Viewings Scheduled", value: 0 },
  { label: "Properties Saved", value: 0 },
  { label: "Avg Response Time", value: "–" },
];

export default function TenantDashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <Link
          href="/tenant/search"
          className="rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Search Properties
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[20px] border border-border-light bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[13px] text-text-secondary">{stat.label}</p>
            <p className="mt-1 text-[28px] font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[20px] border border-dashed border-border-light bg-white p-12 text-center">
        <p className="text-text-secondary">Start by searching for properties to apply to.</p>
        <Link
          href="/tenant/search"
          className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
        >
          Browse listings
        </Link>
      </div>
    </motion.div>
  );
}
