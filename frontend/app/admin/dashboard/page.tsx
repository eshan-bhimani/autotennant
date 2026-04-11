"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Building2,
  FileText,
  ScrollText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import { useAdminActivity, useAdminStats } from "@/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function StatCard({
  label,
  value,
  sublabel,
  icon,
  featured = false,
  gradient,
  delay = 0,
}: {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  featured?: boolean;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease }}
      whileHover={{ y: -3 }}
      className={`relative overflow-hidden rounded-[20px] border p-6 ${
        featured
          ? `border-white/10 bg-gradient-to-br ${gradient}`
          : "border-white/10 bg-white/[0.04] backdrop-blur-xl"
      }`}
    >
      {featured && (
        <>
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/5" />
        </>
      )}
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${
          featured ? "bg-white/20" : `bg-gradient-to-br ${gradient}`
        }`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <p className={`relative mt-4 text-[12px] font-medium uppercase tracking-wider ${featured ? "text-white/70" : "text-white/50"}`}>
        {label}
      </p>
      <p className={`relative mt-1 text-[30px] font-bold leading-none ${featured ? "text-white" : "text-white"}`}>
        {value}
      </p>
      {sublabel && (
        <p className={`relative mt-2 text-[11px] ${featured ? "text-white/60" : "text-white/40"}`}>
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats } = useAdminStats();
  const { data: activity } = useAdminActivity();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-[32px] font-bold text-white"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Platform Overview
          </motion.h1>
          <p className="mt-1 text-sm text-white/60">
            Real-time insights across users, properties, and rent payments.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live data
        </div>
      </div>

      {/* Hero stats */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross Volume"
          value={formatCurrency(stats?.gross_payment_volume ?? 0)}
          sublabel={`${stats?.paid_count ?? 0} paid invoices`}
          icon={<DollarSign size={18} />}
          featured
          gradient="from-primary via-violet-600 to-purple-700"
          delay={0}
        />
        <StatCard
          label="Platform Revenue"
          value={formatCurrency(stats?.platform_revenue ?? 0)}
          sublabel="1.5% per payment"
          icon={<TrendingUp size={18} />}
          gradient="from-emerald-500 to-green-600"
          delay={0.06}
        />
        <StatCard
          label="Total Users"
          value={String(stats?.total_users ?? 0)}
          sublabel={`${stats?.total_landlords ?? 0} landlords · ${stats?.total_tenants ?? 0} tenants`}
          icon={<Users size={18} />}
          gradient="from-blue-500 to-cyan-600"
          delay={0.12}
        />
        <StatCard
          label="Active Leases"
          value={String(stats?.active_leases ?? 0)}
          sublabel={`${stats?.occupied_properties ?? 0} occupied units`}
          icon={<ScrollText size={18} />}
          gradient="from-amber-500 to-orange-600"
          delay={0.18}
        />
      </div>

      {/* Secondary stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Properties",
            value: stats?.total_properties ?? 0,
            sub: `${stats?.listed_properties ?? 0} listed`,
            icon: <Building2 size={14} />,
          },
          {
            label: "Applications",
            value: stats?.total_applications ?? 0,
            sub: `${stats?.approved_applications ?? 0} approved`,
            icon: <FileText size={14} />,
          },
          {
            label: "Payments Pending",
            value: stats?.pending_count ?? 0,
            sub: "awaiting collection",
            icon: <Clock size={14} />,
          },
          {
            label: "Payments Overdue",
            value: stats?.overdue_count ?? 0,
            sub: "escalated",
            icon: <AlertTriangle size={14} />,
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 + i * 0.04 }}
            className="rounded-[16px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
              {s.icon}
              {s.label}
            </div>
            <p className="mt-1 text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[11px] text-white/40">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            <Link
              href="/admin/activity"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-white"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {(activity ?? []).slice(0, 10).map((item, i) => (
              <motion.div
                key={`${item.kind}-${item.timestamp}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.03 }}
                className="flex items-start gap-3 rounded-[12px] border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                    item.kind === "user_registered"
                      ? "bg-blue-400"
                      : item.kind === "rent_payment"
                        ? "bg-emerald-400"
                        : "bg-violet-400"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-white">{item.message}</p>
                  <p className="text-[10px] text-white/40">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
            {(!activity || activity.length === 0) && (
              <p className="py-8 text-center text-sm text-white/40">No activity yet</p>
            )}
          </div>
        </motion.div>

        {/* Payment breakdown card */}
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-[20px] border border-white/10 bg-gradient-to-br from-[#0F1B33] to-[#0B1628] p-6"
        >
          <h2 className="text-base font-semibold text-white">Payment Health</h2>
          <p className="mt-1 text-xs text-white/60">Collection status at a glance</p>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Paid</span>
                <span className="font-semibold text-emerald-400">
                  {stats?.paid_count ?? 0}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
                  style={{
                    width: `${pctOf(stats?.paid_count, stats?.paid_count, stats?.pending_count, stats?.overdue_count)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Pending</span>
                <span className="font-semibold text-amber-400">{stats?.pending_count ?? 0}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                  style={{
                    width: `${pctOf(stats?.pending_count, stats?.paid_count, stats?.pending_count, stats?.overdue_count)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Overdue</span>
                <span className="font-semibold text-red-400">{stats?.overdue_count ?? 0}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-400 to-rose-500"
                  style={{
                    width: `${pctOf(stats?.overdue_count, stats?.paid_count, stats?.pending_count, stats?.overdue_count)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[12px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
              <CheckCircle2 size={12} />
              Automated
            </div>
            <p className="mt-1 text-xs text-white/70">
              Daily reminders run at 9am UTC. Overdue payments are auto-flagged.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function pctOf(
  part: number | undefined,
  a: number | undefined,
  b: number | undefined,
  c: number | undefined,
): number {
  const total = (a ?? 0) + (b ?? 0) + (c ?? 0);
  if (!total) return 0;
  return Math.round(((part ?? 0) / total) * 100);
}
