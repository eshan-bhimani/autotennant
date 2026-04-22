"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTenantApplications } from "@/hooks/useTenantApplications";
import { SkeletonStatGrid } from "@/components/shared/Skeleton";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function TenantDashboardPage() {
  const { data, isLoading } = useTenantApplications();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setUserName((user.full_name || user.email || "").split(" ")[0]);
    }
  }, []);

  const applications = data?.items ?? [];
  const pending = applications.filter((a) => !["APPROVED", "REJECTED"].includes(a.status)).length;
  const approved = applications.filter((a) => a.status === "APPROVED").length;

  const stats = [
    {
      label: "Applications Submitted",
      value: applications.length,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      accent: "from-primary to-blue-600",
      featured: true,
    },
    {
      label: "In Progress",
      value: pending,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: "from-amber-500 to-orange-600",
      featured: false,
    },
    {
      label: "Approved",
      value: approved,
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: "from-emerald-500 to-green-600",
      featured: false,
    },
    {
      label: "Avg Response Time",
      value: "\u2013",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
      accent: "from-violet-500 to-purple-600",
      featured: false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* Welcome banner */}
      <motion.div
        className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white sm:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 -right-20 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h1 className="text-[28px] font-bold">
            {getGreeting()}{userName ? `, ${userName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Track your applications and find your next home.
            {pending > 0 ? ` You have ${pending} application${pending > 1 ? "s" : ""} in progress.` : ""}
          </p>
        </div>
        <div className="relative z-10 mt-4 flex gap-3">
          <Link
            href="/tenant/search"
            className="inline-flex items-center gap-2 rounded-btn bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Search Properties
          </Link>
          <Link
            href="/tenant/applications"
            className="inline-flex items-center gap-2 rounded-btn bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20"
          >
            My Applications
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="mt-8"><SkeletonStatGrid count={4} /></div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className={`relative overflow-hidden rounded-[20px] p-6 ${
                stat.featured
                  ? "bg-gradient-to-br " + stat.accent + " text-white shadow-glow"
                  : "glass-accent shadow-glass"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              {stat.featured && (
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              )}
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                stat.featured
                  ? "bg-white/20 text-white"
                  : "bg-gradient-to-br " + stat.accent + " text-white"
              }`}>
                {stat.icon}
              </div>
              <p className={`mt-4 text-[13px] font-medium ${stat.featured ? "text-white/70" : "text-text-secondary"}`}>
                {stat.label}
              </p>
              <p className={`mt-1 text-[32px] font-bold leading-none ${stat.featured ? "text-white" : "text-text-primary"}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Browse Listings",
            desc: "Find your next home",
            href: "/tenant/search",
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            ),
            color: "text-primary bg-primary/10",
          },
          {
            title: "My Applications",
            desc: `${pending} in progress`,
            href: "/tenant/applications",
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
              </svg>
            ),
            color: "text-violet-600 bg-violet-100",
          },
          {
            title: "My Leases",
            desc: "View signed agreements",
            href: "/tenant/leases",
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            ),
            color: "text-emerald-600 bg-emerald-100",
          },
        ].map((action, i) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.08, duration: 0.5, ease }}
          >
            <Link
              href={action.href}
              className="group glass flex items-center gap-4 rounded-[20px] p-5 transition-all hover:border-primary/30 hover:shadow-card-hover"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${action.color}`}>
                {action.icon}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary group-hover:text-primary">{action.title}</p>
                <p className="text-sm text-text-secondary">{action.desc}</p>
              </div>
              <svg className="ml-auto h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent applications */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Recent Applications</h2>
        {applications.length === 0 ? (
          <motion.div
            className="mt-4 rounded-[20px] border border-dashed border-border-light bg-gradient-to-br from-white to-card-light p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-text-primary">No applications yet</p>
            <p className="mt-1 text-sm text-text-secondary">Start by searching for properties to apply to.</p>
            <Link
              href="/tenant/search"
              className="mt-4 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Browse listings
            </Link>
          </motion.div>
        ) : (
          <div className="mt-4 space-y-3">
            {applications.slice(0, 5).map((app, i) => (
              <motion.div
                key={app.id}
                className="glass flex items-center justify-between rounded-panel p-4 transition-all hover:shadow-card-hover"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease }}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                    app.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : app.status === "REJECTED"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-primary/10 text-primary"
                  }`}>
                    {app.status === "APPROVED" ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : app.status === "REJECTED" ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Application #{app.id.slice(0, 8)}</p>
                    <p className="text-xs text-text-muted">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    app.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-700"
                      : app.status === "REJECTED"
                        ? "bg-red-500/10 text-red-700"
                        : "bg-primary/10 text-primary"
                  }`}
                >
                  {app.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
