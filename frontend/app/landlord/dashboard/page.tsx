"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { formatCurrency } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export default function DashboardPage() {
  const { data, isLoading } = useProperties();

  if (isLoading) return <LoadingSpinner className="mt-20" />;

  const properties = data?.items ?? [];
  const totalApplications = properties.reduce((sum, p) => sum + p.application_count, 0);

  const stats = [
    { label: "Total Properties", value: properties.length, featured: true },
    { label: "Active Applications", value: totalApplications, featured: false },
    { label: "Avg. Qualification Score", value: "\u2013", featured: false },
    { label: "Vacancy Days Saved", value: "\u2013", featured: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <Link
          href="/landlord/properties"
          className="rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Manage Properties
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`rounded-[20px] p-6 ${
              stat.featured
                ? "bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                : "border border-border-light bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            }`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease }}
          >
            <p className={`text-[13px] ${stat.featured ? "text-white/70" : "text-text-secondary"}`}>
              {stat.label}
            </p>
            <p className={`mt-1 text-[28px] font-bold ${stat.featured ? "text-white" : "text-text-primary"}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <h2 className="mt-8 text-lg font-semibold text-text-primary">Your Properties</h2>
      {properties.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-dashed border-border-light bg-white p-12 text-center">
          <p className="text-text-secondary">No properties yet.</p>
          <Link
            href="/landlord/properties"
            className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop) => (
            <motion.div
              key={prop.id}
              className="overflow-hidden rounded-card bg-card-light shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex h-36 items-center justify-center bg-white/60">
                <svg className="h-10 w-10 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="p-4">
                <Link href={`/landlord/properties/${prop.id}`} className="font-semibold text-text-primary hover:text-primary">
                  {prop.address_line1}
                </Link>
                <p className="mt-0.5 text-sm text-text-muted">{prop.city}, {prop.state}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-primary">
                    {prop.monthly_rent !== null ? formatCurrency(prop.monthly_rent) : "\u2013"}
                    <span className="font-normal text-text-muted">/mo</span>
                  </span>
                  <span
                    className={`rounded-chip px-2.5 py-0.5 text-xs font-semibold ${
                      prop.status === "LISTED"
                        ? "bg-[#EFF6FF] text-primary"
                        : prop.status === "OCCUPIED"
                          ? "bg-[#F0FDF4] text-[#166534]"
                          : "bg-[#FEF9C3] text-[#854D0E]"
                    }`}
                  >
                    {prop.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
