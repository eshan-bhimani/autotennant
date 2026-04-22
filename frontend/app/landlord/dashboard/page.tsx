"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useProperties } from "@/hooks/useProperties";
import { SkeletonStatGrid, SkeletonCardGrid } from "@/components/shared/Skeleton";
import { formatCurrency } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Mini inline sparkline SVG */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data, isLoading } = useProperties();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      const first = (user.full_name || user.email || "").split(" ")[0];
      setUserName(first);
    }
  }, []);

  const properties = data?.items ?? [];
  const totalApplications = properties.reduce((sum, p) => sum + p.application_count, 0);
  const listedCount = properties.filter((p) => p.status === "LISTED").length;
  const occupiedCount = properties.filter((p) => p.status === "OCCUPIED").length;

  const stats = [
    {
      label: "Total Properties",
      value: properties.length,
      sparkData: [2, 4, 3, 6, 5, 8, properties.length || 7],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      accent: "from-primary to-blue-600",
      sparkColor: "rgba(255,255,255,0.5)",
      featured: true,
    },
    {
      label: "Active Applications",
      value: totalApplications,
      sparkData: [5, 12, 8, 15, 10, 18, totalApplications || 14],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      accent: "from-violet-500 to-purple-600",
      sparkColor: "#8B5CF6",
      featured: false,
    },
    {
      label: "Listed",
      value: listedCount,
      sparkData: [1, 3, 2, 4, 3, 5, listedCount || 4],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
      ),
      accent: "from-emerald-500 to-green-600",
      sparkColor: "#10B981",
      featured: false,
    },
    {
      label: "Occupied",
      value: occupiedCount,
      sparkData: [0, 1, 1, 2, 2, 3, occupiedCount || 3],
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      accent: "from-amber-500 to-orange-600",
      sparkColor: "#F59E0B",
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
        className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-primary to-violet-600 p-6 text-white sm:p-8"
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
            Here&apos;s your portfolio overview.
            {properties.length > 0
              ? ` You have ${listedCount} listed and ${occupiedCount} occupied properties.`
              : " Add your first property to get started."}
          </p>
        </div>
        <div className="relative z-10 mt-4 flex gap-3">
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-2 rounded-btn bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Manage Properties
          </Link>
          <Link
            href="/landlord/applications"
            className="inline-flex items-center gap-2 rounded-btn bg-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/20"
          >
            View Applications
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="mt-8">
          <SkeletonStatGrid count={4} />
        </div>
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
              <div className="flex items-end justify-between">
                <p className={`mt-1 text-[32px] font-bold leading-none ${stat.featured ? "text-white" : "text-text-primary"}`}>
                  {stat.value}
                </p>
                <Sparkline data={stat.sparkData} color={stat.sparkColor} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "Add Property",
            desc: "List a new rental property",
            href: "/landlord/properties",
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            ),
            color: "text-primary bg-primary/10",
          },
          {
            title: "Review Applications",
            desc: `${totalApplications} pending review`,
            href: "/landlord/applications",
            icon: (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
              </svg>
            ),
            color: "text-violet-600 bg-violet-100",
          },
          {
            title: "View Leases",
            desc: "Manage active agreements",
            href: "/landlord/leases",
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

      {/* Properties section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text-primary">Your Properties</h2>
        {isLoading ? (
          <div className="mt-4"><SkeletonCardGrid count={3} /></div>
        ) : properties.length === 0 ? (
          <motion.div
            className="mt-4 rounded-[20px] border border-dashed border-border-light bg-gradient-to-br from-white to-card-light p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <p className="mt-4 text-base font-medium text-text-primary">No properties yet</p>
            <p className="mt-1 text-sm text-text-secondary">Add your first property to get started.</p>
            <Link
              href="/landlord/properties"
              className="mt-4 inline-flex items-center gap-2 rounded-btn bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(79,124,232,0.30)] transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Add property
            </Link>
          </motion.div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.id}
                className="group glass overflow-hidden rounded-[20px] transition-all hover:shadow-card-hover"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
              >
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-card-light to-white">
                  <svg className="h-12 w-12 text-text-muted/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <Link href={`/landlord/properties/${prop.id}`} className="font-semibold text-text-primary group-hover:text-primary">
                      {prop.address_line1}
                    </Link>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        prop.status === "LISTED"
                          ? "bg-primary/10 text-primary"
                          : prop.status === "OCCUPIED"
                            ? "bg-emerald-500/10 text-emerald-700"
                            : "bg-amber-500/10 text-amber-700"
                      }`}
                    >
                      {prop.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{prop.city}, {prop.state}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border-light pt-4">
                    <span className="text-base font-semibold text-text-primary">
                      {prop.monthly_rent !== null ? formatCurrency(prop.monthly_rent) : "\u2013"}
                      <span className="text-sm font-normal text-text-muted">/mo</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm text-text-secondary">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {prop.application_count} apps
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
